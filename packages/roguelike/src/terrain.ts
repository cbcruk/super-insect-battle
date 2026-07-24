export type TerrainType = 'floor' | 'wall' | 'tallgrass' | 'water' | 'mud'

export interface TerrainProps {
  walkable: boolean
  blocksSight: boolean
  /** 이동 에너지 배수 (1 = 기본, >1 = 감속). P2 스케줄러에서 사용. */
  moveCost: number
  /** 이 타일에 선 액터의 회피 곱보정 (은신 등). 1 = 없음. */
  evasionMod: number
  /** ASCII 렌더 기본 글리프. */
  glyph: string
  nameKo: string
}

export const TERRAIN: Record<TerrainType, TerrainProps> = {
  floor: {
    walkable: true,
    blocksSight: false,
    moveCost: 1,
    evasionMod: 1,
    glyph: '.',
    nameKo: '땅',
  },
  wall: {
    walkable: false,
    blocksSight: true,
    moveCost: Infinity,
    evasionMod: 1,
    glyph: '#',
    nameKo: '덤불벽',
  },
  tallgrass: {
    walkable: true,
    blocksSight: true,
    moveCost: 1,
    evasionMod: 1.3, // 은신: 추가 회피
    glyph: '"',
    nameKo: '수풀',
  },
  water: {
    walkable: true,
    blocksSight: false,
    moveCost: 2, // 감속
    evasionMod: 1,
    glyph: '~',
    nameKo: '물',
  },
  mud: {
    walkable: true,
    blocksSight: false,
    moveCost: 2,
    evasionMod: 1,
    glyph: ',',
    nameKo: '진흙',
  },
}
