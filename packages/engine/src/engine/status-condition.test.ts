import { describe, it, expect, vi } from 'vitest'
import {
  applyStatusCondition,
  checkCanMove,
  processEndOfTurnStatus,
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
    it('deals 1/8 max HP damage for poison', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statusCondition = 'poison'
      const initialHp = arthropod.currentHp
      const expectedDamage = Math.floor(arthropod.maxHp / 8)

      const result = processEndOfTurnStatus(arthropod)

      expect(result.damage).toBe(expectedDamage)
      expect(arthropod.currentHp).toBe(initialHp - expectedDamage)
      expect(result.message).toContain('독 데미지')
    })

    it('no damage for bind status', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.statusCondition = 'bind'
      const initialHp = arthropod.currentHp

      const result = processEndOfTurnStatus(arthropod)

      expect(result.damage).toBe(0)
      expect(arthropod.currentHp).toBe(initialHp)
    })
  })
})
