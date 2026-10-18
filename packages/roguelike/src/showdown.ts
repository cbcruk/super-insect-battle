import {
  arthropodList,
  createRng,
  type Arthropod,
  type Environment,
  type Rng,
} from '@super-insect-battle/engine'
import { createActor, type Actor } from './actor'
import { createSmartBrain } from './ai/smart-brain'
import { isHostile } from './faction'
import { HOSTILE_GLYPHS, refreshFov } from './generate'
import { chebyshev, posKey, type Vec2 } from './geometry'
import { ITEM_IDS } from './items'
import { generateJungle } from './mapgen'
import type { Level, RunState } from './run'

const ARENA_SIZE = 30
const DEFAULT_RIVALS = 9
const ITEM_COUNT = 4
const ARENA_ENV: Environment = {
  terrain: 'forest',
  timeOfDay: 'day',
  weather: 'clear',
}

/** {@linkcode createShowdownRun} 옵션. */
export interface ShowdownOptions {
  playerSpecies: Arthropod
  seed: number
  /** 플레이어를 뺀 참가자 수 (기본 9). */
  rivals?: number
}

/**
 * 쇼다운 런을 만든다: 수풀이 많은 아레나 하나에 플레이어와 라이벌들이 흩어져
 * 서로 싸우고, 마지막까지 살아남으면 승리한다.
 *
 * 라이벌은 저마다 고유한 진영이라 플레이어뿐 아니라 서로도 적이다. 아무도 보이지
 * 않으면 가장 가까운 상대를 찾아 나서므로 숨어 있기만 해서는 판이 끝나지 않는다.
 *
 * @example
 * ```ts
 * import { getArthropodById } from '@super-insect-battle/engine'
 * import { createShowdownRun } from '@super-insect-battle/roguelike'
 *
 * const run = createShowdownRun({
 *   playerSpecies: getArthropodById('mantis')!,
 *   seed: 42,
 * })
 * ```
 */
export function createShowdownRun(opts: ShowdownOptions): RunState {
  const rng = createRng(opts.seed)
  const { map, floors } = generateJungle({
    width: ARENA_SIZE,
    height: ARENA_SIZE,
    rng,
    wallChance: 0.4,
    grass: { clusters: 14, size: 9 },
    water: { clusters: 3, size: 5 },
  })

  const rivalCount = opts.rivals ?? DEFAULT_RIVALS
  const spawns = spreadSpawns(floors, rivalCount + 1, rng)
  const player = createActor(
    'player',
    opts.playerSpecies,
    spawns[0],
    'player',
    { glyph: '@' }
  )
  const roster = shuffled(arthropodList, rng)
  const rivals: Actor[] = spawns.slice(1).map((spot, i) => {
    const species = roster[i % roster.length]
    const id = `rival_${i}`
    return createActor(id, species, spot, id, {
      glyph: HOSTILE_GLYPHS[species.id] ?? species.name[0].toUpperCase(),
      brain: createSmartBrain({ hunt: true }),
    })
  })

  const taken = new Set(spawns.map((s) => posKey(s.x, s.y)))
  for (let i = 0; i < ITEM_COUNT; i++) {
    const spot = floors[Math.floor(rng() * floors.length)]
    const key = posKey(spot.x, spot.y)
    if (taken.has(key)) continue
    taken.add(key)
    map.tiles[spot.y * map.width + spot.x].itemId =
      ITEM_IDS[Math.floor(rng() * ITEM_IDS.length)]
  }

  const level: Level = {
    depth: 1,
    map,
    actors: [player, ...rivals],
    environment: ARENA_ENV,
    exit: null,
    visible: new Set(),
    discovered: new Set(),
  }
  const run: RunState = {
    seed: opts.seed,
    rng,
    turn: 0,
    status: 'playing',
    mode: 'showdown',
    level,
    player,
    maxDepth: 1,
    log: [],
  }
  refreshFov(run)
  return run
}

/** 플레이어를 제외하고 아직 살아있는 라이벌 수. */
export function survivorCount(run: RunState): number {
  return run.level.actors.filter(
    (a) => a.combat.currentHp > 0 && isHostile(run.player, a)
  ).length
}

/**
 * 쇼다운에서 플레이어의 순위.
 *
 * 쓰러진 순간 살아남은 라이벌 수 + 1이 순위다. 진행 중이면 지금 쓰러졌을 때의
 * 순위, 승리했으면 1이다.
 */
export function showdownPlacement(run: RunState): number {
  return run.status === 'won' ? 1 : survivorCount(run) + 1
}

/**
 * floors 에서 count 칸을 서로 최대한 멀리 고른다 (최원점 샘플링).
 * 첫 칸만 무작위이고 나머지는 이미 고른 칸들과의 최소 거리가 가장 큰 칸이다.
 */
function spreadSpawns(floors: Vec2[], count: number, rng: Rng): Vec2[] {
  const chosen = [floors[Math.floor(rng() * floors.length)]]
  while (chosen.length < Math.min(count, floors.length)) {
    let best = floors[0]
    let bestDist = -1
    for (const f of floors) {
      const d = Math.min(...chosen.map((c) => chebyshev(c, f)))
      if (d > bestDist) {
        bestDist = d
        best = f
      }
    }
    chosen.push(best)
  }
  return chosen
}

function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
