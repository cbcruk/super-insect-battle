import type { BattleInsect, StatusCondition } from '../types'

/**
 * 상태이상 한글명 매핑
 */
export const statusConditionNames: Record<StatusCondition, string> = {
  poison: '독',
  paralysis: '마비',
  sleep: '수면',
  burn: '화상',
}

/**
 * 상태이상 적용
 * 이미 상태이상이 있으면 적용되지 않음
 *
 * @param target - 상태이상을 적용할 곤충
 * @param condition - 적용할 상태이상
 * @returns 적용 성공 여부
 */
export function applyStatusCondition(
  target: BattleInsect,
  condition: StatusCondition
): boolean {
  if (target.statusCondition !== null) {
    return false
  }

  target.statusCondition = condition

  if (condition === 'sleep') {
    target.sleepTurns = Math.floor(Math.random() * 3) + 1
  }

  return true
}

/**
 * 행동 가능 여부 판정
 * 마비: 25% 확률로 행동 불가
 * 수면: 행동 불가, 턴 감소 후 깨어날 수 있음
 *
 * @param insect - 판정할 곤충
 * @returns 행동 가능 여부와 로그 메시지
 */
export function checkCanMove(insect: BattleInsect): {
  canMove: boolean
  message: string | null
} {
  if (insect.statusCondition === 'paralysis') {
    if (Math.random() < 0.25) {
      return {
        canMove: false,
        message: `${insect.base.nameKo}은(는) 마비되어 움직일 수 없다!`,
      }
    }
  }

  if (insect.statusCondition === 'sleep') {
    if (insect.sleepTurns > 0) {
      insect.sleepTurns--

      if (insect.sleepTurns === 0) {
        insect.statusCondition = null
        return {
          canMove: true,
          message: `${insect.base.nameKo}은(는) 눈을 떴다!`,
        }
      }

      return {
        canMove: false,
        message: `${insect.base.nameKo}은(는) 깊이 잠들어 있다...`,
      }
    }
  }

  return { canMove: true, message: null }
}

/**
 * 턴 종료 시 상태이상 데미지 처리
 * 독: 최대 HP의 1/8 데미지
 * 화상: 최대 HP의 1/16 데미지
 *
 * @param insect - 처리할 곤충
 * @returns 받은 데미지와 로그 메시지
 */
export function processEndOfTurnStatus(insect: BattleInsect): {
  damage: number
  message: string | null
} {
  if (insect.statusCondition === 'poison') {
    const damage = Math.max(1, Math.floor(insect.maxHp / 8))
    insect.currentHp = Math.max(0, insect.currentHp - damage)

    return {
      damage,
      message: `${insect.base.nameKo}은(는) 독 데미지를 받았다!`,
    }
  }

  if (insect.statusCondition === 'burn') {
    const damage = Math.max(1, Math.floor(insect.maxHp / 16))
    insect.currentHp = Math.max(0, insect.currentHp - damage)

    return {
      damage,
      message: `${insect.base.nameKo}은(는) 화상 데미지를 받았다!`,
    }
  }

  return { damage: 0, message: null }
}

/**
 * 화상으로 인한 공격력 감소 배율
 *
 * @param insect - 확인할 곤충
 * @returns 물리 공격력 배율 (화상 시 0.5, 그 외 1.0)
 */
export function getBurnAttackMultiplier(insect: BattleInsect): number {
  return insect.statusCondition === 'burn' ? 0.5 : 1.0
}

/**
 * 마비로 인한 스피드 감소 배율
 *
 * @param insect - 확인할 곤충
 * @returns 스피드 배율 (마비 시 0.5, 그 외 1.0)
 */
export function getParalysisSpeedMultiplier(insect: BattleInsect): number {
  return insect.statusCondition === 'paralysis' ? 0.5 : 1.0
}
