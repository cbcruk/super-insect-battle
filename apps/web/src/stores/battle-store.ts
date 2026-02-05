import { create } from 'zustand'
import type { BattleStore } from './battle-store.types.ts'
import type { ActionResolver } from '../bridge/interactive-battle-runner.ts'
import { createInteractiveBattle } from '../bridge/interactive-battle-runner.ts'

let currentResolver: ActionResolver | null = null

export const useBattleStore = create<BattleStore>((set, get) => ({
  battleState: null,
  battleContext: null,
  phase: 'idle',

  animationQueue: [],
  displayedPlayerHp: 0,
  displayedOpponentHp: 0,
  displayedLogs: [],

  finalReplay: null,

  startInteractiveBattle: (config) => {
    set({
      phase: 'starting',
      battleState: null,
      battleContext: null,
      animationQueue: [],
      displayedPlayerHp: 0,
      displayedOpponentHp: 0,
      displayedLogs: [],
      finalReplay: null,
    })

    const handle = createInteractiveBattle({
      arthropod1: config.player,
      arthropod2: config.opponent,
      aiDifficulty: config.aiDifficulty,
      aiPersonality: config.aiPersonality,
      callbacks: {
        onTurnStart: (state) => {
          set({ battleState: state })
        },
        onWaitingForAction: (context) => {
          currentResolver = handle.resolverRef.current
          set({ battleContext: context, phase: 'selecting' })
        },
        onTurnEnd: (state) => {
          set({ battleState: state, phase: 'animating' })
        },
        onBattleEnd: (state, replay) => {
          set({
            battleState: state,
            finalReplay: replay,
            phase: 'finished',
          })
        },
      },
    })

    handle.start()
  },

  selectAction: (action) => {
    if (currentResolver) {
      currentResolver(action)
      currentResolver = null
      set({ phase: 'animating', battleContext: null })
    }
  },

  setPhase: (phase) => set({ phase }),
  setBattleState: (state) => set({ battleState: state }),
  setBattleContext: (context) => set({ battleContext: context }),

  enqueueAnimations: (events) =>
    set((state) => ({
      animationQueue: [...state.animationQueue, ...events],
    })),

  dequeueAnimation: () => {
    const queue = get().animationQueue
    if (queue.length === 0) return undefined
    const [first, ...rest] = queue
    set({ animationQueue: rest })
    return first
  },

  updateDisplayedHp: (target, hp) =>
    set(
      target === 'player'
        ? { displayedPlayerHp: hp }
        : { displayedOpponentHp: hp }
    ),

  addDisplayedLog: (entry) =>
    set((state) => ({
      displayedLogs: [...state.displayedLogs, entry],
    })),

  setFinalReplay: (replay) => set({ finalReplay: replay }),

  reset: () =>
    set({
      battleState: null,
      battleContext: null,
      phase: 'idle',
      animationQueue: [],
      displayedPlayerHp: 0,
      displayedOpponentHp: 0,
      displayedLogs: [],
      finalReplay: null,
    }),
}))
