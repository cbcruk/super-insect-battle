import type { BattleArthropod } from '../types/arthropod'
import type { Action } from '../types/action'
import type { AIPersonality } from '../types/player'
import { getStyleMatchup } from '../data/matchup'
import { getActionsByIds } from '../data/actions'
import { getAvailableActions } from './cooldown'

interface AIContext {
  attacker: BattleArthropod
  defender: BattleArthropod
  styleAdvantage: number
  hpRatio: number
  opponentHpRatio: number
  defenderHasStatus: boolean
  attackerHasVenom: boolean
}

interface ScoredAction {
  action: Action
  score: number
}

function createAIContext(
  attacker: BattleArthropod,
  defender: BattleArthropod
): AIContext {
  return {
    attacker,
    defender,
    styleAdvantage: getStyleMatchup(
      attacker.base.behavior.style,
      defender.base.behavior.style
    ),
    hpRatio: attacker.currentHp / attacker.maxHp,
    opponentHpRatio: defender.currentHp / defender.maxHp,
    defenderHasStatus: defender.statusCondition !== null,
    attackerHasVenom: attacker.base.weapon.venomous,
  }
}

function scoreAction(action: Action, ctx: AIContext): number {
  let score = 50

  if (ctx.hpRatio <= 0.3) {
    if (action.id === 'flee') score += 40
    if (action.id === 'brace') score += 30
  }

  if (ctx.styleAdvantage < 1) {
    if (action.category === 'defense') score += 25
    if (action.id === 'flee' || action.id === 'brace') score += 20
  }

  if (ctx.styleAdvantage > 1) {
    if (action.power > 0) score += 20
    if (action.power >= 80) score += 15
  }

  if (
    !ctx.defenderHasStatus &&
    action.effect?.type === 'status' &&
    action.effect.condition
  ) {
    score += 30
  }

  if (action.priority > 0 && ctx.hpRatio <= 0.5) {
    score += action.priority * 15
  }

  if (ctx.opponentHpRatio <= 0.3 && action.power > 0) {
    score += action.power * 0.3
  }

  if (ctx.attacker.battleMode !== null) {
    if (action.id === 'flee' || action.id === 'brace') {
      score = 0
    }
  }

  return score
}

function applyPersonalityModifier(
  scoredActions: ScoredAction[],
  personality: AIPersonality
): ScoredAction[] {
  return scoredActions.map(({ action, score }) => {
    let modified = score

    switch (personality) {
      case 'aggressive':
        if (action.power > 0) modified *= 1.5
        if (action.power >= 80) modified *= 1.3
        if (action.category === 'defense') modified *= 0.5
        if (action.id === 'flee' || action.id === 'brace') modified *= 0.3
        break

      case 'defensive':
        if (action.category === 'defense') modified *= 1.5
        if (action.id === 'brace') modified *= 1.5
        if (action.effect?.type === 'buff') modified *= 1.3
        if (action.power >= 80) modified *= 0.7
        break

      case 'balanced':
        break
    }

    return { action, score: Math.max(1, Math.floor(modified)) }
  })
}

function selectByWeight(scoredActions: ScoredAction[]): Action {
  const totalScore = scoredActions.reduce((sum, sa) => sum + sa.score, 0)

  if (totalScore === 0) {
    return scoredActions[0].action
  }

  let random = Math.random() * totalScore

  for (const { action, score } of scoredActions) {
    random -= score
    if (random <= 0) return action
  }

  return scoredActions[scoredActions.length - 1].action
}

function selectBest(scoredActions: ScoredAction[]): Action {
  let best = scoredActions[0]
  for (const sa of scoredActions) {
    if (sa.score > best.score) {
      best = sa
    }
  }
  return best.action
}

export function selectStrategicAIAction(
  attacker: BattleArthropod,
  defender: BattleArthropod,
  personality: AIPersonality = 'balanced',
  deterministic = false
): Action {
  const allActions = getActionsByIds(attacker.actions)
  const availableActions = getAvailableActions(allActions, attacker)

  if (availableActions.length === 0) {
    if (allActions.length === 0) {
      throw new Error('No actions available')
    }
    return allActions[0]
  }

  const ctx = createAIContext(attacker, defender)

  let scoredActions = availableActions
    .map((action) => ({ action, score: scoreAction(action, ctx) }))
    .filter((sa) => sa.score > 0)

  if (scoredActions.length === 0) {
    return availableActions[0]
  }

  scoredActions = applyPersonalityModifier(scoredActions, personality)

  if (deterministic) {
    return selectBest(scoredActions)
  }

  return selectByWeight(scoredActions)
}
