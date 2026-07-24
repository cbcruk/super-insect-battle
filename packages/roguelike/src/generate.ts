import {
  createRng,
  getArthropodById,
  type Arthropod,
  type Environment,
  type Rng,
} from '@super-insect-battle/engine'
import type { Level, RunState } from './run'
import type { Actor } from './actor'
import { createActor } from './actor'
import { createSmartBrain } from './ai/smart-brain'
import { generateJungle } from './mapgen'
import { computeVisible } from './fov'
import { chebyshev, type Vec2 } from './geometry'
import { ENERGY_THRESHOLD } from './scheduler'

const MAP_WIDTH = 40
const MAP_HEIGHT = 22
const JUNGLE: Environment = {
  terrain: 'forest',
  timeOfDay: 'day',
  weather: 'clear',
}

const HOSTILE_IDS = [
  'scorpion',
  'centipede',
  'giant_hornet',
  'tarantula',
  'assassin_bug',
  'black_widow',
  'earwig',
  'antlion',
]

/** 플레이어 시야를 다시 계산하고 발견 영역에 누적. */
export function refreshFov(run: RunState): void {
  const visible = computeVisible(run.level.map, run.player.pos)
  run.level.visible = visible
  if (!run.level.discovered) run.level.discovered = new Set()
  for (const key of visible) run.level.discovered.add(key)
}

/** 절차적 밀림 레벨 1개 생성 (적 스폰 포함, 플레이어 제외). */
export function createGeneratedLevel(
  depth: number,
  rng: Rng
): { level: Level; entrance: Vec2 } {
  const { map, floors } = generateJungle({
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    rng,
  })

  const entrance = floors[Math.floor(rng() * floors.length)]
  const exit = farthestFrom(floors, entrance)

  const pool = HOSTILE_IDS.map((id) => getArthropodById(id)).filter(
    (a): a is Arthropod => a !== undefined
  )
  const spawnable = floors.filter(
    (f) => chebyshev(f, entrance) > 6 && !(f.x === exit.x && f.y === exit.y)
  )

  const enemies: Actor[] = []
  const count = depth + 1
  for (let i = 0; i < count && spawnable.length > 0; i++) {
    const spot = spawnable[Math.floor(rng() * spawnable.length)]
    const species = pool[Math.floor(rng() * pool.length)]
    enemies.push(
      createActor(`e${depth}_${i}`, species, spot, 'hostile', {
        glyph: species.name[0].toUpperCase(),
        brain: createSmartBrain(),
      })
    )
  }

  const level: Level = {
    depth,
    map,
    actors: enemies,
    environment: JUNGLE,
    exit,
    visible: new Set(),
    discovered: new Set(),
  }
  return { level, entrance }
}

/** 다음 존으로 진입: 레벨 생성 → 플레이어 배치 → 시야 계산. */
export function enterLevel(run: RunState, depth: number): void {
  const { level, entrance } = createGeneratedLevel(depth, run.rng)
  run.player.pos = { x: entrance.x, y: entrance.y }
  run.player.energy = ENERGY_THRESHOLD
  level.actors.unshift(run.player)
  run.level = level
  refreshFov(run)
}

/** 절차 생성 런 시작 (기본 3층). */
export function createGeneratedRun(opts: {
  playerSpecies: Arthropod
  seed: number
  maxDepth?: number
}): RunState {
  const run: RunState = {
    seed: opts.seed,
    rng: createRng(opts.seed),
    turn: 0,
    status: 'playing',
    level: {
      depth: 0,
      map: { width: 0, height: 0, tiles: [] },
      actors: [],
      environment: JUNGLE,
      exit: { x: 0, y: 0 },
      visible: new Set(),
      discovered: new Set(),
    },
    player: createActor(
      'player',
      opts.playerSpecies,
      { x: 0, y: 0 },
      'player',
      {
        glyph: '@',
      }
    ),
    log: [],
    maxDepth: opts.maxDepth ?? 3,
  }
  enterLevel(run, 1)
  return run
}

/** floors 중 from 에서 체비셰프 거리가 가장 먼 칸 (출구 배치용). */
function farthestFrom(floors: Vec2[], from: Vec2): Vec2 {
  let best = floors[0]
  let bestDist = -1
  for (const f of floors) {
    const d = chebyshev(f, from)
    if (d > bestDist) {
      bestDist = d
      best = f
    }
  }
  return best
}
