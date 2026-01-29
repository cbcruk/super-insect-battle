import { describe, it, expect } from 'vitest'
import { createAIPlayer } from './ai-player'
import { createBattleArthropod } from './battle-engine'
import { arthropods } from '../data/arthropods'
import { getActionsByIds } from '../data/actions'
import { getRandomEnvironment } from './environment'
import type { BattleContext } from '../types/player'

function createTestContext(
  self = arthropods.rhinoceros_beetle,
  opponent = arthropods.mantis
): BattleContext {
  const battleSelf = createBattleArthropod(self)
  const battleOpponent = createBattleArthropod(opponent)

  return {
    self: battleSelf,
    opponent: battleOpponent,
    environment: getRandomEnvironment(),
    turn: 1,
    availableActions: getActionsByIds(battleSelf.actions),
  }
}

describe('AIPlayer', () => {
  it('creates an AI player with default medium difficulty', () => {
    const player = createAIPlayer()

    expect(player.type).toBe('ai')
  })

  it('selects a valid action with easy difficulty', async () => {
    const player = createAIPlayer('easy')
    const context = createTestContext()

    const action = await player.selectAction(context)

    expect(action).toBeDefined()
    expect(action.id).toBeDefined()
    expect(context.availableActions).toContainEqual(action)
  })

  it('selects a valid action with medium difficulty', async () => {
    const player = createAIPlayer('medium')
    const context = createTestContext()

    const action = await player.selectAction(context)

    expect(action).toBeDefined()
    expect(action.id).toBeDefined()
  })

  it('selects a valid action with hard difficulty', async () => {
    const player = createAIPlayer('hard')
    const context = createTestContext()

    const action = await player.selectAction(context)

    expect(action).toBeDefined()
    expect(action.id).toBeDefined()
  })
})
