import { create } from 'zustand'
import type { GameStore } from './game-store.types.ts'

const initialAIConfig = {
  difficulty: 'medium' as const,
  personality: 'balanced' as const,
}

export const useGameStore = create<GameStore>((set) => ({
  selectedPlayer: null,
  selectedOpponent: null,
  aiConfig: initialAIConfig,
  battleMode: 'player-vs-ai',

  setPlayer: (arthropod) => set({ selectedPlayer: arthropod }),
  setOpponent: (arthropod) => set({ selectedOpponent: arthropod }),
  setAIConfig: (config) => set({ aiConfig: config }),
  setBattleMode: (mode) => set({ battleMode: mode }),
  reset: () =>
    set({
      selectedPlayer: null,
      selectedOpponent: null,
      aiConfig: initialAIConfig,
      battleMode: 'player-vs-ai',
    }),
}))
