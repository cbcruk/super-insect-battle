import { describe, it, expect, vi } from 'vitest'
import {
  applyStatusCondition,
  checkCanMove,
  processEndOfTurnStatus,
  getBurnStrengthPenalty,
} from './status-condition'
import { createBattleArthropod } from './battle-engine'
import { arthropods } from '../data/arthropods'

describe('status-condition', () => {
  describe('applyStatusCondition', () => {
    it('applies poison to arthropod without status', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)

      const result = applyStatusCondition(arthropod, 'poison')

      expect(result).toBe(true)
      expect(arthropod.statusCondition).toBe('poison')
    })

    it('fails to apply when already has status', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statusCondition = 'poison'

      const result = applyStatusCondition(arthropod, 'bind')

      expect(result).toBe(false)
      expect(arthropod.statusCondition).toBe('poison')
    })

    it('sets bindTurns when applying bind (2-4 turns)', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)

      applyStatusCondition(arthropod, 'bind')

      expect(arthropod.statusCondition).toBe('bind')
      expect(arthropod.bindTurns).toBeGreaterThanOrEqual(2)
      expect(arthropod.bindTurns).toBeLessThanOrEqual(4)
    })
  })

  describe('checkCanMove', () => {
    it('allows movement without status condition', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)

      const result = checkCanMove(arthropod)

      expect(result.canMove).toBe(true)
      expect(result.message).toBeNull()
    })

    it('50% chance to be unable to move when bound', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statusCondition = 'bind'
      arthropod.bindTurns = 3

      vi.spyOn(Math, 'random').mockReturnValue(0.3)

      const result = checkCanMove(arthropod)

      expect(result.canMove).toBe(false)
      expect(result.message).toContain('속박')

      vi.restoreAllMocks()
    })

    it('can break free from bind when turns expire', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statusCondition = 'bind'
      arthropod.bindTurns = 1

      const result = checkCanMove(arthropod)

      expect(result.canMove).toBe(true)
      expect(result.message).toContain('벗어났다')
      expect(arthropod.statusCondition).toBeNull()
    })
  })

  describe('processEndOfTurnStatus', () => {
    it('deals poison damage based on venomPotency', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statusCondition = 'poison'
      arthropod.appliedVenomPotency = 50
      const initialHp = arthropod.currentHp
      const expectedDamage = Math.floor(arthropod.maxHp / 8)

      const result = processEndOfTurnStatus(arthropod)

      expect(result.damage).toBe(expectedDamage)
      expect(arthropod.currentHp).toBe(initialHp - expectedDamage)
      expect(result.message).toContain('독 데미지')
    })

    it('deals more damage with higher venomPotency', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statusCondition = 'poison'
      arthropod.appliedVenomPotency = 80
      const expectedDamage = Math.floor((arthropod.maxHp / 8) * (80 / 50))

      const result = processEndOfTurnStatus(arthropod)

      expect(result.damage).toBe(expectedDamage)
    })

    it('no damage for bind status', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statusCondition = 'bind'
      const initialHp = arthropod.currentHp

      const result = processEndOfTurnStatus(arthropod)

      expect(result.damage).toBe(0)
      expect(arthropod.currentHp).toBe(initialHp)
    })

    it('deals burn damage (maxHp / 16)', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statusCondition = 'burn'
      const initialHp = arthropod.currentHp
      const expectedDamage = Math.max(1, Math.floor(arthropod.maxHp / 16))

      const result = processEndOfTurnStatus(arthropod)

      expect(result.damage).toBe(expectedDamage)
      expect(arthropod.currentHp).toBe(initialHp - expectedDamage)
      expect(result.message).toContain('화상 데미지')
    })
  })

  describe('applyStatusCondition - new conditions', () => {
    it('applies paralysis', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)

      const result = applyStatusCondition(arthropod, 'paralysis')

      expect(result).toBe(true)
      expect(arthropod.statusCondition).toBe('paralysis')
    })

    it('applies confusion', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)

      const result = applyStatusCondition(arthropod, 'confusion')

      expect(result).toBe(true)
      expect(arthropod.statusCondition).toBe('confusion')
    })

    it('applies sleep and sets sleepTurns (1-3)', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)

      applyStatusCondition(arthropod, 'sleep')

      expect(arthropod.statusCondition).toBe('sleep')
      expect(arthropod.sleepTurns).toBeGreaterThanOrEqual(1)
      expect(arthropod.sleepTurns).toBeLessThanOrEqual(3)
    })

    it('applies burn', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)

      const result = applyStatusCondition(arthropod, 'burn')

      expect(result).toBe(true)
      expect(arthropod.statusCondition).toBe('burn')
    })
  })

  describe('checkCanMove - new conditions', () => {
    it('25% chance to be unable to move when paralyzed', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statusCondition = 'paralysis'

      vi.spyOn(Math, 'random').mockReturnValue(0.1)

      const result = checkCanMove(arthropod)

      expect(result.canMove).toBe(false)
      expect(result.message).toContain('마비')

      vi.restoreAllMocks()
    })

    it('allows movement when paralysis check passes', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statusCondition = 'paralysis'

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const result = checkCanMove(arthropod)

      expect(result.canMove).toBe(true)

      vi.restoreAllMocks()
    })

    it('33% chance to hurt self when confused', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statusCondition = 'confusion'
      const initialHp = arthropod.currentHp

      vi.spyOn(Math, 'random').mockReturnValue(0.1)

      const result = checkCanMove(arthropod)

      expect(result.canMove).toBe(false)
      expect(result.message).toContain('혼란')
      expect(arthropod.currentHp).toBeLessThan(initialHp)

      vi.restoreAllMocks()
    })

    it('cannot move while asleep', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statusCondition = 'sleep'
      arthropod.sleepTurns = 2

      const result = checkCanMove(arthropod)

      expect(result.canMove).toBe(false)
      expect(result.message).toContain('잠들어')
      expect(arthropod.sleepTurns).toBe(1)
    })

    it('wakes up when sleep turns expire', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statusCondition = 'sleep'
      arthropod.sleepTurns = 1

      const result = checkCanMove(arthropod)

      expect(result.canMove).toBe(true)
      expect(result.message).toContain('깨어났다')
      expect(arthropod.statusCondition).toBeNull()
    })
  })

  describe('getBurnStrengthPenalty', () => {
    it('returns 0.5 when burned', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statusCondition = 'burn'

      expect(getBurnStrengthPenalty(arthropod)).toBe(0.5)
    })

    it('returns 1.0 when not burned', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)

      expect(getBurnStrengthPenalty(arthropod)).toBe(1.0)
    })
  })
})
