import type { Action } from '../types/action'

export interface QueuedAction {
  source: 'player' | 'opponent'
  action: Action
  priority: number
  aggression: number
}

export function resolveActionOrder(
  playerAction: QueuedAction,
  opponentAction: QueuedAction
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

  return Math.random() < 0.5
    ? [playerAction, opponentAction]
    : [opponentAction, playerAction]
}
