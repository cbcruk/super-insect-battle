import type { Action } from '../types/action'
import type {
  Player,
  BattleContext,
  AIDifficulty,
  AIPersonality,
} from '../types/player'
import { selectStrategicAIAction } from './ai-strategy'
import { defaultRng, type Rng } from './rng'

function selectRandomAction(availableActions: Action[], rng: Rng): Action {
  const index = Math.floor(rng() * availableActions.length)
  return availableActions[index]
}

export interface AIPlayerOptions {
  difficulty?: AIDifficulty
  personality?: AIPersonality
}

export function createAIPlayer(
  difficultyOrOptions: AIDifficulty | AIPlayerOptions = 'medium',
  rng: Rng = defaultRng
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
          return selectRandomAction(context.availableActions, rng)
        case 'medium':
          return selectStrategicAIAction(
            context.self,
            context.opponent,
            personality,
            false,
            rng
          )
        case 'hard':
          return selectStrategicAIAction(
            context.self,
            context.opponent,
            personality,
            true,
            rng
          )
      }
    },
  }
}
