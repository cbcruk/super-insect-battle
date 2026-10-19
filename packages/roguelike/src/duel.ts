import {
  createRng,
  type Arthropod,
  type Environment,
} from '@super-insect-battle/engine'
import { createActor } from './actor'
import { createSmartBrain } from './ai/smart-brain'
import { safeZoneFor, spreadSpawns } from './arena'
import { HOSTILE_GLYPHS, refreshFov } from './generate'
import { generateJungle } from './mapgen'
import { emptyStats, type Level, type RunState } from './run'

const ARENA_WIDTH = 19
const ARENA_HEIGHT = 13
const GAS_SHRINK_START = 12
const GAS_SHRINK_EVERY = 2
const ARENA_ENV: Environment = {
  terrain: 'forest',
  timeOfDay: 'day',
  weather: 'clear',
}

/** {@linkcode createDuelRun} 옵션. */
export interface DuelOptions {
  playerSpecies: Arthropod
  opponentSpecies: Arthropod
  seed: number
  /**
   * 참이면 플레이어 쪽도 AI가 조종하는 AI 대 AI 매치업이 된다. 이때는 맵 전체가
   * 보인다. 기본은 플레이어가 직접 조종한다.
   */
  autopilot?: boolean
}

/**
 * 격자 매치업 런을 만든다: 작은 밀림 아레나 양 끝에 두 곤충을 세우고, 먼저
 * 쓰러지는 쪽이 진다.
 *
 * 규칙은 쇼다운과 같다. 위치·수풀 은신·사거리가 승패에 영향을 주고, 12턴부터
 * 2턴마다 독가스가 조여 와 도망만 쳐서는 판을 끌 수 없다.
 *
 * @example AI 대 AI
 * ```ts
 * import { getArthropodById } from '@super-insect-battle/engine'
 * import { createDuelRun } from '@super-insect-battle/roguelike'
 *
 * const run = createDuelRun({
 *   playerSpecies: getArthropodById('mantis')!,
 *   opponentSpecies: getArthropodById('scorpion')!,
 *   seed: 7,
 *   autopilot: true,
 * })
 * ```
 */
export function createDuelRun(opts: DuelOptions): RunState {
  const rng = createRng(opts.seed)
  const { map, floors } = generateJungle({
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
    rng,
    wallChance: 0.35,
    grass: { clusters: 4, size: 6 },
    water: { clusters: 2, size: 4 },
  })
  const [playerSpot, opponentSpot] = spreadSpawns(floors, 2, rng)

  const player = createActor(
    'player',
    opts.playerSpecies,
    playerSpot,
    'player',
    {
      glyph: '@',
      brain: opts.autopilot ? createSmartBrain({ hunt: true }) : undefined,
    }
  )
  const species = opts.opponentSpecies
  const opponent = createActor('opponent', species, opponentSpot, 'opponent', {
    glyph: HOSTILE_GLYPHS[species.id] ?? species.name[0].toUpperCase(),
    brain: createSmartBrain({ hunt: true }),
  })

  const level: Level = {
    depth: 1,
    map,
    actors: [player, opponent],
    environment: ARENA_ENV,
    exit: null,
    visible: new Set(),
    discovered: new Set(),
    zone: safeZoneFor(floors, map.width, map.height, {
      shrinkStart: GAS_SHRINK_START,
      shrinkEvery: GAS_SHRINK_EVERY,
    }),
  }
  const run: RunState = {
    seed: opts.seed,
    rng,
    turn: 0,
    status: 'playing',
    mode: 'duel',
    level,
    player,
    maxDepth: 1,
    log: [],
    stats: emptyStats(),
    fullVision: opts.autopilot,
  }
  refreshFov(run)
  return run
}

/** 진행 중인 런에서 플레이어 쪽 곤충을 AI가 조종하고 있는가. */
export function isAutopilot(run: RunState): boolean {
  return run.status === 'playing' && run.player.brain !== undefined
}

/** 격자 매치업의 판정. `'undecided'`는 아직 진행 중인 판. */
export type DuelOutcome = 'player' | 'opponent' | 'draw' | 'undecided'

/**
 * 격자 매치업의 승패를 생존자로 판정한다.
 *
 * 같은 턴에 둘 다 쓰러지면 먼저 쓰러진 쪽과 상관없이 무승부다. `run.status`는 먼저
 * 쓰러진 쪽만 보고 정해지므로 승패 표시에는 이 함수를 쓴다.
 */
export function duelOutcome(run: RunState): DuelOutcome {
  if (run.status === 'playing') return 'undecided'
  const playerAlive = run.player.combat.currentHp > 0
  const opponentAlive = run.level.actors.some(
    (a) => a !== run.player && a.combat.currentHp > 0
  )
  if (playerAlive && !opponentAlive) return 'player'
  if (opponentAlive && !playerAlive) return 'opponent'
  return 'draw'
}
