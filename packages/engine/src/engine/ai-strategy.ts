import type { BattleArthropod } from '../types/arthropod'
import type { Action } from '../types/action'
import { getStyleMatchup } from '../data/matchup'
import { getActionsByIds } from '../data/actions'

interface AIContext {
  attacker: BattleArthropod
  defender: BattleArthropod
  styleAdvantage: number
  hpRatio: number
  opponentHpRatio: number
  defenderPoisoned: boolean
  attackerHasVenom: boolean
}

interface ScoredAction {
  action: Action
  score: number
}

function createAIContext(attacker: BattleArthropod, defender: BattleArthropod): AIContext {
  return {
    attacker,
    defender,
    styleAdvantage: getStyleMatchup(attacker.base.behavior.style, defender.base.behavior.style),
    hpRatio: attacker.currentHp / attacker.maxHp,
    opponentHpRatio: defender.currentHp / defender.maxHp,
    defenderPoisoned: defender.statusCondition === 'poison',
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

  if (!ctx.defenderPoisoned && ctx.attackerHasVenom) {
    if (action.effect?.type === 'status' && action.effect.condition === 'poison') {
      score += 30
    }
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

export function selectStrategicAIAction(
  attacker: BattleArthropod,
  defender: BattleArthropod
): Action {
  const availableActions = getActionsByIds(attacker.actions)

  if (availableActions.length === 0) {
    throw new Error('No actions available')
  }

  const ctx = createAIContext(attacker, defender)

  const scoredActions = availableActions
    .map((action) => ({ action, score: scoreAction(action, ctx) }))
    .filter((sa) => sa.score > 0)

  if (scoredActions.length === 0) {
    return availableActions[0]
  }

  return selectByWeight(scoredActions)
}
