import type { BehaviorStyle, WeaponType } from '../types/arthropod'
import { STYLE_MATCHUP, WEAPON_VS_ARMOR } from './generated/matchup.gen'

export function getStyleMatchup(
  attackerStyle: BehaviorStyle,
  defenderStyle: BehaviorStyle
): number {
  return STYLE_MATCHUP[attackerStyle][defenderStyle]
}

export function getWeightBonus(
  attackerWeightG: number,
  defenderWeightG: number
): number {
  const ratio = attackerWeightG / defenderWeightG

  if (ratio >= 2) {
    return 1.3
  }

  if (ratio <= 0.5) {
    return 0.7
  }

  if (ratio >= 1) {
    return 1 + (ratio - 1) * 0.3
  }

  return 1 - (1 - ratio) * 0.6
}

export function getWeaponVsArmorBonus(
  weaponType: WeaponType,
  armorRating: number
): number {
  const weaponStats = WEAPON_VS_ARMOR[weaponType]
  const armorThreshold = 60

  if (armorRating < armorThreshold) {
    return weaponStats.softBonus
  }

  return weaponStats.hardPenalty
}

export interface DamageFactors {
  styleMatchup: number
  weightBonus: number
  weaponVsArmor: number
  critical: boolean
  random: number
}

export function calculateTotalMultiplier(factors: DamageFactors): number {
  const critMultiplier = factors.critical ? 1.5 : 1
  return (
    factors.styleMatchup *
    factors.weightBonus *
    factors.weaponVsArmor *
    critMultiplier *
    factors.random
  )
}
