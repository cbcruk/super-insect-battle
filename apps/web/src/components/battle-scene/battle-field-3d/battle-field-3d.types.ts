import type { Arthropod, Environment } from '@super-insect-battle/engine'

export interface DamagePopupEffect {
  id: string
  damage: number
  critical: boolean
  target: 'player' | 'opponent'
}

export interface ActionTextEffect {
  id: string
  text: string
  actor: 'player' | 'opponent'
}

export interface BlockParticleEffect {
  id: string
  position: [number, number, number]
  color?: string
  count?: number
}

export interface BattleField3DProps {
  player: Arthropod
  opponent: Arthropod
  environment: Environment
  playerFainted?: boolean
  opponentFainted?: boolean
  playerAnimation?: CharacterAnimation
  opponentAnimation?: CharacterAnimation
  turnNumber?: number
  message?: string
  damagePopups?: DamagePopupEffect[]
  actionTexts?: ActionTextEffect[]
  blockParticles?: BlockParticleEffect[]
  onDamagePopupComplete?: (id: string) => void
  onActionTextComplete?: (id: string) => void
  onBlockParticleComplete?: (id: string) => void
}

export type CharacterAnimation = 'idle' | 'attack' | 'defense' | 'hit'

export interface Character3DProps {
  arthropod: Arthropod
  side: 'player' | 'opponent'
  fainted: boolean
  animation?: CharacterAnimation
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
