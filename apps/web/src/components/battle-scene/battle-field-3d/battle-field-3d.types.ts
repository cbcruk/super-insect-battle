import type { Arthropod, Environment } from '@super-insect-battle/engine'

export interface BattleField3DProps {
  player: Arthropod
  opponent: Arthropod
  environment: Environment
  playerFainted?: boolean
  opponentFainted?: boolean
  turnNumber?: number
  message?: string
}

export interface Character3DProps {
  arthropod: Arthropod
  side: 'player' | 'opponent'
  fainted: boolean
}

export interface ArenaGroundProps {
  terrain: Environment['terrain']
}

export interface ArenaLightingProps {
  timeOfDay: Environment['timeOfDay']
  weather: Environment['weather']
}

export interface AmbientParticlesProps {
  terrain: Environment['terrain']
  weather: Environment['weather']
}
