import type {
  Arthropod,
  AIDifficulty,
  AIPersonality,
} from '@super-insect-battle/engine'

export interface AIConfig {
  difficulty: AIDifficulty
  personality: AIPersonality
}

export type BattleMode = 'ai-vs-ai' | 'player-vs-ai'

export interface GameStore {
  selectedPlayer: Arthropod | null
  selectedOpponent: Arthropod | null
  aiConfig: AIConfig
  battleMode: BattleMode

  setPlayer: (arthropod: Arthropod | null) => void
  setOpponent: (arthropod: Arthropod | null) => void
  setAIConfig: (config: AIConfig) => void
  setBattleMode: (mode: BattleMode) => void
  reset: () => void
}
