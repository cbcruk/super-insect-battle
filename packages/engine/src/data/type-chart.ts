import type { InsectType, TypeChart } from '../types'

/**
 * 타입 상성표
 * typeChart[공격 타입][방어 타입] = 데미지 배율
 *
 * 1.5 = 효과가 굉장했다!
 * 1.0 = 보통
 * 0.5 = 효과가 별로인 것 같다...
 * 0.0 = 효과가 없다 (면역)
 */
export const typeChart: TypeChart = {
  beetle: {
    beetle: 1.0,
    hopper: 1.5,
    flying: 1.0,
    swarm: 1.0,
    venomous: 0.5,
    survivor: 1.0,
    parasite: 1.0,
    luminous: 1.0,
  },
  hopper: {
    beetle: 0.5,
    hopper: 1.0,
    flying: 1.5,
    swarm: 1.0,
    venomous: 1.0,
    survivor: 1.0,
    parasite: 1.5,
    luminous: 1.0,
  },
  flying: {
    beetle: 1.0,
    hopper: 0.5,
    flying: 1.0,
    swarm: 1.5,
    venomous: 1.0,
    survivor: 1.0,
    parasite: 1.0,
    luminous: 1.0,
  },
  swarm: {
    beetle: 1.0,
    hopper: 1.0,
    flying: 0.5,
    swarm: 1.0,
    venomous: 1.0,
    survivor: 1.5,
    parasite: 1.0,
    luminous: 1.0,
  },
  venomous: {
    beetle: 1.5,
    hopper: 1.0,
    flying: 1.0,
    swarm: 1.0,
    venomous: 0.5,
    survivor: 0.5,
    parasite: 1.0,
    luminous: 1.0,
  },
  survivor: {
    beetle: 1.0,
    hopper: 1.0,
    flying: 1.0,
    swarm: 0.5,
    venomous: 1.5,
    survivor: 1.0,
    parasite: 1.0,
    luminous: 1.0,
  },
  parasite: {
    beetle: 1.0,
    hopper: 0.5,
    flying: 1.0,
    swarm: 1.0,
    venomous: 1.0,
    survivor: 1.5,
    parasite: 1.0,
    luminous: 0.5,
  },
  luminous: {
    beetle: 1.0,
    hopper: 1.0,
    flying: 1.0,
    swarm: 1.5,
    venomous: 0.5,
    survivor: 1.0,
    parasite: 1.5,
    luminous: 1.0,
  },
}

/**
 * 타입 상성 배율 조회
 * 공격 타입과 방어 타입 간의 데미지 배율을 반환
 *
 * @param attackType - 공격하는 스킬의 타입
 * @param defenseType - 방어하는 곤충의 타입
 * @returns 데미지 배율 (0.0, 0.5, 1.0, 1.5 중 하나)
 *
 * @example
 * getTypeEffectiveness('beetle', 'hopper')   // 1.5 (효과 굉장)
 * getTypeEffectiveness('beetle', 'venomous') // 0.5 (효과 별로)
 * getTypeEffectiveness('beetle', 'beetle')   // 1.0 (보통)
 */
export function getTypeEffectiveness(
  attackType: InsectType,
  defenseType: InsectType
): number {
  return typeChart[attackType][defenseType]
}

/**
 * 타입 상성 배율에 따른 한글 효과 텍스트 반환
 * 배틀 로그에 표시할 메시지를 생성
 *
 * @param multiplier - 타입 상성 배율
 * @returns 효과 설명 텍스트 (보통 효과는 빈 문자열)
 *
 * @example
 * getEffectivenessText(1.5) // '효과가 굉장했다!'
 * getEffectivenessText(0.5) // '효과가 별로인 것 같다...'
 * getEffectivenessText(1.0) // ''
 */
export function getEffectivenessText(multiplier: number): string {
  if (multiplier >= 1.5) return '효과가 굉장했다!'
  if (multiplier <= 0.5 && multiplier > 0) return '효과가 별로인 것 같다...'
  if (multiplier === 0) return '효과가 없는 것 같다...'
  return ''
}

/**
 * 타입 상성 배율을 효과 레벨 문자열로 변환
 * UI 표시나 로그 분류에 사용
 *
 * @param multiplier - 타입 상성 배율
 * @returns 효과 레벨 ('super' | 'normal' | 'not-very' | 'immune')
 *
 * @example
 * getEffectivenessLevel(1.5) // 'super'
 * getEffectivenessLevel(1.0) // 'normal'
 * getEffectivenessLevel(0.5) // 'not-very'
 * getEffectivenessLevel(0)   // 'immune'
 */
export function getEffectivenessLevel(
  multiplier: number
): 'super' | 'normal' | 'not-very' | 'immune' {
  if (multiplier >= 1.5) return 'super'
  if (multiplier === 0) return 'immune'
  if (multiplier < 1) return 'not-very'
  return 'normal'
}

/**
 * 곤충 타입의 한글명 매핑
 * UI에서 타입을 한글로 표시할 때 사용
 *
 * @example
 * typeNames['beetle']   // '갑충'
 * typeNames['venomous'] // '맹독'
 */
export const typeNames: Record<InsectType, string> = {
  beetle: '갑충',
  hopper: '도약',
  flying: '비행',
  swarm: '군체',
  venomous: '맹독',
  survivor: '생존',
  parasite: '기생',
  luminous: '발광',
}

/**
 * 곤충 타입의 이모지 매핑
 * UI에서 타입을 시각적으로 표시할 때 사용
 *
 * @example
 * typeEmoji['beetle']   // '🪲'
 * typeEmoji['venomous'] // '🦂'
 */
export const typeEmoji: Record<InsectType, string> = {
  beetle: '🪲',
  hopper: '🦗',
  flying: '🦋',
  swarm: '🐜',
  venomous: '🦂',
  survivor: '🪳',
  parasite: '🦟',
  luminous: '💡',
}
