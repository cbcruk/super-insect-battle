import type { Action, ActionTargeting } from '../types/action'
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

/**
 * 격자 타게팅. 명시값 우선, 없으면 효과·위력에서 유도.
 * - 자기 효과 → self
 * - 상대 효과 → melee
 * - 효과 없고 위력 있음 → melee, 위력 0 → self(자기 유틸)
 */
export function getActionTargeting(action: Action): ActionTargeting {
  if (action.targeting) return action.targeting
  if (action.effect?.target === 'self') return 'self'
  if (action.effect?.target === 'opponent') return 'melee'
  return action.power > 0 ? 'melee' : 'self'
}

/** 격자 사거리(칸). 명시값 우선, 없으면 타게팅에서 유도. */
export function getActionRange(action: Action): number {
  if (action.range !== undefined) return action.range
  const targeting = getActionTargeting(action)
  if (targeting === 'self') return 0
  if (targeting === 'ranged') return 4
  return 1
}
