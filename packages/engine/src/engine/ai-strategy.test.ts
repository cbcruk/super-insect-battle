import { describe, it, expect } from 'vitest'
import { selectStrategicAIAction } from './ai-strategy'
import { createBattleArthropod } from './battle-engine'
import { arthropods } from '../data/arthropods'

describe('AIStrategy', () => {
  describe('selectStrategicAIAction', () => {
    it('returns a valid action', () => {
      const attacker = createBattleArthropod(arthropods.rhinoceros_beetle)
      const defender = createBattleArthropod(arthropods.stag_beetle)

      const action = selectStrategicAIAction(attacker, defender)

      expect(action).toBeDefined()
      expect(action.id).toBeDefined()
    })

    it('prefers flee/brace when HP is very low and actions available', () => {
      const attacker = createBattleArthropod(arthropods.scorpion)
      const defender = createBattleArthropod(arthropods.mantis)

      attacker.currentHp = Math.floor(attacker.maxHp * 0.2)
      attacker.actions = [...attacker.actions, 'flee', 'brace']

      let fleeOrBraceCount = 0
      for (let i = 0; i < 100; i++) {
        const action = selectStrategicAIAction(attacker, defender)
        if (action.id === 'flee' || action.id === 'brace') {
          fleeOrBraceCount++
        }
      }

      expect(fleeOrBraceCount).toBeGreaterThan(20)
    })

    it('does not select flee/brace when already in special mode', () => {
      const attacker = createBattleArthropod(arthropods.scorpion)
      const defender = createBattleArthropod(arthropods.mantis)

      attacker.currentHp = Math.floor(attacker.maxHp * 0.2)
      attacker.actions = [...attacker.actions, 'flee', 'brace']
      attacker.battleMode = 'flee'

      for (let i = 0; i < 50; i++) {
        const action = selectStrategicAIAction(attacker, defender)
        expect(action.id).not.toBe('flee')
        expect(action.id).not.toBe('brace')
      }
    })

    it('prefers poison attacks when opponent is not poisoned and attacker has venom', () => {
      const attacker = createBattleArthropod(arthropods.scorpion)
      const defender = createBattleArthropod(arthropods.rhinoceros_beetle)

      let venomCount = 0
      for (let i = 0; i < 100; i++) {
        const action = selectStrategicAIAction(attacker, defender)
        if (action.effect?.type === 'status' && action.effect.condition === 'poison') {
          venomCount++
        }
      }

      expect(venomCount).toBeGreaterThan(15)
    })

    it('reduces poison preference when opponent is already poisoned', () => {
      const attacker = createBattleArthropod(arthropods.scorpion)
      const defender = createBattleArthropod(arthropods.rhinoceros_beetle)

      let venomCountBefore = 0
      for (let i = 0; i < 100; i++) {
        const action = selectStrategicAIAction(attacker, defender)
        if (action.effect?.type === 'status' && action.effect.condition === 'poison') {
          venomCountBefore++
        }
      }

      defender.statusCondition = 'poison'

      let venomCountAfter = 0
      for (let i = 0; i < 100; i++) {
        const action = selectStrategicAIAction(attacker, defender)
        if (action.effect?.type === 'status' && action.effect.condition === 'poison') {
          venomCountAfter++
        }
      }

      expect(venomCountAfter).toBeLessThanOrEqual(venomCountBefore)
    })

    it('throws error when no actions available', () => {
      const attacker = createBattleArthropod(arthropods.rhinoceros_beetle)
      const defender = createBattleArthropod(arthropods.stag_beetle)

      attacker.actions = []

      expect(() => selectStrategicAIAction(attacker, defender)).toThrow('No actions available')
    })
  })
})
