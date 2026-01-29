import { describe, it, expect } from 'vitest'
import {
  isActionOnCooldown,
  getAvailableActions,
  startCooldown,
  tickCooldowns,
  getCooldownRemaining,
} from './cooldown'
import { createBattleArthropod } from './battle-engine'
import { arthropods } from '../data/arthropods'
import { getActionsByIds } from '../data/actions'
import type { Action } from '../types/action'

function createTestAction(overrides: Partial<Action> = {}): Action {
  return {
    id: 'test_action',
    name: 'Test Action',
    nameKo: 'test',
    category: 'attack',
    power: 80,
    accuracy: 90,
    priority: 0,
    cooldown: 2,
    description: 'test',
    ...overrides,
  }
}

describe('cooldown', () => {
  describe('isActionOnCooldown', () => {
    it('returns false when no cooldown set', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      const action = createTestAction()

      expect(isActionOnCooldown(arthropod, action)).toBe(false)
    })

    it('returns true when cooldown is active', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      const action = createTestAction()

      arthropod.actionCooldowns['test_action'] = 2

      expect(isActionOnCooldown(arthropod, action)).toBe(true)
    })
  })

  describe('startCooldown', () => {
    it('sets cooldown for action with cooldown > 0', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      const action = createTestAction({ cooldown: 3 })

      startCooldown(arthropod, action)

      expect(arthropod.actionCooldowns['test_action']).toBe(3)
    })

    it('does not set cooldown for action with cooldown 0', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      const action = createTestAction({ cooldown: 0 })

      startCooldown(arthropod, action)

      expect(arthropod.actionCooldowns['test_action']).toBeUndefined()
    })
  })

  describe('tickCooldowns', () => {
    it('decreases all cooldowns by 1', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.actionCooldowns = { action_a: 3, action_b: 1 }

      tickCooldowns(arthropod)

      expect(arthropod.actionCooldowns['action_a']).toBe(2)
      expect(arthropod.actionCooldowns['action_b']).toBeUndefined()
    })

    it('removes cooldowns at 0', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.actionCooldowns = { action_a: 1 }

      tickCooldowns(arthropod)

      expect(Object.keys(arthropod.actionCooldowns)).toHaveLength(0)
    })
  })

  describe('getAvailableActions', () => {
    it('filters out actions on cooldown', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      const actions = getActionsByIds(arthropod.actions)

      arthropod.actionCooldowns[actions[0].id] = 2

      const available = getAvailableActions(actions, arthropod)

      expect(available).toHaveLength(actions.length - 1)
      expect(available.find((a) => a.id === actions[0].id)).toBeUndefined()
    })

    it('returns all actions when none on cooldown', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      const actions = getActionsByIds(arthropod.actions)

      const available = getAvailableActions(actions, arthropod)

      expect(available).toHaveLength(actions.length)
    })
  })

  describe('getCooldownRemaining', () => {
    it('returns remaining turns', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)
      arthropod.actionCooldowns['test'] = 3

      expect(getCooldownRemaining(arthropod, 'test')).toBe(3)
    })

    it('returns 0 when no cooldown', () => {
      const arthropod = createBattleArthropod(arthropods.rhinoceros_beetle)

      expect(getCooldownRemaining(arthropod, 'test')).toBe(0)
    })
  })
})
