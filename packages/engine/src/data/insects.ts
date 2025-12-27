import type { Insect } from '../types'

/**
 * 게임에서 사용 가능한 모든 곤충 데이터
 * 각 곤충은 고유 ID를 키로 사용
 *
 * @example
 * const rhinoceros = insects.rhinoceros_beetle
 * console.log(rhinoceros.nameKo) // '장수풍뎅이'
 */
export const insects: Record<string, Insect> = {
  rhinoceros_beetle: {
    id: 'rhinoceros_beetle',
    name: 'Rhinoceros Beetle',
    nameKo: '장수풍뎅이',
    type: 'beetle',
    baseStats: {
      hp: 95,
      atk: 130,
      def: 115,
      spAtk: 30,
      spDef: 70,
      spd: 45,
    },
    moves: ['megahorn', 'lift_throw', 'horn_thrust', 'shell_fortify'],
    description:
      '강력한 뿔과 단단한 갑각을 가진 갑충류의 왕. 힘으로 상대를 제압한다.',
  },
  stag_beetle: {
    id: 'stag_beetle',
    name: 'Stag Beetle',
    nameKo: '사슴벌레',
    type: 'beetle',
    baseStats: {
      hp: 75,
      atk: 120,
      def: 100,
      spAtk: 35,
      spDef: 80,
      spd: 70,
    },
    moves: ['scissor_cross', 'pincer_grip', 'iron_head', 'sword_dance'],
    description:
      '날카로운 집게로 상대를 조이는 기술파 갑충. 속도와 기술의 균형.',
  },
  grasshopper: {
    id: 'grasshopper',
    name: 'Grasshopper',
    nameKo: '메뚜기',
    type: 'hopper',
    baseStats: {
      hp: 65,
      atk: 90,
      def: 60,
      spAtk: 45,
      spDef: 65,
      spd: 120,
    },
    moves: ['jump_kick', 'quick_hop', 'leg_sweep', 'agility'],
    description: '뛰어난 도약력으로 상대를 번개처럼 공격하는 속도의 화신.',
  },
  scorpion: {
    id: 'scorpion',
    name: 'Scorpion',
    nameKo: '전갈',
    type: 'venomous',
    baseStats: {
      hp: 70,
      atk: 110,
      def: 95,
      spAtk: 85,
      spDef: 75,
      spd: 50,
    },
    moves: ['venom_sting', 'poison_tail', 'pincer_strike', 'toxic'],
    description: '치명적인 독침으로 상대를 서서히 무력화시키는 암살자.',
  },
  mantis: {
    id: 'mantis',
    name: 'Praying Mantis',
    nameKo: '사마귀',
    type: 'flying',
    baseStats: {
      hp: 70,
      atk: 115,
      def: 70,
      spAtk: 50,
      spDef: 70,
      spd: 95,
    },
    moves: ['scythe_slash', 'quick_strike', 'focus', 'aerial_ace'],
    description: '날카로운 앞다리로 순식간에 적을 베어버리는 냉혈한 사냥꾼.',
  },
  hercules_beetle: {
    id: 'hercules_beetle',
    name: 'Hercules Beetle',
    nameKo: '헤라클레스장수풍뎅이',
    type: 'beetle',
    baseStats: {
      hp: 100,
      atk: 150,
      def: 120,
      spAtk: 25,
      spDef: 65,
      spd: 40,
    },
    moves: ['megahorn', 'lift_throw', 'earthquake', 'shell_fortify'],
    description: '세계 최강의 갑충. 압도적인 힘으로 모든 것을 들어올린다.',
  },
}

/**
 * 곤충 데이터를 배열로 변환한 목록
 * UI에서 곤충 목록을 순회할 때 사용
 *
 * @example
 * insectList.forEach(insect => console.log(insect.nameKo))
 */
export const insectList = Object.values(insects)

/**
 * ID로 곤충 데이터 조회
 *
 * @param id - 곤충 고유 식별자
 * @returns 곤충 데이터 또는 undefined (존재하지 않는 경우)
 *
 * @example
 * const beetle = getInsectById('rhinoceros_beetle')
 * if (beetle) {
 *   console.log(beetle.baseStats.atk) // 130
 * }
 */
export function getInsectById(id: string): Insect | undefined {
  return insects[id]
}
