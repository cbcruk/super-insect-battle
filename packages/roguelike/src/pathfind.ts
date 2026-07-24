import { Path } from 'rot-js'
import type { TileMap } from './map'
import { isWalkable } from './map'
import {
  addDir,
  chebyshev,
  dirToward,
  DIRECTIONS,
  type Direction,
  type Vec2,
} from './geometry'

export type Blocked = (x: number, y: number) => boolean

/**
 * from → to 최단 경로의 첫 걸음 방향. rot.js Dijkstra(8방향, 순수·결정론).
 * 목적지 칸은 점유돼 있어도 통과 허용(그 위 적을 향해 bump 하기 위함).
 * 도달 불가면 null.
 */
export function stepAlongPath(
  map: TileMap,
  from: Vec2,
  to: Vec2,
  blocked: Blocked
): Direction | null {
  const passable = (x: number, y: number): boolean => {
    if (x === to.x && y === to.y) return true
    return isWalkable(map, x, y) && !blocked(x, y)
  }

  const dijkstra = new Path.Dijkstra(to.x, to.y, passable, { topology: 8 })
  const path: Vec2[] = []
  dijkstra.compute(from.x, from.y, (x, y) => path.push({ x, y }))

  if (path.length < 2) return null // 도달 불가 또는 이미 도착
  return dirToward(from, path[1])
}

/** threat 로부터 가장 멀어지는 인접 이동 방향(도주). 갈 곳 없으면 null. */
export function fleeStep(
  map: TileMap,
  from: Vec2,
  threat: Vec2,
  blocked: Blocked
): Direction | null {
  let best: { dir: Direction; dist: number } | null = null

  for (const dir of DIRECTIONS) {
    const next = addDir(from, dir)
    if (!isWalkable(map, next.x, next.y) || blocked(next.x, next.y)) continue
    const dist = chebyshev(next, threat)
    if (!best || dist > best.dist) best = { dir, dist }
  }

  if (!best) return null
  return best.dist > chebyshev(from, threat) ? best.dir : null
}
