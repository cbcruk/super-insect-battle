import type { BattleArthropod, StatusCondition } from '../types/arthropod'

export const statusConditionNames: Record<StatusCondition, string> = {
  poison: '독',
  bind: '속박',
  paralysis: '마비',
  confusion: '혼란',
  sleep: '수면',
  burn: '화상',
}

export function applyStatusCondition(
  target: BattleArthropod,
  condition: StatusCondition,
  venomPotency: number = 50
): boolean {
  if (target.statusCondition !== null) {
    return false
  }

  target.statusCondition = condition

  if (condition === 'bind') {
    target.bindTurns = Math.floor(Math.random() * 3) + 2
  }

  if (condition === 'poison') {
    target.appliedVenomPotency = venomPotency
  }

  if (condition === 'sleep') {
    target.sleepTurns = Math.floor(Math.random() * 3) + 1
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

  if (arthropod.statusCondition === 'paralysis') {
    if (Math.random() < 0.25) {
      return {
        canMove: false,
        message: `${arthropod.base.nameKo}은(는) 마비되어 움직일 수 없다!`,
      }
    }
  }

  if (arthropod.statusCondition === 'confusion') {
    if (Math.random() < 0.33) {
      const selfDamage = Math.max(1, Math.floor(arthropod.maxHp / 16))
      arthropod.currentHp = Math.max(0, arthropod.currentHp - selfDamage)
      return {
        canMove: false,
        message: `${arthropod.base.nameKo}은(는) 혼란 속에 스스로를 공격했다! (${selfDamage} 데미지)`,
      }
    }
  }

  if (arthropod.statusCondition === 'sleep') {
    if (arthropod.sleepTurns > 0) {
      arthropod.sleepTurns--

      if (arthropod.sleepTurns === 0) {
        arthropod.statusCondition = null
        return {
          canMove: true,
          message: `${arthropod.base.nameKo}은(는) 잠에서 깨어났다!`,
        }
      }

      return {
        canMove: false,
        message: `${arthropod.base.nameKo}은(는) 깊이 잠들어 있다...`,
      }
    }
  }

  return { canMove: true, message: null }
}

export function getBurnStrengthPenalty(arthropod: BattleArthropod): number {
  if (arthropod.statusCondition === 'burn') {
    return 0.5
  }
  return 1.0
}

export function processEndOfTurnStatus(arthropod: BattleArthropod): {
  damage: number
  message: string | null
} {
  if (arthropod.statusCondition === 'poison') {
    const potencyMultiplier = arthropod.appliedVenomPotency / 50
    const damage = Math.max(1, Math.floor((arthropod.maxHp / 6) * potencyMultiplier))
    arthropod.currentHp = Math.max(0, arthropod.currentHp - damage)

    return {
      damage,
      message: `${arthropod.base.nameKo}은(는) 독 데미지를 받았다!`,
    }
  }

  if (arthropod.statusCondition === 'burn') {
    const damage = Math.max(1, Math.floor(arthropod.maxHp / 16))
    arthropod.currentHp = Math.max(0, arthropod.currentHp - damage)

    return {
      damage,
      message: `${arthropod.base.nameKo}은(는) 화상 데미지를 받았다!`,
    }
  }

  return { damage: 0, message: null }
}
