import type {
  Arthropod,
  Action,
  BattleState,
  BattleReplay,
  AIDifficulty,
  AIPersonality,
  BattleContext,
} from '@super-insect-battle/engine'
import {
  createAIPlayer,
  runInteractiveBattle,
  ReplayRecorder,
  getRandomEnvironment,
} from '@super-insect-battle/engine'
import type { Player } from '@super-insect-battle/engine'

export type ActionResolver = (action: Action) => void

export interface InteractiveBattleCallbacks {
  onTurnStart: (state: BattleState) => void
  onWaitingForAction: (context: BattleContext) => void
  onTurnEnd: (state: BattleState) => void
  onBattleEnd: (state: BattleState, replay: BattleReplay) => void
}

export interface InteractiveBattleOptions {
  arthropod1: Arthropod
  arthropod2: Arthropod
  aiDifficulty: AIDifficulty
  aiPersonality: AIPersonality
  callbacks: InteractiveBattleCallbacks
}

export interface InteractiveBattleHandle {
  resolverRef: { current: ActionResolver | null }
  start(): Promise<void>
}

export function createInteractiveBattle(
  options: InteractiveBattleOptions
): InteractiveBattleHandle {
  const resolverRef: { current: ActionResolver | null } = { current: null }
  const env = getRandomEnvironment()
  const recorder = new ReplayRecorder(
    options.arthropod1,
    options.arthropod2,
    env
  )

  let turnPlayerAction: Action | null = null
  let turnOpponentAction: Action | null = null

  const humanPlayer: Player = {
    type: 'human',
    selectAction(context: BattleContext): Promise<Action> {
      return new Promise<Action>((resolve) => {
        resolverRef.current = (action: Action) => {
          turnPlayerAction = action
          resolve(action)
        }
        options.callbacks.onWaitingForAction(context)
      })
    },
  }

  const aiPlayerBase = createAIPlayer({
    difficulty: options.aiDifficulty,
    personality: options.aiPersonality,
  })

  const aiPlayer: Player = {
    type: 'ai',
    async selectAction(context: BattleContext): Promise<Action> {
      const action = await aiPlayerBase.selectAction(context)
      turnOpponentAction = action
      return action
    },
  }

  async function start(): Promise<void> {
    const state = await runInteractiveBattle(
      options.arthropod1,
      options.arthropod2,
      humanPlayer,
      aiPlayer,
      env,
      {
        onTurnStart(currentState) {
          options.callbacks.onTurnStart(currentState)
        },
        onTurnEnd(currentState) {
          if (turnPlayerAction && turnOpponentAction) {
            recorder.recordTurn(
              currentState.turn,
              turnPlayerAction,
              turnOpponentAction
            )
            turnPlayerAction = null
            turnOpponentAction = null
          }
          options.callbacks.onTurnEnd(currentState)
        },
      }
    )

    const replay = recorder.finalize(state.winner ?? 'draw')
    options.callbacks.onBattleEnd(state, replay)
  }

  return { resolverRef, start }
}
