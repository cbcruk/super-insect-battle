import {
  getActionTargeting,
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
const BUFF_GAIN_PER_TURN = 0.4
const BUFF_HORIZON_TURNS = 3

/**
 * 어려움 AI가 격자에서 쓸 기술을 기대 이득으로 고른다.
 *
 * 공격은 명중 확률 × 추정 피해, 확실히 쓰러뜨릴 수 있으면 큰 가산점을 준다.
 * 상태이상·약화는 상대가 아직 멀쩡할 때만, 자기 강화는 싸움이 몇 턴 더 이어질 때만
 * 값을 쳐준다. 같은 값이면 앞의 후보를 고른다.
 */
export function pickHardAction(
  actor: Actor,
  foe: Actor,
  candidates: Action[],
  level: Level
): Action {
  const attacks = candidates.filter((a) => getActionTargeting(a) !== 'self')
  const bestHit = Math.max(
    0,
    ...attacks.map(
      (a) =>
        estimateDamage(actor, foe, a, level) *
        hitProbability(actor, foe, a, level)
    )
  )
  const turnsLeft =
    bestHit > 0 ? Math.ceil(foe.combat.currentHp / bestHit) : Infinity

  let best = candidates[0]
  let bestValue = -Infinity
  for (const action of candidates) {
    const value =
      getActionTargeting(action) === 'self'
        ? selfValue(action, bestHit, turnsLeft)
        : attackValue(actor, foe, action, level)
    if (value > bestValue) {
      best = action
      bestValue = value
    }
  }
  return best
}

function attackValue(
  actor: Actor,
  foe: Actor,
  action: Action,
  level: Level
): number {
  const hit = hitProbability(actor, foe, action, level)
  const damage = estimateDamage(actor, foe, action, level)
  let value = damage * hit
  if (damage >= foe.combat.currentHp) value += foe.combat.maxHp * hit

  const effect = action.effect
  if (effect?.target === 'opponent' && foe.combat.statusCondition === null) {
    if (effect.type === 'status' && effect.condition) {
      value += STATUS_VALUE[effect.condition] * foe.combat.maxHp * hit
    }
  }
  if (effect?.target === 'opponent' && effect.type === 'debuff') {
    value += DEBUFF_VALUE * foe.combat.maxHp * hit
  }
  return value
}

function selfValue(action: Action, bestHit: number, turnsLeft: number): number {
  if (!action.effect?.statChange || action.effect.type !== 'buff') return 0
  const horizon = Math.min(BUFF_HORIZON_TURNS, turnsLeft - 1)
  if (horizon <= 0) return 0
  return (
    bestHit * BUFF_GAIN_PER_TURN * action.effect.statChange.stages * horizon
  )
}
