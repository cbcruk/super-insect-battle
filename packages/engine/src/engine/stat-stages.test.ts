import { describe, it, expect } from 'vitest'
import { createStatStages, applyStatStageChange, getStatMultiplier } from './stat-stages'
import { createBattleArthropod } from './battle-engine'
import { arthropods } from '../data/arthropods'

describe('StatStages', () => {
  describe('createStatStages', () => {
    it('initializes all stages to 0', () => {
      const stages = createStatStages()

      expect(stages.strength).toBe(0)
      expect(stages.defense).toBe(0)
      expect(stages.evasion).toBe(0)
    })
  })

  describe('applyStatStageChange', () => {
    it('increases stat stage', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      const result = applyStatStageChange(arthropod, 'defense', 2)

      expect(result.applied).toBe(true)
      expect(arthropod.statStages.defense).toBe(2)
      expect(result.message).toContain('방어력')
      expect(result.message).toContain('올랐다')
    })

    it('decreases stat stage', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      const result = applyStatStageChange(arthropod, 'evasion', -1)

      expect(result.applied).toBe(true)
      expect(arthropod.statStages.evasion).toBe(-1)
      expect(result.message).toContain('회피력')
      expect(result.message).toContain('내려갔다')
    })

    it('clamps at +6', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statStages.strength = 5

      const result = applyStatStageChange(arthropod, 'strength', 3)

      expect(arthropod.statStages.strength).toBe(6)
      expect(result.applied).toBe(true)
    })

    it('clamps at -6', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statStages.evasion = -5

      const result = applyStatStageChange(arthropod, 'evasion', -3)

      expect(arthropod.statStages.evasion).toBe(-6)
      expect(result.applied).toBe(true)
    })

    it('returns not applied when already at max', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statStages.strength = 6

      const result = applyStatStageChange(arthropod, 'strength', 1)

      expect(result.applied).toBe(false)
      expect(result.message).toContain('더 이상 오를 수 없다')
    })

    it('returns not applied when already at min', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statStages.defense = -6

      const result = applyStatStageChange(arthropod, 'defense', -1)

      expect(result.applied).toBe(false)
      expect(result.message).toContain('더 이상 내려갈 수 없다')
    })
  })

  describe('getStatMultiplier', () => {
    it('returns 1.0 for stage 0', () => {
      expect(getStatMultiplier(0)).toBe(1.0)
    })

    it('returns higher multiplier for positive stages', () => {
      expect(getStatMultiplier(1)).toBe(1.5)
      expect(getStatMultiplier(2)).toBe(2.0)
      expect(getStatMultiplier(6)).toBe(4.0)
    })

    it('returns lower multiplier for negative stages', () => {
      expect(getStatMultiplier(-1)).toBe(0.67)
      expect(getStatMultiplier(-2)).toBe(0.5)
      expect(getStatMultiplier(-6)).toBe(0.25)
    })

    it('clamps out-of-range values', () => {
      expect(getStatMultiplier(10)).toBe(4.0)
      expect(getStatMultiplier(-10)).toBe(0.25)
    })
  })

  describe('integration with BattleArthropod', () => {
    it('BattleArthropod has statStages initialized', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)

      expect(arthropod.statStages).toBeDefined()
      expect(arthropod.statStages.strength).toBe(0)
      expect(arthropod.statStages.defense).toBe(0)
      expect(arthropod.statStages.evasion).toBe(0)
    })
  })
})
