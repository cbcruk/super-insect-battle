import type { Environment } from './environment'

export interface ReplayAction {
  actionId: string
  actionName: string
}

export interface ReplayTurn {
  turn: number
  playerAction: ReplayAction
  opponentAction: ReplayAction
}

export interface ReplayHeader {
  id: string
  version: string
  timestamp: number
  playerArthropodId: string
  opponentArthropodId: string
  environment: Environment
}

export interface BattleReplay {
  header: ReplayHeader
  turns: ReplayTurn[]
  winner: 'player' | 'opponent' | 'draw'
  totalTurns: number
}
