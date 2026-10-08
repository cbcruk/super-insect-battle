import { SIGHT_RADIUS, type Vec2 } from '@super-insect-battle/roguelike'

/** 이 거리(칸)까지는 밝기가 줄지 않는다. */
export const FULL_LIGHT_RADIUS = 3

/** 시야 가장자리 칸의 밝기. 발견만 한 칸(0.4)보다 밝아야 경계가 구분된다. */
export const EDGE_LIGHT = 0.55

/** 발견했지만 지금은 보이지 않는 칸의 밝기. */
export const REMEMBERED_LIGHT = 0.4

/**
 * 플레이어에게서 떨어진 칸의 밝기를 계산한다.
 *
 * {@linkcode FULL_LIGHT_RADIUS}까지는 1, 그 너머로는 시야 가장자리에서
 * {@linkcode EDGE_LIGHT}가 되도록 부드럽게 어두워진다. 시야 경계가 칸 단위로 뚝
 * 끊기지 않고 원형으로 번져 보이게 한다.
 *
 * @returns {@linkcode EDGE_LIGHT}~1 사이의 불투명도.
 */
export function lightAt(origin: Vec2, x: number, y: number): number {
  const distance = Math.hypot(x - origin.x, y - origin.y)
  if (distance <= FULL_LIGHT_RADIUS) return 1
  const t = Math.min(
    1,
    (distance - FULL_LIGHT_RADIUS) / (SIGHT_RADIUS - FULL_LIGHT_RADIUS)
  )
  const ease = t * t * (3 - 2 * t)
  return 1 - (1 - EDGE_LIGHT) * ease
}
