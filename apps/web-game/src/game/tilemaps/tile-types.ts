import * as ex from 'excalibur'

export enum TileType {
  GRASS = 0,
  PATH = 1,
  WALL = 2,
  DOOR = 3,
  WATER = 4,
  TREE = 5,
}

export const TILE_COLORS: Record<TileType, ex.Color> = {
  [TileType.GRASS]: ex.Color.fromHex('#4a7c4e'),
  [TileType.PATH]: ex.Color.fromHex('#c9a66b'),
  [TileType.WALL]: ex.Color.fromHex('#5c5c5c'),
  [TileType.DOOR]: ex.Color.fromHex('#8b4513'),
  [TileType.WATER]: ex.Color.fromHex('#4a90a4'),
  [TileType.TREE]: ex.Color.fromHex('#2d5a27'),
}

export const WALKABLE_TILES: Set<TileType> = new Set([
  TileType.GRASS,
  TileType.PATH,
  TileType.DOOR,
])

export interface DoorData {
  x: number
  y: number
  targetRoom: string
  spawnX: number
  spawnY: number
}

export interface NpcSpawn {
  npcId: string
  x: number
  y: number
}

export interface RoomMap {
  id: string
  name: string
  width: number
  height: number
  tiles: TileType[][]
  doors: DoorData[]
  npcs: NpcSpawn[]
  hasWildEncounters: boolean
  encounterRate?: number
}
