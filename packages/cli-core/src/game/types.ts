import type { BattleState, Insect, Move } from '@insect-battle/engine'

export interface PlayerInsect {
  species: Insect
  nickname: string | null
  currentHp: number
  maxHp: number
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
}

export interface GameState {
  player: Player
  battle: BattleSession | null
  isRunning: boolean
}

export type GameMode = 'explore' | 'battle'

export interface CommandResult {
  output: string
  stateChanged: boolean
  shouldQuit?: boolean
}

export type CommandHandler = (args: string[], state: GameState) => CommandResult
