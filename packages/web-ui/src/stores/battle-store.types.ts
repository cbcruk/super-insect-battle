import type {
  Action,
  Arthropod,
  AIDifficulty,
  AIPersonality,
  BattleContext,
  BattleLogEntry,
  BattleReplay,
  BattleState,
  StatusCondition,
} from '@super-insect-battle/engine'

export type BattlePhase =
  | 'idle'
  | 'starting'
  | 'selecting'
  | 'animating'
  | 'finished'

export type AnimationEvent =
  | { type: 'turn-start'; turn: number }
  | { type: 'action-use'; actor: 'player' | 'opponent'; actionName: string }
  | {
      type: 'damage'
      target: 'player' | 'opponent'
      amount: number
      critical: boolean
    }
  | { type: 'hp-change'; target: 'player' | 'opponent'; newHp: number }
  | {
      type: 'status-apply'
      target: 'player' | 'opponent'
      condition: StatusCondition
    }
  | { type: 'faint'; target: 'player' | 'opponent' }
  | { type: 'log-entry'; entry: BattleLogEntry }

export interface BattleConfig {
  player: Arthropod
  opponent: Arthropod
  aiDifficulty: AIDifficulty
  aiPersonality: AIPersonality
}

export interface BattleStore {
  battleState: BattleState | null
  battleContext: BattleContext | null
  phase: BattlePhase

  animationQueue: AnimationEvent[]
  displayedPlayerHp: number
  displayedOpponentHp: number
  displayedLogs: BattleLogEntry[]

  finalReplay: BattleReplay | null

  startInteractiveBattle: (config: BattleConfig) => void
  selectAction: (action: Action) => void
  setPhase: (phase: BattlePhase) => void
  setBattleState: (state: BattleState) => void
  setBattleContext: (context: BattleContext | null) => void
  enqueueAnimations: (events: AnimationEvent[]) => void
  dequeueAnimation: () => AnimationEvent | undefined
  updateDisplayedHp: (
    target: 'player' | 'opponent',
    hp: number
  ) => void
  addDisplayedLog: (entry: BattleLogEntry) => void
  setFinalReplay: (replay: BattleReplay) => void
  reset: () => void
}
