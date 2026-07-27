import type { Action } from '../types/action'
import { defaultRng, type Rng } from './rng'

export interface QueuedAction {
  source: 'player' | 'opponent'
  action: Action
  priority: number
  aggression: number
}

export function resolveActionOrder(
  playerAction: QueuedAction,
  opponentAction: QueuedAction,
  rng: Rng = defaultRng
): [QueuedAction, QueuedAction] {
  if (playerAction.priority !== opponentAction.priority) {
    return playerAction.priority > opponentAction.priority
      ? [playerAction, opponentAction]
      : [opponentAction, playerAction]
  }

  if (playerAction.aggression !== opponentAction.aggression) {
    return playerAction.aggression > opponentAction.aggression
      ? [playerAction, opponentAction]
      : [opponentAction, playerAction]
  }

  return rng() < 0.5
    ? [playerAction, opponentAction]
    : [opponentAction, playerAction]
}
