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
