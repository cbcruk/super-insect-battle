import type { BattleArthropod, BattleMode } from '../types/arthropod'

export const battleModeNames: Record<BattleMode, string> = {
  flee: '도망',
  brace: '움츠림',
}

export function applyBattleMode(
  arthropod: BattleArthropod,
  mode: BattleMode
): boolean {
  if (arthropod.battleMode !== null) {
    return false
  }

  arthropod.battleMode = mode
  arthropod.modeTurns = mode === 'flee' ? 2 : 3

  return true
}

export function getFleeEvasionBonus(arthropod: BattleArthropod): number {
  if (arthropod.battleMode === 'flee' && arthropod.modeTurns > 0) {
    return 50
  }
  return 0
}

export function getBraceDamageReduction(arthropod: BattleArthropod): number {
  if (arthropod.battleMode === 'brace' && arthropod.modeTurns > 0) {
    return 0.5
  }
  return 1
}

export function canAttackInMode(arthropod: BattleArthropod): boolean {
  if (arthropod.battleMode === 'brace' && arthropod.modeTurns > 0) {
    return false
  }
  return true
}

export function getAttackPenalty(arthropod: BattleArthropod): number {
  if (arthropod.battleMode === 'flee' && arthropod.modeTurns > 0) {
    return 0.5
  }
  return 1
}

export function processBattleModeEndOfTurn(arthropod: BattleArthropod): {
  message: string | null
} {
  if (arthropod.battleMode === null || arthropod.modeTurns <= 0) {
    return { message: null }
  }

  arthropod.modeTurns--

  if (arthropod.modeTurns === 0) {
    const modeName = battleModeNames[arthropod.battleMode]
    arthropod.battleMode = null
    return {
      message: `${arthropod.base.nameKo}의 ${modeName} 상태가 해제되었다!`,
    }
  }

  return { message: null }
}
