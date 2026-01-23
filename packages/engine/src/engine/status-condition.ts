import type { BattleArthropod, StatusCondition } from '../types/arthropod'

export const statusConditionNames: Record<StatusCondition, string> = {
  poison: '독',
  bind: '속박',
}

export function applyStatusCondition(
  target: BattleArthropod,
  condition: StatusCondition
): boolean {
  if (target.statusCondition !== null) {
    return false
  }

  target.statusCondition = condition

  if (condition === 'bind') {
    target.bindTurns = Math.floor(Math.random() * 3) + 2
  }

  return true
}

export function checkCanMove(arthropod: BattleArthropod): {
  canMove: boolean
  message: string | null
} {
  if (arthropod.statusCondition === 'bind') {
    if (arthropod.bindTurns > 0) {
      arthropod.bindTurns--

      if (arthropod.bindTurns === 0) {
        arthropod.statusCondition = null
        return {
          canMove: true,
          message: `${arthropod.base.nameKo}은(는) 속박에서 벗어났다!`,
        }
      }

      if (Math.random() < 0.5) {
        return {
          canMove: false,
          message: `${arthropod.base.nameKo}은(는) 속박되어 움직일 수 없다!`,
        }
      }
    }
  }

  return { canMove: true, message: null }
}

export function processEndOfTurnStatus(arthropod: BattleArthropod): {
  damage: number
  message: string | null
} {
  if (arthropod.statusCondition === 'poison') {
    const damage = Math.max(1, Math.floor(arthropod.maxHp / 8))
    arthropod.currentHp = Math.max(0, arthropod.currentHp - damage)

    return {
      damage,
      message: `${arthropod.base.nameKo}은(는) 독 데미지를 받았다!`,
    }
  }

  return { damage: 0, message: null }
}
