import type { Arthropod, Environment } from '@super-insect-battle/engine'

export interface BattleFieldProps {
  player: Arthropod
  opponent: Arthropod
  environment: Environment
  playerFainted?: boolean
  opponentFainted?: boolean
  turnNumber?: number
  message?: string
}
