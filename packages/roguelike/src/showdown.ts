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
import { emptyStats, survivorCount, type Level, type RunState } from './run'
import type { SafeZone } from './zone'

const ARENA_SIZE = 30
const DEFAULT_RIVALS = 9
const ITEM_COUNT = 3
const CUBE_COUNT = 12
const GAS_SHRINK_START = 12
const GAS_SHRINK_EVERY = 3
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
 * 않으면 파워 큐브를 줍거나 가장 가까운 상대를 찾아 나선다.
 *
 * 12턴부터 독가스가 바깥에서 조여 와 결국 중심 한 칸만
 * 남으므로, 숨거나 도망치기만 해서는 판을 끌 수 없다.
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
  const freeSpot = (): Vec2 | null => {
    const spot = floors[Math.floor(rng() * floors.length)]
    const key = posKey(spot.x, spot.y)
    if (taken.has(key)) return null
    taken.add(key)
    return spot
  }
  for (let i = 0; i < ITEM_COUNT; i++) {
    const spot = freeSpot()
    if (!spot) continue
    map.tiles[spot.y * map.width + spot.x].itemId =
      ITEM_IDS[Math.floor(rng() * ITEM_IDS.length)]
  }
  for (let i = 0; i < CUBE_COUNT; i++) {
    const spot = freeSpot()
    if (spot) map.tiles[spot.y * map.width + spot.x].cubes = 1
  }

  const level: Level = {
    depth: 1,
    map,
    actors: [player, ...rivals],
    environment: ARENA_ENV,
    exit: null,
    visible: new Set(),
    discovered: new Set(),
    zone: safeZoneFor(floors, map.width, map.height),
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
    stats: emptyStats(),
  }
  refreshFov(run)
  return run
}

/**
 * 쇼다운에서 플레이어의 순위.
 *
 * 승패가 갈리면 그때 고정된 순위(쓰러진 순간 살아남은 라이벌 수 + 1, 승리면 1)이고,
 * 관전으로 라이벌이 더 줄어도 바뀌지 않는다. 진행 중이면 지금 쓰러졌을 때의 순위다.
 */
export function showdownPlacement(run: RunState): number {
  return run.stats.placement ?? survivorCount(run) + 1
}

/**
 * 플레이어가 쓰러진 뒤 끝까지 살아남은 라이벌. 아직 둘 이상 살아있거나 플레이어가
 * 이겼으면 null.
 */
export function showdownWinner(run: RunState): Actor | null {
  if (run.status !== 'dead') return null
  const alive = run.level.actors.filter(
    (a) => a.combat.currentHp > 0 && isHostile(run.player, a)
  )
  return alive.length === 1 ? alive[0] : null
}

/**
 * 아레나 정중앙에 가장 가까운 floor 를 중심으로, 모든 floor 를 덮는 안전 구역.
 * floors 는 연결된 한 영역이라 어느 칸에서든 중심까지 걸어갈 수 있다.
 */
function safeZoneFor(floors: Vec2[], width: number, height: number): SafeZone {
  const middle = { x: Math.floor(width / 2), y: Math.floor(height / 2) }
  let center = floors[0]
  for (const f of floors) {
    if (chebyshev(f, middle) < chebyshev(center, middle)) center = f
  }
  const initialRadius = Math.max(...floors.map((f) => chebyshev(f, center)))
  return {
    center,
    initialRadius,
    shrinkStart: GAS_SHRINK_START,
    shrinkEvery: GAS_SHRINK_EVERY,
  }
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
