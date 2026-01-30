export { AppLayout } from './components/layout/app-layout.tsx'
export { NavBar } from './components/layout/nav-bar.tsx'
export { MainMenu } from './components/main-menu/main-menu.tsx'

export { useGameStore } from './stores/game-store.ts'
export { useBattleStore } from './stores/battle-store.ts'

export { runBattle, runMultipleBattles } from './bridge/battle-runner.ts'
export {
  createInteractiveBattle,
  type ActionResolver,
  type InteractiveBattleCallbacks,
  type InteractiveBattleOptions,
  type InteractiveBattleHandle,
} from './bridge/interactive-battle-runner.ts'
export { BattleApiClient } from './bridge/api-client.ts'

export type { GameStore, AIConfig } from './stores/game-store.types.ts'
export type {
  BattleStore,
  BattlePhase,
  BattleConfig,
  AnimationEvent,
} from './stores/battle-store.types.ts'
