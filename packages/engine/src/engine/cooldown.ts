import type { BattleArthropod } from '../types/arthropod'
import type { Action } from '../types/action'

export function isActionOnCooldown(
  arthropod: BattleArthropod,
  action: Action
): boolean {
  const remaining = arthropod.actionCooldowns[action.id]
  return remaining !== undefined && remaining > 0
}

export function getAvailableActions(
  allActions: Action[],
  arthropod: BattleArthropod
): Action[] {
  return allActions.filter((action) => !isActionOnCooldown(arthropod, action))
}

export function startCooldown(
  arthropod: BattleArthropod,
  action: Action
): void {
  if (action.cooldown > 0) {
    arthropod.actionCooldowns[action.id] = action.cooldown
  }
}

export function tickCooldowns(arthropod: BattleArthropod): void {
  for (const actionId of Object.keys(arthropod.actionCooldowns)) {
    if (arthropod.actionCooldowns[actionId] > 0) {
      arthropod.actionCooldowns[actionId]--
    }
    if (arthropod.actionCooldowns[actionId] <= 0) {
      delete arthropod.actionCooldowns[actionId]
    }
  }
}

export function getCooldownRemaining(
  arthropod: BattleArthropod,
  actionId: string
): number {
  return arthropod.actionCooldowns[actionId] ?? 0
}
