import type { Rng } from '@super-insect-battle/engine'
import { chebyshev, type Vec2 } from './geometry'
import type { SafeZone } from './zone'

/**
 * 아레나 정중앙에 가장 가까운 floor 를 중심으로, 모든 floor 를 덮는 안전 구역.
 * floors 는 연결된 한 영역이라 어느 칸에서든 중심까지 걸어갈 수 있다.
 */
export function safeZoneFor(
  floors: Vec2[],
  width: number,
  height: number,
  schedule: Pick<SafeZone, 'shrinkStart' | 'shrinkEvery'>
): SafeZone {
  const middle = { x: Math.floor(width / 2), y: Math.floor(height / 2) }
  let center = floors[0]
  for (const f of floors) {
    if (chebyshev(f, middle) < chebyshev(center, middle)) center = f
  }
  const initialRadius = Math.max(...floors.map((f) => chebyshev(f, center)))
  return { center, initialRadius, ...schedule }
}

/**
 * floors 에서 count 칸을 서로 최대한 멀리 고른다 (최원점 샘플링).
 * 첫 칸만 무작위이고 나머지는 이미 고른 칸들과의 최소 거리가 가장 큰 칸이다.
 */
export function spreadSpawns(floors: Vec2[], count: number, rng: Rng): Vec2[] {
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
