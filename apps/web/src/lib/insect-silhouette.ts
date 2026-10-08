import type { Arthropod, WeaponType } from '@super-insect-battle/engine'
import type { Silhouette, SilhouetteShape } from './insect-silhouette.types.ts'

/** 실루엣 좌표 공간의 한 변 길이. 칸 크기에 맞춰 이 값으로 나눠 확대한다. */
export const SILHOUETTE_SPAN = 20

const LEG = 1
const FEELER = 0.6

type Head = 'horn' | 'mandible' | 'none'

function ellipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  opacity?: number
): SilhouetteShape {
  return { kind: 'ellipse', cx, cy, rx, ry, opacity }
}

function line(points: number[], width = LEG): SilhouetteShape {
  return { kind: 'line', points, width }
}

function mirror(points: number[]): number[] {
  return points.map((v, i) => (i % 2 === 0 ? -v : v))
}

/** 오른쪽 부위를 그리고 왼쪽에 대칭으로 하나 더 붙인다. */
function pair(shape: SilhouetteShape): SilhouetteShape[] {
  if (shape.kind === 'ellipse') {
    return [shape, { ...shape, cx: -shape.cx }]
  }
  return [shape, { ...shape, points: mirror(shape.points) }]
}

function legs(rows: number[][], width = LEG): SilhouetteShape[] {
  return rows.flatMap((points) => pair(line(points, width)))
}

function feelers(points: number[]): SilhouetteShape[] {
  return pair(line(points, FEELER))
}

function headPiece(head: Head, y: number): SilhouetteShape[] {
  if (head === 'horn') {
    return [line([0, y, 0, y - 1.6, 1, y - 2.4], 1.4)]
  }
  if (head === 'mandible') {
    return pair(line([0.8, y, 2.4, y - 1.4, 0.9, y - 2.6], 1.2))
  }
  return []
}

function beetle(head: Head): Silhouette {
  return [
    ...legs([
      [2.6, -3.6, 5.6, -5.2, 6.6, -7.4],
      [3.4, -1, 6.6, -0.6, 7.8, -2],
      [3.4, 2, 6, 4.6, 6.8, 7.8],
    ]),
    ellipse(0, 2.4, 4.6, 5.4),
    ellipse(0, -3.4, 3.2, 2.2),
    ellipse(0, -6.2, 2, 1.5),
    ...headPiece(head, -7),
  ]
}

function spider(): Silhouette {
  return [
    ...legs([
      [2, -4, 5, -7, 7.4, -9],
      [2.6, -3, 6.4, -4.4, 9, -3.6],
      [2.6, -1.8, 6.4, -0.2, 8.8, 2],
      [2, -0.8, 5, 2.4, 6.6, 6.4],
    ]),
    ellipse(0, 3.6, 4.2, 4.8),
    ellipse(0, -2.6, 3, 2.8),
    ...pair(line([0.9, -5, 1.2, -6.6], 1.2)),
  ]
}

function scorpion(whipTail: boolean): Silhouette {
  const tail = whipTail
    ? [line([0, 4.6, 0.4, 7.4, 0, 9.8], FEELER)]
    : [
        line([0, 4.2, 0.8, 6.8, 2.2, 8.6, 4, 8.6, 4.8, 6.8], 1.5),
        ellipse(4.8, 6.2, 1, 1),
      ]
  return [
    ...legs([
      [2.4, -1.6, 5.4, -2.4, 6.6, -1],
      [2.6, 0, 5.8, 0.6, 6.8, 2.4],
      [2.4, 1.6, 5.2, 3.2, 5.8, 5.2],
      [2, 3, 4.2, 5.4, 4.4, 7.4],
    ]),
    ...pair(line([1.8, -4.6, 4.2, -6, 4.2, -7.6], 1.3)),
    ...pair(ellipse(4.2, -8.6, 1.7, 1.3)),
    ellipse(0, 0, 3, 4.6),
    ellipse(0, -4.4, 2.6, 1.6),
    ...tail,
  ]
}

function mantis(): Silhouette {
  return [
    ...legs([
      [0.8, 0, 4.4, -1, 6.6, 1.6],
      [0.8, 1.6, 4.4, 4, 5.4, 8.4],
    ]),
    ...pair(line([0.8, -4, 3.4, -6.4, 2, -9.4], 1.4)),
    ellipse(0, 4.4, 1.9, 4.6),
    ellipse(0, -2.2, 1, 3),
    ellipse(0, -6.4, 2.4, 1.3),
    ...feelers([0.8, -7.4, 2.8, -9.8]),
  ]
}

function centipede(forcipules: boolean): Silhouette {
  const segments: SilhouetteShape[] = []
  const rows: number[][] = []
  for (let i = 0; i < 7; i++) {
    const y = -6.4 + i * 2.25
    segments.push(ellipse(0, y, forcipules ? 2 : 2.4, 1.15))
    rows.push(forcipules ? [1.6, y, 4.4, y + 0.8] : [1.8, y, 3.6, y + 0.6])
  }
  return [
    ...legs(rows, forcipules ? 0.8 : 0.9),
    ...segments,
    ...(forcipules
      ? [
          ...pair(line([0.8, -7.2, 2, -8.6, 0.6, -9.6], 1)),
          ...feelers([0.6, -7.4, 3, -9.8]),
        ]
      : feelers([0.6, -7.4, 1.8, -9.2])),
  ]
}

function wasp(): Silhouette {
  return [
    ...pair({
      kind: 'polygon',
      points: [1.6, -4.4, 6.4, -6.2, 8, -3.4, 5.6, 1.6, 2, -2.2],
      opacity: 0.55,
    }),
    ...legs([
      [1.6, -3.4, 4, -2.4, 5, -4.4],
      [1.8, -2.6, 4.2, 0, 5.6, -0.2],
      [1.4, -1.8, 3.6, 2.8, 4.8, 5.4],
    ]),
    ellipse(0, 3.2, 2.6, 4.6),
    ellipse(0, -3.4, 2.2, 2),
    ellipse(0, -6.8, 1.9, 1.5),
    line([0, 7.4, 0, 9.6], 1),
    ...feelers([0.7, -7.8, 2.4, -9.8]),
  ]
}

function trueBug(raptorial: boolean): Silhouette {
  return [
    ...(raptorial
      ? pair(line([2, -3.6, 4.8, -5.2, 3.4, -8.4], 1.5))
      : legs([[1.6, -3.4, 4.6, -5.2, 6, -7.6]], 0.8)),
    ...legs(
      [
        [2, -1, 5.4, 0, 7.4, -1.6],
        [2, 1.4, 5, 4.6, 6.6, 8.4],
      ],
      0.8
    ),
    {
      kind: 'polygon',
      points: raptorial
        ? [0, -4.6, 3.6, -3, 4, 2, 2.6, 7, 0, 8, -2.6, 7, -4, 2, -3.6, -3]
        : [0, -3.8, 3.4, -2.4, 3, 4, 0, 7.4, -3, 4, -3.4, -2.4],
    },
    ellipse(0, raptorial ? -5.6 : -5.4, 1.4, raptorial ? 1.3 : 1.8),
    ...(raptorial ? [] : [line([0, -7, 0, -8.6], 0.8)]),
    ...feelers([0.6, -6.6, 2.8, -9.6]),
  ]
}

function hopper(): Silhouette {
  return [
    ...pair(line([1.6, 1.6, 5.2, -1.6, 6, 8.4], 1.5)),
    ...legs(
      [
        [1.4, -3.4, 3.8, -4.4, 4.6, -2.4],
        [1.6, -1.6, 4, -0.6, 4.2, 1.6],
      ],
      0.8
    ),
    ellipse(0, 1, 2, 6.2),
    ellipse(0, -6.2, 1.9, 1.7),
    ...feelers([0.8, -7.4, 3.6, -9.8]),
  ]
}

function roach(): Silhouette {
  return [
    ...legs(
      [
        [2.8, -2.6, 6, -3.6, 7.4, -6],
        [3.4, 0.6, 6.8, 1.4, 8.6, 0],
        [3, 3.6, 6, 6.6, 6.8, 9.6],
      ],
      0.8
    ),
    ellipse(0, 1.6, 3.8, 6.2),
    ellipse(0, -4.4, 3.2, 1.9),
    ...feelers([0.8, -6, 3.4, -8.6, 6.4, -9.6]),
  ]
}

function earwig(): Silhouette {
  return [
    ...legs([
      [1.6, -3.2, 4.4, -4.4, 5.4, -6.4],
      [1.8, -1.6, 4.6, -1, 5.8, -2.6],
      [1.8, 0, 4.4, 2, 5.2, 4.6],
    ]),
    ...pair(line([1, 5.2, 2.6, 7.6, 1.2, 9.8], 1.3)),
    ellipse(0, 0.6, 2.1, 5.4),
    ellipse(0, -6, 1.7, 1.5),
    ...feelers([0.6, -7.2, 2.8, -9.6]),
  ]
}

function antlionLarva(): Silhouette {
  return [
    ...legs(
      [
        [2.6, -2.6, 5, -3.6, 5.8, -5.2],
        [3.6, -0.6, 6.2, 0, 7.2, -1.4],
        [3.6, 1.6, 5.8, 3.6, 6.4, 5.4],
      ],
      0.9
    ),
    ellipse(0, 2.2, 4.6, 5.2),
    ellipse(0, -3.8, 2.2, 1.6),
    ...pair(line([1, -4.8, 3.6, -7, 1.4, -9.8], 1.3)),
  ]
}

const SPECIES_SILHOUETTES: Record<string, () => Silhouette> = {
  rhinoceros_beetle: () => beetle('horn'),
  dung_beetle: () => beetle('horn'),
  hercules_beetle: () => beetle('horn'),
  atlas_beetle: () => beetle('horn'),
  stag_beetle: () => beetle('mandible'),
  titan_beetle: () => beetle('mandible'),
  bombardier_beetle: () => beetle('none'),
  tarantula: spider,
  black_widow: spider,
  wolf_spider: spider,
  scorpion: () => scorpion(false),
  vinegaroon: () => scorpion(true),
  mantis,
  centipede: () => centipede(true),
  millipede: () => centipede(false),
  giant_hornet: wasp,
  jewel_wasp: wasp,
  assassin_bug: () => trueBug(false),
  water_bug: () => trueBug(true),
  grasshopper: hopper,
  cricket: hopper,
  cockroach: roach,
  earwig,
  antlion: antlionLarva,
}

const WEAPON_SILHOUETTES: Record<WeaponType, () => Silhouette> = {
  horn: () => beetle('horn'),
  mandible: () => beetle('mandible'),
  stinger: wasp,
  fang: spider,
  foreleg: mantis,
  leg: roach,
}

/**
 * 곤충 종의 실루엣을 고른다.
 *
 * 종별로 몸 구조(딱정벌레·거미·전갈·지네 등)를 정해 두었고, 목록에 없는 종은
 * 무기 종류로 가장 가까운 몸 구조를 고른다.
 */
export function silhouetteFor(
  species: Pick<Arthropod, 'id' | 'weapon'>
): Silhouette {
  const build =
    SPECIES_SILHOUETTES[species.id] ?? WEAPON_SILHOUETTES[species.weapon.type]
  return build()
}
