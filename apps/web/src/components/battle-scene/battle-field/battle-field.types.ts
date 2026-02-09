import type { Arthropod, Environment } from '@super-insect-battle/engine'
import type {
  CharacterAnimation,
  DamagePopupEffect,
  ActionTextEffect,
  BlockParticleEffect,
} from '../battle-field-3d/battle-field-3d.types.ts'

export interface BattleFieldProps {
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
