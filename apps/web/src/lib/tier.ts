import type { Arthropod } from '@super-insect-battle/engine'

export type Tier = 'S' | 'A' | 'B' | 'C' | 'D'

export interface TierInfo {
  tier: Tier
  score: number
  color: string
}

// Tier thresholds based on total stat score (STR + ARM + EVA + WPN)
// Max possible: 100 + 100 + 100 + 100 = 400
const TIER_THRESHOLDS: { tier: Tier; min: number; color: string }[] = [
  { tier: 'S', min: 300, color: 'text-yellow-400' }, // 300+
  { tier: 'A', min: 260, color: 'text-purple-400' }, // 260-299
  { tier: 'B', min: 220, color: 'text-blue-400' }, // 220-259
  { tier: 'C', min: 180, color: 'text-green-400' }, // 180-219
  { tier: 'D', min: 0, color: 'text-gray-400' }, // 0-179
]

const DEFAULT_TIER = TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1]

export function calculateTier(arthropod: Arthropod): TierInfo {
  const score =
    arthropod.physical.strengthIndex +
    arthropod.defense.armorRating +
    arthropod.defense.evasion +
    arthropod.weapon.power

  const tierInfo =
    TIER_THRESHOLDS.find((t) => score >= t.min) ?? DEFAULT_TIER

  return {
    tier: tierInfo.tier,
    score,
    color: tierInfo.color,
  }
}
