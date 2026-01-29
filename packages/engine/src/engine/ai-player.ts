import type { Action } from '../types/action'
import type { Player, BattleContext, AIDifficulty } from '../types/player'
import { selectStrategicAIAction } from './ai-strategy'

function selectRandomAction(availableActions: Action[]): Action {
  const index = Math.floor(Math.random() * availableActions.length)
  return availableActions[index]
}

export function createAIPlayer(difficulty: AIDifficulty = 'medium'): Player {
  return {
    type: 'ai',
    async selectAction(context: BattleContext): Promise<Action> {
      switch (difficulty) {
        case 'easy':
          return selectRandomAction(context.availableActions)
        case 'medium':
          return selectStrategicAIAction(context.self, context.opponent)
        case 'hard':
          return selectStrategicAIAction(context.self, context.opponent)
      }
    },
  }
}
