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

/** 0 ~ MARK_VARIANTS-1 범위의 결정론적 변형 번호. */
function variantAt(x: number, y: number): number {
  const h = (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0
  return h % MARK_VARIANTS
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

function wallMark(v: number): Silhouette {
  const stones = [
    [-7, -2, -4, -6.4, 2, -7, 6.6, -3, 7, 3.6, 2.6, 7, -4.6, 6.4, -7.4, 2.4],
    [-6.4, -4.6, 0, -7.2, 6, -5, 7.4, 1.8, 3.6, 6.8, -3, 7.2, -7.2, 2],
    [-7.4, 0, -5, -6, 3, -6.8, 7, -1.4, 5.4, 5.6, -1.6, 7.4, -6.6, 5],
    [-6.6, -3.4, -2, -7.4, 5, -6, 7.2, 0.6, 4.4, 6.4, -2.6, 6.6, -7.4, 3.6],
  ]
  return [
    { kind: 'polygon', points: stones[v], opacity: 0.7 },
    line([-3, -1.6, 0.6, -2.6, 3, -0.4], 0.9),
  ]
}

function grassMark(v: number): Silhouette {
  const lean = [-1, 0.6, 1.2, -0.4][v]
  return [
    line([-3.6, 7, -4.6 + lean, 0.4, -6.4 + lean, -3.6], 1.3),
    line([0, 7.4, 0.4 + lean, -1.4, 0 + lean, -7.2], 1.4),
    line([3.4, 7, 4.8 + lean, 1, 6.6 + lean, -3], 1.3),
  ]
}

function waterMark(v: number): Silhouette {
  const shift = [0, 1.6, -1.6, 0.8][v]
  const wave = (y: number, dx: number): number[] => [
    -6 + dx,
    y,
    -3 + dx,
    y - 1.6,
    0 + dx,
    y,
    3 + dx,
    y - 1.6,
    6 + dx,
    y,
  ]
  return [line(wave(-1.4, shift), 1.2), line(wave(3.6, -shift), 1.2)]
}

function mudMark(v: number): Silhouette {
  const blobs = [
    [-3.4, -2, 3, 1.4, -0.4, 4],
    [2.6, -3, -3, 0.6, 1.6, 3.8],
    [-1.6, -3.6, 3.4, -0.4, -3.6, 3.2],
    [0.6, -2.4, -3.4, 2.2, 3.4, 3],
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

const TERRAIN_MARKS: Record<TerrainType, (variant: number) => Silhouette> = {
  floor: floorMark,
  wall: wallMark,
  tallgrass: grassMark,
  water: waterMark,
  mud: mudMark,
}

const terrainCache = new Map<string, Silhouette>()

/**
 * 지형 칸에 그릴 무늬를 고른다.
 *
 * 같은 지형이라도 칸 좌표에 따라 {@linkcode MARK_VARIANTS}가지 변형 중 하나를
 * 결정론적으로 골라, 넓은 수풀이나 물이 벽지처럼 반복돼 보이지 않게 한다.
 */
export function terrainMark(
  terrain: TerrainType,
  x: number,
  y: number
): Silhouette {
  const variant = variantAt(x, y)
  const key = `${terrain}:${variant}`
  let mark = terrainCache.get(key)
  if (!mark) {
    mark = TERRAIN_MARKS[terrain](variant)
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
