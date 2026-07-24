export interface Vec2 {
  x: number
  y: number
}

export type Direction = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

export const DIRECTIONS: Direction[] = [
  'n',
  'ne',
  'e',
  'se',
  's',
  'sw',
  'w',
  'nw',
]

export const DIRECTION_DELTA: Record<Direction, Vec2> = {
  n: { x: 0, y: -1 },
  ne: { x: 1, y: -1 },
  e: { x: 1, y: 0 },
  se: { x: 1, y: 1 },
  s: { x: 0, y: 1 },
  sw: { x: -1, y: 1 },
  w: { x: -1, y: 0 },
  nw: { x: -1, y: -1 },
}

export function addDir(pos: Vec2, dir: Direction): Vec2 {
  const d = DIRECTION_DELTA[dir]
  return { x: pos.x + d.x, y: pos.y + d.y }
}

export function equals(a: Vec2, b: Vec2): boolean {
  return a.x === b.x && a.y === b.y
}

/** 8방향 격자 거리 (대각선 = 1). */
export function chebyshev(a: Vec2, b: Vec2): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}

/** from → to 로 향하는 8방향 (이미 같은 칸이면 null). */
export function dirToward(from: Vec2, to: Vec2): Direction | null {
  const dx = Math.sign(to.x - from.x)
  const dy = Math.sign(to.y - from.y)
  return deltaToDir(dx, dy)
}

/** from 에서 to 반대로 도망치는 8방향. */
export function dirAway(from: Vec2, to: Vec2): Direction | null {
  const dx = Math.sign(from.x - to.x)
  const dy = Math.sign(from.y - to.y)
  return deltaToDir(dx, dy)
}

function deltaToDir(dx: number, dy: number): Direction | null {
  for (const dir of DIRECTIONS) {
    const d = DIRECTION_DELTA[dir]
    if (d.x === dx && d.y === dy) return dir
  }
  return null
}
