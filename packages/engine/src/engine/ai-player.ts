import type { Action } from '../types/action'
import type { BattleArthropod } from '../types/arthropod'
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

/** AI 플레이어의 난이도와 성격. */
export interface AIPlayerOptions {
  /** 쉬움은 무작위, 보통은 점수 가중, 어려움은 최고점 기술. 기본 `'medium'`. */
  difficulty?: AIDifficulty
  /** 기술 점수 보정 성향. 기본 `'balanced'`. */
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

/**
 * 후보 기술 중에서 난이도·성격에 맞춰 하나를 고른다.
 *
 * 쉬움은 무작위, 보통은 점수 가중 무작위, 어려움은 최고점 기술을 고른다. 사거리처럼
 * 배틀 밖의 조건으로 후보를 먼저 거른 뒤 부르는 용도다 (격자 아레나 등).
 *
 * @param candidates 비어 있으면 오류를 던진다.
 */
export function chooseAIAction(
  self: BattleArthropod,
  opponent: BattleArthropod,
  candidates: Action[],
  options: AIPlayerOptions = {},
  rng: Rng = defaultRng
): Action {
  if (candidates.length === 0) throw new Error('No candidate actions')
  const difficulty = options.difficulty ?? 'medium'
  const personality = options.personality ?? 'balanced'
  if (difficulty === 'easy') return selectRandomAction(candidates, rng)
  return selectStrategicAIAction(
    self,
    opponent,
    personality,
    difficulty === 'hard',
    rng,
    candidates
  )
}
