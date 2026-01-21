import type { BattleState, Insect, Move } from '@insect-battle/engine'
import type { IndividualValues } from '../random'
import type { Inventory } from '../items'

export interface PlayerInsect {
  species: Insect
  nickname: string | null
  currentHp: number
  maxHp: number
  ivs: IndividualValues
}

export interface Player {
  name: string
  location: string
  team: PlayerInsect[]
  activeIndex: number
}

export interface BattleSession {
  state: BattleState
  opponent: {
    name: string
    isWild: boolean
    behaviorId: string
  }
  awaitingInput: boolean
  availableMoves: Move[]
}

export interface Room {
  id: string
  name: string
  description: string
  exits: Record<string, string>
  hasWildEncounters: boolean
  wildInsects?: string[]
  encounterRate?: number
  npcs?: string[]
}

export interface GameState {
  player: Player
  inventory: Inventory
  battle: BattleSession | null
  isRunning: boolean
}

export type GameMode = 'explore' | 'battle'

export interface CommandResult {
  output: string
  stateChanged: boolean
  shouldQuit?: boolean
  shouldTriggerBattle?: boolean
}

export type CommandHandler = (args: string[], state: GameState) => CommandResult
