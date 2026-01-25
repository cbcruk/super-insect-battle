import type { BattleArthropod, StatType, StatStages } from '../types/arthropod'

const STAGE_MULTIPLIERS: Record<number, number> = {
  [-6]: 0.25,
  [-5]: 0.29,
  [-4]: 0.33,
  [-3]: 0.4,
  [-2]: 0.5,
  [-1]: 0.67,
  [0]: 1.0,
  [1]: 1.5,
  [2]: 2.0,
  [3]: 2.5,
  [4]: 3.0,
  [5]: 3.5,
  [6]: 4.0,
}

const STAT_NAMES: Record<StatType, string> = {
  strength: '공격력',
  defense: '방어력',
  evasion: '회피력',
}

export function createStatStages(): StatStages {
  return { strength: 0, defense: 0, evasion: 0 }
}

export function applyStatStageChange(
  arthropod: BattleArthropod,
  stat: StatType,
  stages: number
): { applied: boolean; message: string } {
  const current = arthropod.statStages[stat]
  const newValue = Math.max(-6, Math.min(6, current + stages))

  if (newValue === current) {
    const direction = stages > 0 ? '더 이상 오를 수 없다' : '더 이상 내려갈 수 없다'
    return { applied: false, message: `${arthropod.base.nameKo}의 ${STAT_NAMES[stat]}은(는) ${direction}!` }
  }

  arthropod.statStages[stat] = newValue
  const direction = stages > 0 ? '올랐다' : '내려갔다'
  const absStages = Math.abs(stages)
  const stageText = absStages === 1 ? '' : ` ${absStages}단계`

  return {
    applied: true,
    message: `${arthropod.base.nameKo}의 ${STAT_NAMES[stat]}이(가)${stageText} ${direction}!`,
  }
}

export function getStatMultiplier(stages: number): number {
  const clamped = Math.max(-6, Math.min(6, stages))
  return STAGE_MULTIPLIERS[clamped] ?? 1
}
