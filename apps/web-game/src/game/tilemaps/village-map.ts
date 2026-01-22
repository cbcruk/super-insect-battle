import { TileType, type RoomMap } from './tile-types'

const T = TileType

function createTileGrid(rows: string[]): TileType[][] {
  const charToTile: Record<string, TileType> = {
    '.': T.GRASS,
    '#': T.WALL,
    'P': T.PATH,
    'D': T.DOOR,
    '~': T.WATER,
    'T': T.TREE,
  }

  return rows.map((row) =>
    row.split('').map((char) => charToTile[char] ?? T.GRASS)
  )
}

export const trainingGrounds: RoomMap = {
  id: 'training_grounds',
  name: 'Training Grounds',
  width: 25,
  height: 18,
  tiles: createTileGrid([
    '##########D##############',
    '#..........P............#',
    '#..PPPPPPPP.PPPPPPPPP...#',
    '#..P.................P..#',
    '#..P.................P..#',
    '#..P.................P..#',
    '#..P.................P..#',
    '#..P.................P..#',
    '#..P.................P..#',
    '#..PPPPPPPPPPPPPPPPPPP..D',
    '#.......................#',
    '#.......................#',
    '#.......................#',
    '#.......................#',
    '#.......................#',
    '#.......................#',
    'DPPPPPPPPPPPPPPPPPPPPPPP#',
    '#########################',
  ]),
  doors: [
    { x: 10, y: 0, targetRoom: 'village_square', spawnX: 11, spawnY: 16 },
    { x: 0, y: 16, targetRoom: 'forest_entrance', spawnX: 23, spawnY: 1 },
    { x: 24, y: 9, targetRoom: 'shop', spawnX: 1, spawnY: 9 },
  ],
  npcs: [{ npcId: 'trainer_kim', x: 12, y: 6 }],
  hasWildEncounters: false,
}

export const villageSquare: RoomMap = {
  id: 'village_square',
  name: 'Village Square',
  width: 25,
  height: 18,
  tiles: createTileGrid([
    '#########################',
    '#.......................#',
    '#..PPPPPPPPPPPPPPPPPPP..#',
    '#..P.................P..#',
    '#..P.................P..#',
    '#..P.....~~~~~.......P..#',
    '#..P.....~~~~~.......P..#',
    '#..P.....~~~~~.......P..#',
    '#..P.................P..#',
    '#..PPPPPPPPPPPPPPPPPPP..D',
    '#..P.................P..#',
    '#..P.................P..#',
    '#..P.................P..#',
    '#..P.................P..#',
    '#..P.................P..#',
    '#..PPPPPPPPPPPPPPPPPPP..#',
    '#..........P............#',
    '###########D#############',
  ]),
  doors: [
    { x: 11, y: 17, targetRoom: 'training_grounds', spawnX: 10, spawnY: 1 },
    { x: 24, y: 9, targetRoom: 'insect_center', spawnX: 1, spawnY: 9 },
  ],
  npcs: [{ npcId: 'old_man', x: 8, y: 8 }],
  hasWildEncounters: false,
}

export const insectCenter: RoomMap = {
  id: 'insect_center',
  name: 'Insect Center',
  width: 25,
  height: 18,
  tiles: createTileGrid([
    '#########################',
    '#.......................#',
    '#..#################....#',
    '#..#...............#....#',
    '#..#...............#....#',
    '#..#...............#....#',
    '#..#...............#....#',
    '#..#####.....#######....#',
    '#........PPP............#',
    'D........PPP............#',
    '#........PPP............#',
    '#.......................#',
    '#.......................#',
    '#.......................#',
    '#.......................#',
    '#.......................#',
    '#.......................#',
    '#########################',
  ]),
  doors: [{ x: 0, y: 9, targetRoom: 'village_square', spawnX: 23, spawnY: 9 }],
  npcs: [{ npcId: 'nurse_joy', x: 12, y: 5 }],
  hasWildEncounters: false,
}

export const shop: RoomMap = {
  id: 'shop',
  name: 'Shop',
  width: 25,
  height: 18,
  tiles: createTileGrid([
    '#########################',
    '#.......................#',
    '#..#################....#',
    '#..#...............#....#',
    '#..#...............#....#',
    '#..#...............#....#',
    '#..#...............#....#',
    '#..#####.....#######....#',
    '#........PPP............#',
    'D........PPP............#',
    '#........PPP............#',
    '#.......................#',
    '#.......................#',
    '#.......................#',
    '#.......................#',
    '#.......................#',
    '#.......................#',
    '#########################',
  ]),
  doors: [
    { x: 0, y: 9, targetRoom: 'training_grounds', spawnX: 23, spawnY: 16 },
  ],
  npcs: [{ npcId: 'shopkeeper', x: 12, y: 5 }],
  hasWildEncounters: false,
}

export const forestEntrance: RoomMap = {
  id: 'forest_entrance',
  name: 'Forest Entrance',
  width: 25,
  height: 18,
  tiles: createTileGrid([
    'TTTTTTTTTTTTTTTTTTTTTTTTT',
    'T.......................D',
    'T..TTTTT.........TTTTT..T',
    'T..T.................T..T',
    'T..T.................T..T',
    'T......................TT',
    'T.......................T',
    'T.......................T',
    'T..T.................T..T',
    'T..T.................T..T',
    'T..TTTTT.........TTTTT..T',
    'T.......................T',
    'T.......................T',
    'T..TT.............TT....T',
    'T..T.................T..T',
    'T..T.................T..T',
    'T.......................T',
    'TTTTTTTTTTTTTTTTTTTTTTTTT',
  ]),
  doors: [{ x: 24, y: 1, targetRoom: 'training_grounds', spawnX: 1, spawnY: 16 }],
  npcs: [],
  hasWildEncounters: true,
  encounterRate: 0.15,
}

export const villageMaps: Record<string, RoomMap> = {
  training_grounds: trainingGrounds,
  village_square: villageSquare,
  insect_center: insectCenter,
  shop,
  forest_entrance: forestEntrance,
}

export function getRoomMap(roomId: string): RoomMap | undefined {
  return villageMaps[roomId]
}
