import type { Arthropod } from '../types/arthropod'
import type { Action } from '../types/action'
import type { Environment } from '../types/environment'
import type {
  BattleReplay,
  ReplayHeader,
  ReplayTurn,
  ReplayAction,
} from '../types/replay'
import type { BattleState } from './battle-engine'
import { getArthropodById } from '../data/arthropods'
import { runInteractiveBattle } from './battle-engine'
import type { Player } from '../types/player'

let replayCounter = 0

function generateReplayId(): string {
  replayCounter++
  return `replay_${Date.now()}_${replayCounter}`
}

function toReplayAction(action: Action): ReplayAction {
  return {
    actionId: action.id,
    actionName: action.nameKo,
  }
}

export class ReplayRecorder {
  private header: ReplayHeader
  private turns: ReplayTurn[] = []
  private currentTurn = 0

  constructor(
    playerArthropod: Arthropod,
    opponentArthropod: Arthropod,
    environment: Environment
  ) {
    this.header = {
      id: generateReplayId(),
      version: '1.0.0',
      timestamp: Date.now(),
      playerArthropodId: playerArthropod.id,
      opponentArthropodId: opponentArthropod.id,
      environment,
    }
  }

  recordTurn(
    turn: number,
    playerAction: Action,
    opponentAction: Action
  ): void {
    this.currentTurn = turn
    this.turns.push({
      turn,
      playerAction: toReplayAction(playerAction),
      opponentAction: toReplayAction(opponentAction),
    })
  }

  finalize(winner: 'player' | 'opponent' | 'draw'): BattleReplay {
    return {
      header: this.header,
      turns: this.turns,
      winner,
      totalTurns: this.currentTurn,
    }
  }
}

export async function runReplayBattle(
  arthropod1: Arthropod,
  arthropod2: Arthropod,
  player1: Player,
  player2: Player,
  environment?: Environment
): Promise<{ state: BattleState; replay: BattleReplay }> {
  const { getRandomEnvironment } = await import('./environment')
  const env = environment ?? getRandomEnvironment()

  const recorder = new ReplayRecorder(arthropod1, arthropod2, env)

  let turnPlayerAction: Action | null = null
  let turnOpponentAction: Action | null = null

  const wrappedPlayer1: Player = {
    type: player1.type,
    async selectAction(context) {
      const action = await player1.selectAction(context)
      turnPlayerAction = action
      return action
    },
  }

  const wrappedPlayer2: Player = {
    type: player2.type,
    async selectAction(context) {
      const action = await player2.selectAction(context)
      turnOpponentAction = action
      return action
    },
  }

  const state = await runInteractiveBattle(
    arthropod1,
    arthropod2,
    wrappedPlayer1,
    wrappedPlayer2,
    env,
    {
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
      },
    }
  )

  const replay = recorder.finalize(state.winner ?? 'draw')
  return { state, replay }
}

export async function replayBattle(
  replay: BattleReplay
): Promise<BattleState> {
  const playerArthropod = getArthropodById(replay.header.playerArthropodId)
  const opponentArthropod = getArthropodById(replay.header.opponentArthropodId)

  if (!playerArthropod || !opponentArthropod) {
    throw new Error('Arthropod not found in replay data')
  }

  let turnIndex = 0

  const replayPlayer: Player = {
    type: 'ai',
    async selectAction(context) {
      const replayTurn = replay.turns[turnIndex]
      if (!replayTurn) {
        return context.availableActions[0]
      }
      const action = context.availableActions.find(
        (a) => a.id === replayTurn.playerAction.actionId
      )
      return action ?? context.availableActions[0]
    },
  }

  const replayOpponent: Player = {
    type: 'ai',
    async selectAction(context) {
      const replayTurn = replay.turns[turnIndex]
      if (!replayTurn) {
        return context.availableActions[0]
      }
      const action = context.availableActions.find(
        (a) => a.id === replayTurn.opponentAction.actionId
      )
      turnIndex++
      return action ?? context.availableActions[0]
    },
  }

  const state = await runInteractiveBattle(
    playerArthropod,
    opponentArthropod,
    replayPlayer,
    replayOpponent,
    replay.header.environment
  )

  return state
}

export function serializeReplay(replay: BattleReplay): string {
  return JSON.stringify(replay)
}

export function deserializeReplay(data: string): BattleReplay {
  return JSON.parse(data) as BattleReplay
}
