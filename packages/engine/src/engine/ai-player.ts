import type { Action } from '../types/action'
import type { Player, BattleContext, AIDifficulty, AIPersonality } from '../types/player'
import { selectStrategicAIAction } from './ai-strategy'

function selectRandomAction(availableActions: Action[]): Action {
  const index = Math.floor(Math.random() * availableActions.length)
  return availableActions[index]
}

export interface AIPlayerOptions {
  difficulty?: AIDifficulty
  personality?: AIPersonality
}

export function createAIPlayer(
  difficultyOrOptions: AIDifficulty | AIPlayerOptions = 'medium'
): Player {
  const options: AIPlayerOptions =
    typeof difficultyOrOptions === 'string'
      ? { difficulty: difficultyOrOptions }
      : difficultyOrOptions

  const difficulty = options.difficulty ?? 'medium'
  const personality = options.personality ?? 'balanced'

  return {
    type: 'ai',
    async selectAction(context: BattleContext): Promise<Action> {
      switch (difficulty) {
        case 'easy':
          return selectRandomAction(context.availableActions)
        case 'medium':
          return selectStrategicAIAction(context.self, context.opponent, personality)
        case 'hard':
          return selectStrategicAIAction(context.self, context.opponent, personality, true)
      }
    },
  }
}
