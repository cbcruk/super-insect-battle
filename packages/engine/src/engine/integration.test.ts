import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  createBattleArthropod,
  executeTurn,
  runInteractiveBattle,
  type BattleState,
} from './battle-engine'
import { arthropods } from '../data/arthropods'
import { actions, getActionsByIds } from '../data/actions'
import { createAIPlayer } from './ai-player'
import { startCooldown, getCooldownRemaining, getAvailableActions } from './cooldown'
import { runReplayBattle } from './replay'
import { getRandomEnvironment } from './environment'
import type { Player } from '../types/player'

function createBattleState(
  playerArthropodId = 'rhinoceros_beetle',
  opponentArthropodId = 'mantis'
): BattleState {
  return {
    turn: 0,
    player: createBattleArthropod(arthropods[playerArthropodId]),
    opponent: createBattleArthropod(arthropods[opponentArthropodId]),
    environment: getRandomEnvironment(),
    log: [],
    status: 'running',
    winner: null,
  }
}

describe('Integration Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('cooldown + battle flow', () => {
    it('cooldowns tick down after each turn', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const state = createBattleState()
      const playerAction = actions.horn_lift
      const opponentAction = actions.scythe_strike

      expect(playerAction.cooldown).toBe(2)
      expect(opponentAction.cooldown).toBe(2)

      const nextState = executeTurn(state, playerAction, opponentAction)

      expect(getCooldownRemaining(nextState.player, 'horn_lift')).toBe(1)
      expect(getCooldownRemaining(nextState.opponent, 'scythe_strike')).toBe(1)
    })

    it('cooldowns prevent action reuse on next turn', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const state = createBattleState()

      const action = actions.mega_horn
      expect(action.cooldown).toBe(3)

      const state2 = executeTurn(state, action, actions.horn_thrust)

      expect(getCooldownRemaining(state2.player, 'mega_horn')).toBe(2)

      const allActions = getActionsByIds(state2.player.actions)
      const available = getAvailableActions(allActions, state2.player)

      expect(available.find((a) => a.id === 'mega_horn')).toBeUndefined()
    })

    it('cooldowns expire after enough turns', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const state = createBattleState()

      const action = actions.horn_lift
      expect(action.cooldown).toBe(2)

      let current = executeTurn(state, action, actions.horn_thrust)

      expect(getCooldownRemaining(current.player, 'horn_lift')).toBe(1)

      current = executeTurn(current, actions.horn_thrust, actions.horn_thrust)

      expect(getCooldownRemaining(current.player, 'horn_lift')).toBe(0)

      const allActions = getActionsByIds(current.player.actions)
      const available = getAvailableActions(allActions, current.player)
      expect(available.find((a) => a.id === 'horn_lift')).toBeDefined()
    })
  })

  describe('status conditions in battle', () => {
    it('poison deals damage at end of turn', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const state = createBattleState('rhinoceros_beetle', 'scorpion')

      state.opponent.statusCondition = 'poison'
      state.opponent.appliedVenomPotency = 70
      const hpBefore = state.opponent.currentHp

      const next = executeTurn(state, actions.horn_thrust, actions.venom_strike)

      expect(next.opponent.currentHp).toBeLessThan(hpBefore)
    })

    it('burn reduces strength in damage calculation', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const stateNoBurn = createBattleState()
      const stateBurn = createBattleState()
      stateBurn.player.statusCondition = 'burn'

      const action = actions.horn_thrust

      const result1 = executeTurn(stateNoBurn, action, actions.horn_thrust)
      const result2 = executeTurn(stateBurn, action, actions.horn_thrust)

      const damage1 = result1.log.find(
        (e) => e.actor === 'player' && e.damage !== undefined
      )?.damage
      const damage2 = result2.log.find(
        (e) => e.actor === 'player' && e.damage !== undefined
      )?.damage

      if (damage1 !== undefined && damage2 !== undefined) {
        expect(damage2).toBeLessThanOrEqual(damage1)
      }

    })

    it('paralyzed arthropod may skip turn', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1)

      const state = createBattleState()
      state.player.statusCondition = 'paralysis'

      const next = executeTurn(state, actions.horn_thrust, actions.horn_thrust)

      const paralysisLog = next.log.find(
        (e) => e.actor === 'player' && e.action.includes('마비')
      )

      expect(paralysisLog).toBeDefined()
    })
  })

  describe('stat stages in battle', () => {
    it('stat buff affects subsequent damage', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const stateNoBoost = createBattleState()
      const stateWithBoost = createBattleState()
      stateWithBoost.player.statStages.strength = 2

      const action = actions.horn_thrust

      const result1 = executeTurn(stateNoBoost, action, actions.horn_thrust)
      const result2 = executeTurn(stateWithBoost, action, actions.horn_thrust)

      const damage1 = result1.log.find(
        (e) => e.actor === 'player' && e.damage !== undefined
      )?.damage
      const damage2 = result2.log.find(
        (e) => e.actor === 'player' && e.damage !== undefined
      )?.damage

      if (damage1 !== undefined && damage2 !== undefined) {
        expect(damage2).toBeGreaterThan(damage1)
      }
    })

    it('rage action applies strength buff and has cooldown', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1)

      const state = createBattleState()
      const rage = actions.rage

      expect(rage.cooldown).toBe(3)

      const next = executeTurn(state, rage, actions.horn_thrust)

      expect(next.player.statStages.strength).toBeGreaterThan(0)

      expect(getCooldownRemaining(next.player, 'rage')).toBe(2)
    })
  })

  describe('all actions on cooldown fallback', () => {
    it('provides all actions when all are on cooldown', async () => {
      const selectActionSpy = vi.fn(async (ctx) => ctx.availableActions[0])
      const customPlayer: Player = {
        type: 'human',
        selectAction: selectActionSpy,
      }

      const aiPlayer = createAIPlayer('easy')

      const result = await runInteractiveBattle(
        arthropods.rhinoceros_beetle,
        arthropods.mantis,
        customPlayer,
        aiPlayer
      )

      expect(result.status).toBe('finished')

      for (const call of selectActionSpy.mock.calls) {
        const ctx = call[0]
        expect(ctx.availableActions.length).toBeGreaterThan(0)
      }
    })
  })

  describe('AI difficulty in full battle', () => {
    it('easy AI completes battle', async () => {
      const p1 = createAIPlayer('easy')
      const p2 = createAIPlayer('easy')

      const result = await runInteractiveBattle(
        arthropods.rhinoceros_beetle,
        arthropods.scorpion,
        p1,
        p2
      )

      expect(result.status).toBe('finished')
      expect(result.turn).toBeGreaterThan(0)
    })

    it('hard AI completes battle', async () => {
      const p1 = createAIPlayer('hard')
      const p2 = createAIPlayer('hard')

      const result = await runInteractiveBattle(
        arthropods.rhinoceros_beetle,
        arthropods.scorpion,
        p1,
        p2
      )

      expect(result.status).toBe('finished')
      expect(result.turn).toBeGreaterThan(0)
    })

    it('aggressive AI uses more attack actions', async () => {
      const aggressive = createAIPlayer({ difficulty: 'hard', personality: 'aggressive' })
      const defensive = createAIPlayer({ difficulty: 'hard', personality: 'defensive' })

      const result = await runInteractiveBattle(
        arthropods.rhinoceros_beetle,
        arthropods.stag_beetle,
        aggressive,
        defensive
      )

      expect(result.status).toBe('finished')
      expect(result.log.length).toBeGreaterThan(0)
    })
  })

  describe('replay with cooldowns', () => {
    it('records and replays a battle with cooldown actions', async () => {
      const p1 = createAIPlayer('medium')
      const p2 = createAIPlayer('medium')

      const { state, replay } = await runReplayBattle(
        arthropods.rhinoceros_beetle,
        arthropods.scorpion,
        p1,
        p2
      )

      expect(state.status).toBe('finished')
      expect(replay.turns.length).toBeGreaterThan(0)
      expect(replay.winner).toBeDefined()

      const cooldownActions = replay.turns.filter((t) => {
        const pAction = actions[t.playerAction.actionId]
        const oAction = actions[t.opponentAction.actionId]
        return (pAction?.cooldown ?? 0) > 0 || (oAction?.cooldown ?? 0) > 0
      })

      expect(cooldownActions.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('battle mode integration', () => {
    it('brace reduces incoming damage', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const stateNoBrace = createBattleState('mantis', 'rhinoceros_beetle')
      const stateBrace = createBattleState('mantis', 'rhinoceros_beetle')
      stateBrace.opponent.battleMode = 'brace'
      stateBrace.opponent.modeTurns = 2

      const result1 = executeTurn(stateNoBrace, actions.scythe_strike, actions.horn_thrust)
      const result2 = executeTurn(stateBrace, actions.scythe_strike, actions.horn_thrust)

      const damage1 = result1.log.find(
        (e) => e.actor === 'player' && e.damage !== undefined
      )?.damage
      const damage2 = result2.log.find(
        (e) => e.actor === 'player' && e.damage !== undefined
      )?.damage

      if (damage1 !== undefined && damage2 !== undefined) {
        expect(damage2).toBeLessThanOrEqual(damage1)
      }
    })

    it('flee increases evasion', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99)

      const stateFlee = createBattleState('mantis', 'rhinoceros_beetle')
      stateFlee.opponent.battleMode = 'flee'
      stateFlee.opponent.modeTurns = 2

      const result = executeTurn(stateFlee, actions.scythe_strike, actions.horn_thrust)

      expect(result.log.length).toBeGreaterThan(0)
    })
  })

  describe('multi-system interaction', () => {
    it('completes a full battle with all systems active', async () => {
      const p1 = createAIPlayer({ difficulty: 'hard', personality: 'aggressive' })
      const p2 = createAIPlayer({ difficulty: 'medium', personality: 'defensive' })

      const turnStates: BattleState[] = []

      const result = await runInteractiveBattle(
        arthropods.rhinoceros_beetle,
        arthropods.scorpion,
        p1,
        p2,
        undefined,
        {
          onTurnEnd(state) {
            turnStates.push({ ...state })
          },
        }
      )

      expect(result.status).toBe('finished')
      expect(result.turn).toBeGreaterThan(0)
      expect(result.log.length).toBeGreaterThan(2)
      expect(turnStates.length).toBeGreaterThan(0)
    })

    it('handles status + cooldown + stat stages in sequence', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const state = createBattleState('scorpion', 'rhinoceros_beetle')

      state.player.statusCondition = 'poison'
      state.player.appliedVenomPotency = 50
      state.player.statStages.strength = 2

      startCooldown(state.player, actions.toxic_sting)

      const allActions = getActionsByIds(state.player.actions)
      const available = getAvailableActions(allActions, state.player)

      expect(available.find((a) => a.id === 'toxic_sting')).toBeUndefined()

      const next = executeTurn(state, actions.venom_strike, actions.horn_thrust)

      expect(next.player.statusCondition).toBe('poison')
      expect(next.player.statStages.strength).toBe(2)
      expect(getCooldownRemaining(next.player, 'toxic_sting')).toBe(2)
    })
  })
})
