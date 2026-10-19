import {
  getActionById,
  getActionTargeting,
  getStatMultiplier,
  type Action,
  type StatusCondition,
} from '@super-insect-battle/engine'
import type { Actor } from '../actor'
import type { Level } from '../run'
import { estimateDamage, hitProbability } from '../combat'

// 상태이상을 걸었을 때 남은 싸움에서 얻는 이득을 상대 최대 HP 비율로 어림한다. 턴을
// 빼앗는 묶기·수면·마비를 지속 피해보다 높게 친다
const STATUS_VALUE: Record<StatusCondition, number> = {
  bind: 0.3,
  sleep: 0.3,
  paralysis: 0.25,
  poison: 0.2,
  burn: 0.15,
  confusion: 0.12,
}
const DEBUFF_VALUE = 0.05
// 이보다 더 깎인 능력치에는 약화 가치를 주지 않는다
const DEBUFF_STAGE_FLOOR = -2
// 자기 강화가 이득을 내는 남은 싸움 턴 수의 상한
const BUFF_HORIZON_TURNS = 3

/**
 * 어려움 AI가 격자에서 쓸 기술을 기대 이득으로 고른다.
 *
 * - 공격: 명중 확률 × 추정 피해. 최소 피해로도 쓰러뜨릴 수 있으면 큰 가산점.
 * - 상태이상·약화: 상대가 아직 걸리지 않았거나 덜 깎였을 때만 가산.
 * - 자기 강화: 싸움이 몇 턴 더 이어질 때만, 늘어나는 피해(힘)나 줄어드는 받는
 *   피해(방어·회피)를 어림한 만큼.
 *
 * 같은 값이면 앞의 후보를 고른다. 성격은 반영하지 않는다.
 *
 * @param candidates 지금 쓸 수 있는 기술. 비어 있으면 안 된다.
 */
export function pickHardAction(
  actor: Actor,
  foe: Actor,
  candidates: Action[],
  level: Level
): Action {
  if (candidates.length === 0) throw new Error('No candidate actions')
  const bestHit = bestExpectedHit(actor, foe, candidates, level)
  const turnsLeft =
    bestHit > 0 ? Math.ceil(foe.combat.currentHp / bestHit) : Infinity
  const incoming = bestExpectedHit(
    foe,
    actor,
    foe.combat.actions.flatMap((id) => getActionById(id) ?? []),
    level
  )

  let best = candidates[0]
  let bestValue = -Infinity
  for (const action of candidates) {
    const value =
      getActionTargeting(action) === 'self'
        ? selfValue(actor, action, bestHit, incoming, turnsLeft)
        : attackValue(actor, foe, action, level)
    if (value > bestValue) {
      best = action
      bestValue = value
    }
  }
  return best
}

function bestExpectedHit(
  attacker: Actor,
  defender: Actor,
  actions: Action[],
  level: Level
): number {
  return Math.max(
    0,
    ...actions
      .filter((a) => getActionTargeting(a) !== 'self')
      .map(
        (a) =>
          estimateDamage(attacker, defender, a, level) *
          hitProbability(attacker, defender, a, level)
      )
  )
}

function attackValue(
  actor: Actor,
  foe: Actor,
  action: Action,
  level: Level
): number {
  const hit = hitProbability(actor, foe, action, level)
  let value = estimateDamage(actor, foe, action, level) * hit
  if (estimateDamage(actor, foe, action, level, 0) >= foe.combat.currentHp) {
    value += foe.combat.maxHp * hit
  }

  const effect = action.effect
  if (effect?.target !== 'opponent') return value
  if (
    effect.type === 'status' &&
    effect.condition &&
    foe.combat.statusCondition === null
  ) {
    value += STATUS_VALUE[effect.condition] * foe.combat.maxHp * hit
  }
  if (
    effect.type === 'debuff' &&
    effect.statChange &&
    foe.combat.statStages[effect.statChange.stat] > DEBUFF_STAGE_FLOOR
  ) {
    value += DEBUFF_VALUE * foe.combat.maxHp * hit
  }
  return value
}

function selfValue(
  actor: Actor,
  action: Action,
  bestHit: number,
  incoming: number,
  turnsLeft: number
): number {
  const change = action.effect?.statChange
  if (action.effect?.type !== 'buff' || !change) return 0
  const horizon = Math.min(BUFF_HORIZON_TURNS, turnsLeft - 1)
  if (horizon <= 0) return 0

  const stage = actor.combat.statStages[change.stat]
  const ratio =
    getStatMultiplier(stage + change.stages) / getStatMultiplier(stage)
  const perTurn =
    change.stat === 'strength'
      ? bestHit * (ratio - 1)
      : incoming * (1 - 1 / ratio)
  return perTurn * horizon
}
