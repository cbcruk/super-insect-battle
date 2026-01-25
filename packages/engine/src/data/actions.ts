import type { Action } from '../types/action'
import { actionsData } from './generated/actions.gen'
import { ActionsDataSchema } from './schemas'

const validated = ActionsDataSchema.parse(actionsData)

export const actions: Record<string, Action> = validated

export const actionList = Object.values(actions)

export function getActionById(id: string): Action | undefined {
  return actions[id]
}

export function getActionsByIds(ids: string[]): Action[] {
  return ids
    .map((id) => actions[id])
    .filter((a): a is Action => a !== undefined)
}
