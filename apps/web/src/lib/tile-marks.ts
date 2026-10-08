import type { TerrainType } from '@super-insect-battle/roguelike'
import type { Silhouette, SilhouetteShape } from './insect-silhouette.types.ts'

/** 지형마다 준비해 둔 무늬 변형 수. 칸 좌표로 골라 같은 무늬가 줄지어 반복되지 않게 한다. */
export const MARK_VARIANTS = 4

function dot(cx: number, cy: number, r: number): SilhouetteShape {
  return { kind: 'ellipse', cx, cy, rx: r, ry: r }
}

function line(points: number[], width: number): SilhouetteShape {
  return { kind: 'line', points, width }
}

/**
 * 같은 지형 이웃이 있는 방향을 나타내는 비트 마스크.
 *
 * 벽은 이웃 벽 쪽으로 칸 끝까지 채워 이어진 암벽처럼, 물은 이웃 물 쪽으로 물결을 이어 그린다.
 */
export const NEIGHBOUR = { n: 1, e: 2, s: 4, w: 8 } as const

/**
 * 0 ~ MARK_VARIANTS-1 범위의 결정론적 변형 번호.
 *
 * 곱셈 해시의 하위 비트만 쓰면 4칸 주기 대각선 무늬가 생기므로 비트를 섞은 뒤 고른다.
 */
function variantAt(x: number, y: number): number {
  let h = Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1)
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  return ((h ^ (h >>> 16)) >>> 0) % MARK_VARIANTS
}

function floorMark(v: number): Silhouette {
  const spots = [
    [0, 0],
    [-2.4, 1.6],
    [2, -1.8],
    [1.4, 2.4],
  ]
  const [cx, cy] = spots[v]
  return [dot(cx, cy, 1)]
}

function rockOutline(mask: number, v: number): number[] {
  const inset = [2.4, 3, 2.6, 3.2][v]
  const top = mask & NEIGHBOUR.n ? -10 : -10 + inset
  const right = mask & NEIGHBOUR.e ? 10 : 10 - inset
  const bottom = mask & NEIGHBOUR.s ? 10 : 10 - inset
  const left = mask & NEIGHBOUR.w ? -10 : -10 + inset
  const cut = 2.4
  const corner = (
    x: number,
    y: number,
    openX: boolean,
    openY: boolean,
    dx: number,
    dy: number,
    clockwiseFromY: boolean
  ): number[] => {
    if (!openX || !openY) return [x, y]
    const alongX = [x + dx * cut, y]
    const alongY = [x, y + dy * cut]
    return clockwiseFromY ? [...alongY, ...alongX] : [...alongX, ...alongY]
  }
  const openN = !(mask & NEIGHBOUR.n)
  const openE = !(mask & NEIGHBOUR.e)
  const openS = !(mask & NEIGHBOUR.s)
  const openW = !(mask & NEIGHBOUR.w)
  return [
    ...corner(left, top, openW, openN, 1, 1, true),
    ...corner(right, top, openE, openN, -1, 1, false),
    ...corner(right, bottom, openE, openS, -1, -1, true),
    ...corner(left, bottom, openW, openS, 1, -1, false),
  ]
}

function rockTexture(v: number): SilhouetteShape[] {
  return [
    [line([-4, -2.4, -0.6, -3.4, 1.8, -1], 0.9)],
    [dot(-3, 2.6, 1.1), dot(2.4, -2.2, 0.8)],
    [line([2.6, -4.4, 0.8, -0.6, 3, 3], 0.9), line([0.8, -0.6, -3, 0.4], 0.8)],
    [],
  ][v]
}

/** 이웃 벽 쪽은 칸 끝까지 채우고 트인 쪽만 안으로 들여, 벽이 이어지면 하나의 암벽으로 보인다. */
function wallMark(v: number, mask: number): Silhouette {
  return [
    { kind: 'polygon', points: rockOutline(mask, v), opacity: 0.7 },
    ...rockTexture(v),
  ]
}

function grassMark(v: number): Silhouette {
  const lean = [-1, 0.6, 1.2, -0.4][v]
  const blades = [
    line([-3.6, 7, -4.6 + lean, 0.4, -6.4 + lean, -3.6], 1.3),
    line([0, 7.4, 0.4 + lean, -1.4, 0 + lean, -7.2], 1.4),
    line([3.4, 7, 4.8 + lean, 1, 6.6 + lean, -3], 1.3),
  ]
  const keep = [
    [0, 1, 2],
    [0, 1],
    [1, 2],
    [0, 2],
  ][v]
  return keep.map((i) => blades[i])
}

/**
 * 물결은 행마다 같은 높이에서 칸 경계를 지나므로, 이웃 물 칸으로 끊김 없이 이어진다.
 * 변형마다 그리는 줄을 달리해 넓은 물이 줄무늬처럼 보이지 않게 한다.
 */
function waterMark(v: number, mask: number): Silhouette {
  const left = mask & NEIGHBOUR.w ? -10 : -6
  const right = mask & NEIGHBOUR.e ? 10 : 6
  const wave = (y: number): number[] => {
    const points: number[] = []
    for (let x = left; x <= right; x += 2.5) {
      const phase = Math.sin(((x + 10) / 20) * Math.PI * 2)
      points.push(x, y - phase * 1)
    }
    if (points[points.length - 2] !== right) {
      points.push(right, y - Math.sin(((right + 10) / 20) * Math.PI * 2))
    }
    return points
  }
  const rows = [[-3.4, 3.6], [-3.4], [3.6], [0.2]][v]
  return rows.map((y) => line(wave(y), 1.2))
}

function mudMark(v: number): Silhouette {
  const blobs = [
    [-3.4, -2, 3, 1.4, -0.4, 4],
    [2.6, -3, -3, 0.6],
    [-1.6, -3.6, 3.4, -0.4, -3.6, 3.2],
    [0.6, 0.4],
  ][v]
  const shapes: SilhouetteShape[] = []
  for (let i = 0; i < blobs.length; i += 2) {
    shapes.push({
      kind: 'ellipse',
      cx: blobs[i],
      cy: blobs[i + 1],
      rx: 1.8,
      ry: 1.1,
    })
  }
  return shapes
}

const TERRAIN_MARKS: Record<
  TerrainType,
  (variant: number, mask: number) => Silhouette
> = {
  floor: floorMark,
  wall: wallMark,
  tallgrass: grassMark,
  water: waterMark,
  mud: mudMark,
}

const CONNECTED: ReadonlySet<TerrainType> = new Set(['wall', 'water'])

const terrainCache = new Map<string, Silhouette>()

/**
 * 지형 칸에 그릴 무늬를 고른다.
 *
 * 같은 지형이라도 칸 좌표에 따라 {@linkcode MARK_VARIANTS}가지 변형 중 하나를
 * 결정론적으로 골라, 넓은 수풀이나 물이 벽지처럼 반복돼 보이지 않게 한다. 벽과 물은
 * `neighbours`({@linkcode NEIGHBOUR} 비트 마스크)에 따라 이웃과 이어 그린다.
 */
export function terrainMark(
  terrain: TerrainType,
  x: number,
  y: number,
  neighbours = 0
): Silhouette {
  const variant = variantAt(x, y)
  const mask = CONNECTED.has(terrain) ? neighbours : 0
  const key = `${terrain}:${variant}:${mask}`
  let mark = terrainCache.get(key)
  if (!mark) {
    mark = TERRAIN_MARKS[terrain](variant, mask)
    terrainCache.set(key, mark)
  }
  return mark
}

const NECTAR: Silhouette = [
  ...[0, 72, 144, 216, 288].map((deg): SilhouetteShape => {
    const rad = (deg * Math.PI) / 180
    return dot(Math.sin(rad) * 3.6, -Math.cos(rad) * 3.6, 2.4)
  }),
  dot(0, 0, 1.6),
]

const ROYAL_JELLY: Silhouette = [
  {
    kind: 'polygon',
    points: [
      0, -7, 3, -2.4, 4.6, 1.6, 3.4, 5.4, 0, 6.8, -3.4, 5.4, -4.6, 1.6, -3,
      -2.4,
    ],
  },
]

const ITEM_MARKS: Record<string, Silhouette> = {
  nectar: NECTAR,
  royal_jelly: ROYAL_JELLY,
}

/** 아이템 칸에 그릴 아이콘. 아이콘이 없는 아이템이면 `null`을 돌려 글리프로 그리게 한다. */
export function itemMark(itemId: string): Silhouette | null {
  return ITEM_MARKS[itemId] ?? null
}

/** 다음 층으로 내려가는 출구: 땅굴 입구와 아래 화살표. */
export const EXIT_MARK: Silhouette = [
  line([-6.4, 3, -4.6, 6.2, 0, 7.4, 4.6, 6.2, 6.4, 3], 1.4),
  line([0, -7.4, 0, 2.4], 1.6),
  line([-3.6, -1.4, 0, 2.6, 3.6, -1.4], 1.6),
]
