import type { Room } from '../game/types'

export const rooms: Record<string, Room> = {
  training_grounds: {
    id: 'training_grounds',
    name: '훈련장',
    description:
      '넓은 훈련장이다. 여러 트레이너들이 곤충과 함께 훈련하고 있다.\n' +
      '북쪽에 마을 광장이 보이고, 동쪽에 상점이 있다. 남쪽으로 가면 숲이 나온다.',
    exits: {
      북: 'village_square',
      동: 'shop',
      남: 'forest_entrance',
    },
    hasWildEncounters: false,
  },

  village_square: {
    id: 'village_square',
    name: '마을 광장',
    description:
      '마을의 중심 광장이다. 분수대 주변으로 사람들이 모여 있다.\n' +
      '곤충 센터가 보인다. 이곳에서 곤충을 회복시킬 수 있다.',
    exits: {
      남: 'training_grounds',
      동: 'insect_center',
    },
    hasWildEncounters: false,
  },

  insect_center: {
    id: 'insect_center',
    name: '곤충 센터',
    description:
      '곤충들을 치료해주는 센터다.\n' +
      '"heal" 명령어로 팀을 회복시킬 수 있다.',
    exits: {
      서: 'village_square',
    },
    hasWildEncounters: false,
  },

  shop: {
    id: 'shop',
    name: '곤충 상점',
    description:
      '다양한 아이템을 파는 상점이다.\n' +
      '(아직 상점 기능은 구현되지 않았다.)',
    exits: {
      서: 'training_grounds',
    },
    hasWildEncounters: false,
  },

  forest_entrance: {
    id: 'forest_entrance',
    name: '숲 입구',
    description:
      '울창한 숲의 입구다. 나뭇잎 사이로 다양한 곤충 소리가 들린다.\n' +
      '이곳에서 야생 곤충과 마주칠 수 있다.',
    exits: {
      북: 'training_grounds',
      남: 'deep_forest',
    },
    hasWildEncounters: true,
    wildInsects: ['grasshopper', 'stag_beetle'],
  },

  deep_forest: {
    id: 'deep_forest',
    name: '깊은 숲',
    description:
      '숲 깊숙한 곳이다. 강력한 곤충들이 서식한다고 한다.\n' +
      '조심해야 한다...',
    exits: {
      북: 'forest_entrance',
      동: 'cave_entrance',
    },
    hasWildEncounters: true,
    wildInsects: ['scorpion', 'rhinoceros_beetle'],
  },

  cave_entrance: {
    id: 'cave_entrance',
    name: '동굴 입구',
    description:
      '어두운 동굴 입구다. 안에서 이상한 소리가 들린다.\n' +
      '여기에는 특별한 곤충이 있다는 소문이 있다.',
    exits: {
      서: 'deep_forest',
    },
    hasWildEncounters: true,
    wildInsects: ['scorpion'],
  },
}

/** 방향 입력 정규화 매핑 (한글/영문 -> 표준 방향) */
export const directionAliases: Record<string, string> = {
  북: '북',
  남: '남',
  동: '동',
  서: '서',
  북쪽: '북',
  남쪽: '남',
  동쪽: '동',
  서쪽: '서',
  n: '북',
  s: '남',
  e: '동',
  w: '서',
  north: '북',
  south: '남',
  east: '동',
  west: '서',
}

/**
 * 방 ID로 방 정보 조회
 * @param roomId - 방 ID
 * @returns Room 객체 또는 undefined
 */
export function getRoom(roomId: string): Room | undefined {
  return rooms[roomId]
}

/**
 * 방향 입력 정규화 (n, north, 북쪽 -> 북)
 * @param input - 사용자 입력
 * @returns 표준 방향 (북/남/동/서) 또는 undefined
 */
export function normalizeDirection(input: string): string | undefined {
  return directionAliases[input.toLowerCase()]
}
