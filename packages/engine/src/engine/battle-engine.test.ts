import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createBattleArthropod,
  calculateDamage,
  determineFirstAttacker,
  simulateBattle,
  simulateMultipleBattles,
  runInteractiveBattle,
} from './battle-engine'
import { arthropods } from '../data/arthropods'
import { actions } from '../data/actions'
import { createAIPlayer } from './ai-player'

describe('BattleEngine', () => {
  describe('createBattleArthropod', () => {
    it('creates battle state from arthropod', () => {
      const rhinoceros = arthropods.rhinoceros_beetle
      const battleArthropod = createBattleArthropod(rhinoceros)

      expect(battleArthropod.base).toBe(rhinoceros)
      expect(battleArthropod.currentHp).toBe(battleArthropod.maxHp)
      expect(battleArthropod.maxHp).toBeGreaterThanOrEqual(100)
      expect(battleArthropod.statusCondition).toBeNull()
      expect(battleArthropod.bindTurns).toBe(0)
    })

    it('calculates HP from strength and armor', () => {
      const rhinoceros = arthropods.rhinoceros_beetle
      const battleArthropod = createBattleArthropod(rhinoceros)

      const expectedHp = Math.floor(
        (rhinoceros.physical.strengthIndex + rhinoceros.defense.armorRating) *
          0.8 +
          100
      )
      expect(battleArthropod.maxHp).toBe(Math.max(150, expectedHp))
    })
  })

  describe('calculateDamage', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    it('returns 0 damage for defense actions with 0 power', () => {
      const attacker = createBattleArthropod(arthropods.rhinoceros_beetle)
      const defender = createBattleArthropod(arthropods.stag_beetle)
      const action = actions.shell_guard

      const result = calculateDamage(attacker, defender, action)

      expect(result.damage).toBe(0)
      expect(result.critical).toBe(false)
    })

    it('calculates damage using new formula', () => {
      const attacker = createBattleArthropod(arthropods.rhinoceros_beetle)
      const defender = createBattleArthropod(arthropods.mantis)
      const action = actions.horn_lift

      const result = calculateDamage(attacker, defender, action)

      expect(result.damage).toBeGreaterThan(0)
      expect(result.factors.styleMatchup).toBe(1.2)
    })

    it('guarantees minimum 1 damage', () => {
      const attacker = createBattleArthropod(arthropods.mantis)
      const defender = createBattleArthropod(arthropods.rhinoceros_beetle)
      const action = actions.hair_flick

      const result = calculateDamage(attacker, defender, action)

      expect(result.damage).toBeGreaterThanOrEqual(1)
    })
  })

  describe('determineFirstAttacker', () => {
    it('higher priority attacks first', () => {
      const player = createBattleArthropod(arthropods.rhinoceros_beetle)
      const opponent = createBattleArthropod(arthropods.mantis)
      const playerAction = actions.horn_thrust
      const opponentAction = actions.scythe_strike

      const first = determineFirstAttacker(
        player,
        opponent,
        playerAction,
        opponentAction
      )

      expect(first).toBe('player')
    })

    it('higher aggression attacks first when priority equal', () => {
      const player = createBattleArthropod(arthropods.centipede)
      const opponent = createBattleArthropod(arthropods.rhinoceros_beetle)
      const playerAction = actions.forcipule_bite
      const opponentAction = actions.horn_lift

      const first = determineFirstAttacker(
        player,
        opponent,
        playerAction,
        opponentAction
      )

      expect(first).toBe('player')
    })
  })

  describe('simulateBattle', () => {
    it('completes battle and determines winner', () => {
      const result = simulateBattle(
        arthropods.rhinoceros_beetle,
        arthropods.mantis
      )

      expect(result.status).toBe('finished')
      expect(['player', 'opponent', 'draw']).toContain(result.winner)
      expect(result.turn).toBeGreaterThan(0)
    })

    it('records battle log', () => {
      const result = simulateBattle(
        arthropods.rhinoceros_beetle,
        arthropods.stag_beetle
      )

      expect(result.log.length).toBeGreaterThan(0)
    })
  })

  describe('simulateMultipleBattles', () => {
    it('returns statistics for N battles', () => {
      const result = simulateMultipleBattles(
        arthropods.rhinoceros_beetle,
        arthropods.mantis,
        10
      )

      expect(result.playerWins + result.opponentWins + result.draws).toBe(10)
      expect(result.winRate).toBeGreaterThanOrEqual(0)
      expect(result.winRate).toBeLessThanOrEqual(100)
      expect(result.avgTurns).toBeGreaterThan(0)
    })
  })

  describe('runInteractiveBattle', () => {
    it('completes battle with two AI players', async () => {
      const player1 = createAIPlayer('medium')
      const player2 = createAIPlayer('medium')

      const result = await runInteractiveBattle(
        arthropods.rhinoceros_beetle,
        arthropods.mantis,
        player1,
        player2
      )

      expect(result.status).toBe('finished')
      expect(['player', 'opponent', 'draw']).toContain(result.winner)
      expect(result.turn).toBeGreaterThan(0)
      expect(result.log.length).toBeGreaterThan(0)
    })

    it('calls onTurnStart and onTurnEnd callbacks', async () => {
      const player1 = createAIPlayer('easy')
      const player2 = createAIPlayer('easy')
      const onTurnStart = vi.fn()
      const onTurnEnd = vi.fn()

      await runInteractiveBattle(
        arthropods.rhinoceros_beetle,
        arthropods.stag_beetle,
        player1,
        player2,
        undefined,
        { onTurnStart, onTurnEnd }
      )

      expect(onTurnStart).toHaveBeenCalled()
      expect(onTurnEnd).toHaveBeenCalled()
      expect(onTurnStart.mock.calls.length).toBe(onTurnEnd.mock.calls.length)
    })

    it('accepts a custom Player implementation', async () => {
      const customPlayer = {
        type: 'human' as const,
        selectAction: vi.fn(async (ctx) => ctx.availableActions[0]),
      }
      const aiPlayer = createAIPlayer('medium')

      const result = await runInteractiveBattle(
        arthropods.rhinoceros_beetle,
        arthropods.mantis,
        customPlayer,
        aiPlayer
      )

      expect(result.status).toBe('finished')
      expect(customPlayer.selectAction).toHaveBeenCalled()
    })
  })
})
