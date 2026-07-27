import type { TerrainType } from './terrain'
import { TERRAIN } from './terrain'

export interface Tile {
  terrain: TerrainType
  itemId?: string // 바닥 아이템 (P2+)
}

export interface TileMap {
  width: number
  height: number
  tiles: Tile[] // row-major, length = width * height
}

export function inBounds(map: TileMap, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < map.width && y < map.height
}

export function tileAt(map: TileMap, x: number, y: number): Tile | undefined {
  if (!inBounds(map, x, y)) return undefined
  return map.tiles[y * map.width + x]
}

export function isWalkable(map: TileMap, x: number, y: number): boolean {
  const tile = tileAt(map, x, y)
  return tile !== undefined && TERRAIN[tile.terrain].walkable
}

export function blocksSight(map: TileMap, x: number, y: number): boolean {
  const tile = tileAt(map, x, y)
  return tile === undefined || TERRAIN[tile.terrain].blocksSight
}

/**
 * 문자 그리드로부터 TileMap 생성. 수제 레벨(P1) 정의용.
 * 문자 → 지형: '.'=floor '#'=wall '"'=tallgrass '~'=water ','=mud
 */
export function tileMapFromStrings(rows: string[]): TileMap {
  const height = rows.length
  const width = Math.max(...rows.map((r) => r.length))
  const tiles: Tile[] = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ch = rows[y][x] ?? '#'
      tiles.push({ terrain: charToTerrain(ch) })
    }
  }

  return { width, height, tiles }
}

function charToTerrain(ch: string): TerrainType {
  switch (ch) {
    case '#':
      return 'wall'
    case '"':
      return 'tallgrass'
    case '~':
      return 'water'
    case ',':
      return 'mud'
    default:
      return 'floor'
  }
}
