import type {
  Action,
  StatusCondition,
  Rng,
  BattleLogEntry,
} from '@super-insect-battle/engine'
import {
  calculateDamage,
  checkAccuracy,
  applyActionEffect,
  statusConditionNames,
} from '@super-insect-battle/engine'
import type { Actor } from './actor'
import type { Level } from './run'
import { tileAt } from './map'
import { TERRAIN } from './terrain'

export interface CombatOutcome {
  attackerId: string
  defenderId: string
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
