import { create } from 'zustand'

export type GameScene = 'village' | 'battle'

interface GameStore {
  currentScene: GameScene
  currentRoom: string
  playerPosition: { x: number; y: number }

  setScene: (scene: GameScene) => void
  setRoom: (roomId: string, spawnX?: number, spawnY?: number) => void
  setPlayerPosition: (x: number, y: number) => void
}

export const useGameStore = create<GameStore>((set) => ({
  currentScene: 'village',
  currentRoom: 'training_grounds',
  playerPosition: { x: 10, y: 10 },

  setScene: (scene) => set({ currentScene: scene }),

  setRoom: (roomId, spawnX, spawnY) =>
    set((state) => ({
      currentRoom: roomId,
      playerPosition:
        spawnX !== undefined && spawnY !== undefined
          ? { x: spawnX, y: spawnY }
          : state.playerPosition,
    })),

  setPlayerPosition: (x, y) => set({ playerPosition: { x, y } }),
}))
