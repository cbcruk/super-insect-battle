import type { Move } from '../types'

/**
 * 게임에서 사용 가능한 모든 스킬 데이터
 * 각 스킬은 고유 ID를 키로 사용
 *
 * 스킬 분류:
 * - physical: 물리 공격 (atk vs def)
 * - special: 특수 공격 (spAtk vs spDef)
 * - status: 변화 스킬 (데미지 없음, 효과만)
 *
 * @example
 * const megahorn = moves.megahorn
 * console.log(megahorn.power) // 120
 */
export const moves: Record<string, Move> = {
  megahorn: {
    id: 'megahorn',
    name: 'Megahorn',
    type: 'beetle',
    category: 'physical',
    power: 120,
    accuracy: 85,
    priority: 0,
    description: '거대한 뿔로 강력하게 들이받는다.',
  },
  lift_throw: {
    id: 'lift_throw',
    name: 'Lift & Throw',
    type: 'beetle',
    category: 'physical',
    power: 90,
    accuracy: 90,
    priority: 0,
    effect: {
      type: 'stat_change',
      target: 'opponent',
      stat: 'def',
      stages: -1,
    },
    description: '상대를 들어올려 내던진다. 상대의 방어가 떨어진다.',
  },
  horn_thrust: {
    id: 'horn_thrust',
    name: 'Horn Thrust',
    type: 'beetle',
    category: 'physical',
    power: 65,
    accuracy: 100,
    priority: 1,
    description: '날카로운 뿔로 빠르게 찌른다. 항상 먼저 공격한다.',
  },
  shell_fortify: {
    id: 'shell_fortify',
    name: 'Shell Fortify',
    type: 'beetle',
    category: 'status',
    power: 0,
    accuracy: 100,
    priority: 0,
    effect: {
      type: 'stat_change',
      target: 'self',
      stat: 'def',
      stages: 2,
    },
    description: '갑각을 단단히 굳혀 방어를 크게 올린다.',
  },
  scissor_cross: {
    id: 'scissor_cross',
    name: 'Scissor Cross',
    type: 'beetle',
    category: 'physical',
    power: 80,
    accuracy: 100,
    priority: 0,
    description: '집게로 X자로 베어가른다.',
  },
  pincer_grip: {
    id: 'pincer_grip',
    name: 'Pincer Grip',
    type: 'beetle',
    category: 'physical',
    power: 75,
    accuracy: 95,
    priority: 0,
    effect: {
      type: 'stat_change',
      target: 'opponent',
      stat: 'spd',
      stages: -1,
    },
    description: '집게로 꽉 조여 상대의 속도를 떨어뜨린다.',
  },
  iron_head: {
    id: 'iron_head',
    name: 'Iron Head',
    type: 'beetle',
    category: 'physical',
    power: 80,
    accuracy: 100,
    priority: 0,
    description: '단단한 머리로 들이받는다.',
  },
  sword_dance: {
    id: 'sword_dance',
    name: 'Sword Dance',
    type: 'beetle',
    category: 'status',
    power: 0,
    accuracy: 100,
    priority: 0,
    effect: {
      type: 'stat_change',
      target: 'self',
      stat: 'atk',
      stages: 2,
    },
    description: '전투의 춤을 춰 공격력을 크게 올린다.',
  },

  jump_kick: {
    id: 'jump_kick',
    name: 'Jump Kick',
    type: 'hopper',
    category: 'physical',
    power: 100,
    accuracy: 90,
    priority: 0,
    description: '높이 뛰어올라 강력하게 내리찍는다.',
  },
  quick_hop: {
    id: 'quick_hop',
    name: 'Quick Hop',
    type: 'hopper',
    category: 'physical',
    power: 50,
    accuracy: 100,
    priority: 1,
    description: '빠르게 뛰어올라 공격한다. 항상 먼저 공격한다.',
  },
  leg_sweep: {
    id: 'leg_sweep',
    name: 'Leg Sweep',
    type: 'hopper',
    category: 'physical',
    power: 65,
    accuracy: 95,
    priority: 0,
    effect: {
      type: 'stat_change',
      target: 'opponent',
      stat: 'spd',
      stages: -1,
    },
    description: '다리를 휘둘러 상대의 속도를 떨어뜨린다.',
  },
  agility: {
    id: 'agility',
    name: 'Agility',
    type: 'hopper',
    category: 'status',
    power: 0,
    accuracy: 100,
    priority: 0,
    effect: {
      type: 'stat_change',
      target: 'self',
      stat: 'spd',
      stages: 2,
    },
    description: '몸을 가볍게 하여 속도를 크게 올린다.',
  },

  venom_sting: {
    id: 'venom_sting',
    name: 'Venom Sting',
    type: 'venomous',
    category: 'physical',
    power: 85,
    accuracy: 100,
    priority: 0,
    effect: {
      type: 'status_condition',
      target: 'opponent',
      condition: 'poison',
    },
    description: '독침으로 찌른다. 상대를 독 상태로 만들 수 있다.',
  },
  poison_tail: {
    id: 'poison_tail',
    name: 'Poison Tail',
    type: 'venomous',
    category: 'physical',
    power: 90,
    accuracy: 90,
    priority: 0,
    description: '독이 묻은 꼬리로 강하게 내려친다.',
  },
  pincer_strike: {
    id: 'pincer_strike',
    name: 'Pincer Strike',
    type: 'venomous',
    category: 'physical',
    power: 70,
    accuracy: 100,
    priority: 0,
    description: '집게발로 빠르게 공격한다.',
  },
  toxic: {
    id: 'toxic',
    name: 'Toxic',
    type: 'venomous',
    category: 'status',
    power: 0,
    accuracy: 90,
    priority: 0,
    effect: {
      type: 'status_condition',
      target: 'opponent',
      condition: 'poison',
    },
    description: '맹독을 주입하여 상대를 독 상태로 만든다.',
  },
  scythe_slash: {
    id: 'scythe_slash',
    name: 'Scythe Slash',
    type: 'flying',
    category: 'physical',
    power: 95,
    accuracy: 95,
    priority: 0,
    description: '낫처럼 날카로운 앞다리로 베어가른다.',
  },
  quick_strike: {
    id: 'quick_strike',
    name: 'Quick Strike',
    type: 'flying',
    category: 'physical',
    power: 55,
    accuracy: 100,
    priority: 1,
    description: '눈에 보이지 않는 속도로 공격한다. 항상 먼저 공격한다.',
  },
  focus: {
    id: 'focus',
    name: 'Focus',
    type: 'flying',
    category: 'status',
    power: 0,
    accuracy: 100,
    priority: 0,
    effect: {
      type: 'stat_change',
      target: 'self',
      stat: 'atk',
      stages: 1,
    },
    description: '정신을 집중하여 공격력을 올린다.',
  },
  aerial_ace: {
    id: 'aerial_ace',
    name: 'Aerial Ace',
    type: 'flying',
    category: 'physical',
    power: 75,
    accuracy: 100,
    priority: 0,
    description: '하늘에서 내리꽂는다. 반드시 명중한다.',
  },
  earthquake: {
    id: 'earthquake',
    name: 'Earthquake',
    type: 'beetle',
    category: 'physical',
    power: 100,
    accuracy: 100,
    priority: 0,
    description: '땅을 강하게 내리쳐 지진을 일으킨다.',
  },
}

/**
 * 스킬 데이터를 배열로 변환한 목록
 * UI에서 스킬 목록을 순회할 때 사용
 *
 * @example
 * moveList.filter(move => move.type === 'beetle')
 */
export const moveList = Object.values(moves)

/**
 * ID로 스킬 데이터 조회
 *
 * @param id - 스킬 고유 식별자
 * @returns 스킬 데이터 또는 undefined (존재하지 않는 경우)
 *
 * @example
 * const move = getMoveById('megahorn')
 * if (move) {
 *   console.log(move.power) // 120
 * }
 */
export function getMoveById(id: string): Move | undefined {
  return moves[id]
}

/**
 * 여러 ID로 스킬 데이터 일괄 조회
 * 곤충의 보유 스킬 목록을 Move 객체 배열로 변환할 때 사용
 *
 * @param ids - 스킬 ID 배열
 * @returns 유효한 스킬 데이터 배열 (존재하지 않는 ID는 필터링됨)
 *
 * @example
 * const insect = insects.rhinoceros_beetle
 * const moves = getMovesByIds(insect.moves)
 * // ['megahorn', 'lift_throw', ...] → [Move, Move, ...]
 */
export function getMovesByIds(ids: string[]): Move[] {
  return ids.map((id) => moves[id]).filter((m): m is Move => m !== undefined)
}
