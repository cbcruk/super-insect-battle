import type { Rng } from '@super-insect-battle/engine'
import type { Tile, TileMap } from './map'
import type { TerrainType } from './terrain'
import type { Vec2 } from './geometry'

export interface GeneratedMap {
  map: TileMap
  /** 걸을 수 있는 칸들 (연결된 최대 영역). 배치·스폰에 사용. */
  floors: Vec2[]
}

export interface JungleOptions {
  width: number
  height: number
  rng: Rng
  /** 초기 벽 비율 (기본 0.45). */
  wallChance?: number
  /** CA 스무딩 반복 (기본 4). */
  iterations?: number
}

/**
 * 셀룰러 오토마타 기반 밀림 생성 — 우리 시드 rng만 사용하여 결정론 유지.
 * (rot.js는 RNG 없는 FOV·길찾기에만 쓴다.)
 */
export function generateJungle(opts: JungleOptions): GeneratedMap {
  const { width, height, rng } = opts
  const wallChance = opts.wallChance ?? 0.45
  const iterations = opts.iterations ?? 4
  const idx = (x: number, y: number): number => y * width + x
  const isBorder = (x: number, y: number): boolean =>
    x === 0 || y === 0 || x === width - 1 || y === height - 1

  // 1. 랜덤 초기화 (테두리 = 벽)
  let wall: boolean[] = new Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      wall[idx(x, y)] = isBorder(x, y) ? true : rng() < wallChance
    }
  }

  // 2. 셀룰러 오토마타 스무딩 (Moore 이웃 벽 >=5 → 벽)
  for (let iter = 0; iter < iterations; iter++) {
    const next = wall.slice()
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let count = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (wall[idx(x + dx, y + dy)]) count++
          }
        }
        next[idx(x, y)] = count >= 5
      }
    }
    wall = next
  }

  // 3. 최대 연결 영역(8방향)만 남기고 나머지는 벽으로
  const region = largestFloorRegion(wall, width, height, idx)
  for (let i = 0; i < wall.length; i++) {
    if (!wall[i] && !region.has(i)) wall[i] = true
  }

  // 4. 지형: 벽/땅 → 수풀·물 산포
  const terrain: TerrainType[] = wall.map((w) => (w ? 'wall' : 'floor'))
  const regionCells = [...region]
  scatterClusters(
    terrain,
    regionCells,
    width,
    height,
    idx,
    rng,
    'tallgrass',
    5,
    6
  )
  scatterClusters(terrain, regionCells, width, height, idx, rng, 'water', 3, 5)

  // 5. TileMap + floors(걸을 수 있는 칸)
  const tiles: Tile[] = terrain.map((t) => ({ terrain: t }))
  const floors: Vec2[] = regionCells.map((i) => ({
    x: i % width,
    y: Math.floor(i / width),
  }))

  return { map: { width, height, tiles }, floors }
}

/** 8방향 연결 최대 floor 영역의 셀 인덱스 집합. */
function largestFloorRegion(
  wall: boolean[],
  width: number,
  height: number,
  idx: (x: number, y: number) => number
): Set<number> {
  const seen = new Set<number>()
  let best = new Set<number>()

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const start = idx(x, y)
      if (wall[start] || seen.has(start)) continue

      const region = new Set<number>()
      const stack = [start]
      seen.add(start)
      while (stack.length > 0) {
        const cell = stack.pop() as number
        region.add(cell)
        const cx = cell % width
        const cy = Math.floor(cell / width)
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            const nx = cx + dx
            const ny = cy + dy
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
            const n = idx(nx, ny)
            if (wall[n] || seen.has(n)) continue
            seen.add(n)
            stack.push(n)
          }
        }
      }
      if (region.size > best.size) best = region
    }
  }
  return best
}

/** floor 영역에 특정 지형 덩어리를 산포 (rng 결정론). */
function scatterClusters(
  terrain: TerrainType[],
  regionCells: number[],
  width: number,
  height: number,
  idx: (x: number, y: number) => number,
  rng: Rng,
  type: TerrainType,
  clusters: number,
  size: number
): void {
  if (regionCells.length === 0) return
  for (let c = 0; c < clusters; c++) {
    let cell = regionCells[Math.floor(rng() * regionCells.length)]
    for (let s = 0; s < size; s++) {
      if (terrain[cell] === 'floor') terrain[cell] = type
      const cx = cell % width
      const cy = Math.floor(cell / width)
      const nx = cx + (Math.floor(rng() * 3) - 1)
      const ny = cy + (Math.floor(rng() * 3) - 1)
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
      const next = idx(nx, ny)
      if (terrain[next] !== 'wall') cell = next
    }
  }
}
