import type {
  Arthropod,
  AIDifficulty,
  AIPersonality,
} from '@super-insect-battle/engine'

export interface AIConfig {
  difficulty: AIDifficulty
  personality: AIPersonality
}

export interface GameStore {
  selectedPlayer: Arthropod | null
  selectedOpponent: Arthropod | null
  aiConfig: AIConfig

  setPlayer: (arthropod: Arthropod) => void
  setOpponent: (arthropod: Arthropod) => void
  setAIConfig: (config: AIConfig) => void
  reset: () => void
}
