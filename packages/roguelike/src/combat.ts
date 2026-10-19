import type {
  Action,
  StatusCondition,
  Rng,
  BattleLogEntry,
} from '@super-insect-battle/engine'
import {
  calculateDamage,
  checkAccuracy,
  getHitChance,
  applyActionEffect,
  statusConditionNames,
} from '@super-insect-battle/engine'
import type { Actor } from './actor'
import type { Level } from './run'
import { tileAt } from './map'
import { TERRAIN } from './terrain'
import type { Vec2 } from './geometry'
import { scaleAppliedVenom } from './venom'

export interface CombatOutcome {
  attackerId: string
  defenderId: string
  /** 공격이 해결된 시점의 공격자 위치. 돌진·투사체 연출의 출발점으로 쓴다. */
  attackerPos: Vec2
  /** 공격이 해결된 시점의 방어자 위치. 피격 연출 좌표로 쓴다. */
  defenderPos: Vec2
  actionId: string
  hit: boolean
  damage: number
  critical: boolean
  defenderHp: number
  defeated: boolean
  statusApplied?: StatusCondition
  note: string // 한국어 로그 문구
}

/**
 * 한 액터가 다른 액터를 공격. 데미지·명중·상태이상은 엔진 함수를 재사용하고,
 * 격자 코어는 지형(수풀 은신)·바이옴(Level.environment) 컨텍스트만 얹는다.
 * defender.combat 을 제자리 변경한다.
 */
export function resolveAttack(
  attacker: Actor,
  defender: Actor,
  action: Action,
  level: Level,
  rng: Rng
): CombatOutcome {
  const attackerName = attacker.species.nameKo
  const defenderName = defender.species.nameKo

  if (!rollHit(attacker, defender, action, level, rng)) {
    return {
      attackerId: attacker.id,
      defenderId: defender.id,
      attackerPos: { ...attacker.pos },
      defenderPos: { ...defender.pos },
      actionId: action.id,
      hit: false,
      damage: 0,
      critical: false,
      defenderHp: defender.combat.currentHp,
      defeated: false,
      note: `${attackerName}의 ${action.nameKo} — 빗나갔다!`,
    }
  }

  let damage = 0
  let critical = false

  if (action.power > 0) {
    const result = calculateDamage(
      attacker.combat,
      defender.combat,
      action,
      level.environment,
      rng
    )
    damage = result.damage
    critical = result.critical
    defender.combat.currentHp = Math.max(0, defender.combat.currentHp - damage)
  }

  // 상태이상·버프 적용 (엔진 로직 재사용). logEntry는 문구 누적용 임시 객체.
  const before = defender.combat.statusCondition
  const scratch: BattleLogEntry = { turn: 0, actor: 'player', action: '' }
  applyActionEffect(attacker.combat, defender.combat, action, scratch, rng)
  const after = defender.combat.statusCondition
  const statusApplied = after !== null && after !== before ? after : undefined
  if (statusApplied === 'poison') scaleAppliedVenom(defender.combat)

  const defeated = defender.combat.currentHp <= 0

  let note = `${attackerName}의 ${action.nameKo}!`
  if (critical) note += ' 급소!'
  if (damage > 0) note += ` (${damage} 데미지)`
  if (statusApplied) {
    note += ` ${defenderName}은(는) ${statusConditionNames[statusApplied]} 상태!`
  }
  if (defeated) note += ` ${defenderName} 쓰러짐!`

  return {
    attackerId: attacker.id,
    defenderId: defender.id,
    attackerPos: { ...attacker.pos },
    defenderPos: { ...defender.pos },
    actionId: action.id,
    hit: true,
    damage,
    critical,
    defenderHp: defender.combat.currentHp,
    defeated,
    statusApplied,
    note,
  }
}

/**
 * 격자에서 공격이 명중할 확률(0~1)을 계산한다. 수풀 은신의 추가 회피까지 반영한다.
 */
export function hitProbability(
  attacker: Actor,
  defender: Actor,
  action: Action,
  level: Level
): number {
  const base =
    getHitChance(action, defender.combat, attacker.species.physical.lengthMm) /
    100
  const tile = tileAt(level.map, defender.pos.x, defender.pos.y)
  const evasionMod = tile ? TERRAIN[tile.terrain].evasionMod : 1
  return evasionMod > 1 ? base * (2 - evasionMod) : base
}

/**
 * 명중했을 때의 피해를 급소 없이 추정한다.
 *
 * 실제 공격과 달리 런의 RNG를 쓰지 않으므로 AI가 판을 바꾸지 않고 미리 계산할 수 있다.
 *
 * @param roll 피해 난수 폭(0.85~1.0) 안의 위치. 0이면 최소, 기본 0.5는 중간값.
 */
export function estimateDamage(
  attacker: Actor,
  defender: Actor,
  action: Action,
  level: Level,
  roll = 0.5
): number {
  if (action.power <= 0) return 0
  // 엔진은 급소 판정, 피해 난수 순으로 rng를 부른다. 0.5는 급소가 나지 않는 값이다
  let calls = 0
  const fixed: Rng = () => (calls++ === 0 ? 0.5 : roll)
  return calculateDamage(
    attacker.combat,
    defender.combat,
    action,
    level.environment,
    fixed
  ).damage
}

/** 엔진 명중 판정 + 지형 은신 추가 회피. */
function rollHit(
  attacker: Actor,
  defender: Actor,
  action: Action,
  level: Level,
  rng: Rng
): boolean {
  const baseHit = checkAccuracy(
    action,
    defender.combat,
    attacker.species.physical.lengthMm,
    rng
  )
  if (!baseHit) return false

  const tile = tileAt(level.map, defender.pos.x, defender.pos.y)
  const evasionMod = tile ? TERRAIN[tile.terrain].evasionMod : 1
  if (evasionMod > 1 && rng() < evasionMod - 1) {
    return false // 수풀 은신으로 추가 회피
  }
  return true
}
