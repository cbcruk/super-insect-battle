import type { BehaviorStyle, WeaponType } from '../types/arthropod'

const STYLE_MATCHUP: Record<BehaviorStyle, Record<BehaviorStyle, number>> = {
  grappler: {
    grappler: 1.0,
    striker: 1.2,
    venomous: 0.8,
    defensive: 1.0,
  },
  striker: {
    grappler: 0.8,
    striker: 1.0,
    venomous: 1.2,
    defensive: 1.0,
  },
  venomous: {
    grappler: 1.2,
    striker: 0.8,
    venomous: 1.0,
    defensive: 1.0,
  },
  defensive: {
    grappler: 1.0,
    striker: 1.0,
    venomous: 1.0,
    defensive: 1.0,
  },
}

const WEAPON_VS_ARMOR: Record<
  WeaponType,
  { softBonus: number; hardPenalty: number }
> = {
  horn: { softBonus: 1.1, hardPenalty: 0.9 },
  mandible: { softBonus: 1.0, hardPenalty: 1.0 },
  stinger: { softBonus: 1.3, hardPenalty: 0.7 },
  fang: { softBonus: 1.2, hardPenalty: 0.8 },
  foreleg: { softBonus: 1.1, hardPenalty: 0.85 },
  leg: { softBonus: 1.0, hardPenalty: 0.95 },
}

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
