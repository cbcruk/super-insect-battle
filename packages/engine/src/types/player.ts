import type { Action } from './action'
import type { BattleArthropod } from './arthropod'
import type { Environment } from './environment'

export type PlayerType = 'human' | 'ai'

export type AIDifficulty = 'easy' | 'medium' | 'hard'

export interface BattleContext {
  self: BattleArthropod
  opponent: BattleArthropod
  environment: Environment
  turn: number
  availableActions: Action[]
}

export interface Player {
  type: PlayerType
  selectAction(context: BattleContext): Promise<Action>
}
