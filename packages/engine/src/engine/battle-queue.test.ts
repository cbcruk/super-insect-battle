import { describe, it, expect, vi } from 'vitest'
import { resolveActionOrder, type QueuedAction } from './battle-queue'
import { actions } from '../data/actions'

describe('BattleQueue', () => {
  describe('resolveActionOrder', () => {
    it('higher priority goes first', () => {
      const playerAction: QueuedAction = {
        source: 'player',
        action: actions.horn_thrust,
        priority: 2,
        aggression: 50,
      }
      const opponentAction: QueuedAction = {
        source: 'opponent',
        action: actions.scythe_strike,
        priority: 0,
        aggression: 80,
      }

      const [first, second] = resolveActionOrder(playerAction, opponentAction)

      expect(first.source).toBe('player')
      expect(second.source).toBe('opponent')
    })

    it('higher aggression goes first when priority is equal', () => {
      const playerAction: QueuedAction = {
        source: 'player',
        action: actions.horn_lift,
        priority: 0,
        aggression: 40,
      }
      const opponentAction: QueuedAction = {
        source: 'opponent',
        action: actions.scythe_strike,
        priority: 0,
        aggression: 80,
      }

      const [first, second] = resolveActionOrder(playerAction, opponentAction)

      expect(first.source).toBe('opponent')
      expect(second.source).toBe('player')
    })

    it('random tiebreaker when priority and aggression are equal', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.3)

      const playerAction: QueuedAction = {
        source: 'player',
        action: actions.horn_lift,
        priority: 0,
        aggression: 50,
      }
      const opponentAction: QueuedAction = {
        source: 'opponent',
        action: actions.scythe_strike,
        priority: 0,
        aggression: 50,
      }

      const [first] = resolveActionOrder(playerAction, opponentAction)

      expect(first.source).toBe('player')
    })
  })
})
