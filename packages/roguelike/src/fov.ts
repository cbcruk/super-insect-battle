import { FOV } from 'rot-js'
import type { TileMap } from './map'
import { inBounds, blocksSight } from './map'
import { posKey, type Vec2 } from './geometry'

export const SIGHT_RADIUS = 7

/**
 * 원점에서 보이는 타일 키 집합. rot.js 재귀 그림자투사(순수·결정론).
 * 수풀(blocksSight)이 시야를 끊어 은신 효과를 만든다.
 */
export function computeVisible(
  map: TileMap,
  origin: Vec2,
  radius: number = SIGHT_RADIUS
): Set<string> {
  const visible = new Set<string>()
  visible.add(posKey(origin.x, origin.y)) // 자기 칸은 항상 보임

  const fov = new FOV.RecursiveShadowcasting(
    (x, y) => inBounds(map, x, y) && !blocksSight(map, x, y)
  )
  fov.compute(origin.x, origin.y, radius, (x, y) => {
    if (inBounds(map, x, y)) visible.add(posKey(x, y))
  })

  return visible
}

/**
 * a → b 직선 시야 여부 (Bresenham). 중간 칸이 시야를 막으면 false.
 * 원거리 공격이 벽·빽빽한 덤불을 관통하지 못하게 한다.
 */
export function lineOfSight(map: TileMap, a: Vec2, b: Vec2): boolean {
  let x = a.x
  let y = a.y
  const dx = Math.abs(b.x - a.x)
  const dy = Math.abs(b.y - a.y)
  const sx = a.x < b.x ? 1 : -1
  const sy = a.y < b.y ? 1 : -1
  let err = dx - dy

  for (;;) {
    const isEndpoint = (x === a.x && y === a.y) || (x === b.x && y === b.y)
    if (!isEndpoint && blocksSight(map, x, y)) return false
    if (x === b.x && y === b.y) return true
    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x += sx
    }
    if (e2 < dx) {
      err += dx
      y += sy
    }
  }
}
