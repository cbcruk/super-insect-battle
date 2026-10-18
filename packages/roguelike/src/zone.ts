import type { Actor } from './actor'
import { chebyshev, type Vec2 } from './geometry'

/**
 * 쇼다운의 안전 구역. 바깥은 독가스이고, 일정 턴마다 한 칸씩 좁아진다.
 *
 * 반경은 턴 수에서 바로 계산하므로 상태를 갱신할 필요가 없고 결정론이 유지된다.
 */
export interface SafeZone {
  /** 구역 중심. 마지막까지 안전한 칸. */
  center: Vec2
  /** 축소 전 반경 (체비셰프 거리). */
  initialRadius: number
  /** 이 턴부터 축소가 시작된다. */
  shrinkStart: number
  /** 축소 간격 (턴). */
  shrinkEvery: number
}

/** 독가스 한 턴 피해의 최대 HP 비율. */
export const GAS_DAMAGE_RATIO = 0.1

/** turn 시점의 안전 반경. 0이면 중심 한 칸만 안전하다. */
export function zoneRadius(zone: SafeZone, turn: number): number {
  if (turn < zone.shrinkStart) return zone.initialRadius
  const shrinks = Math.floor((turn - zone.shrinkStart) / zone.shrinkEvery) + 1
  return Math.max(0, zone.initialRadius - shrinks)
}

/** turn 시점에 pos 가 독가스 안인가. */
export function isInGas(zone: SafeZone, pos: Vec2, turn: number): boolean {
  return chebyshev(zone.center, pos) > zoneRadius(zone, turn)
}

/**
 * 다음 축소까지 남은 턴. 이미 중심 한 칸까지 줄었으면 null.
 *
 * @returns 이번 턴에 막 줄었으면 `shrinkEvery`, 축소 시작 전이면 시작까지의 턴 수.
 */
export function turnsUntilShrink(zone: SafeZone, turn: number): number | null {
  if (zoneRadius(zone, turn) === 0) return null
  if (turn < zone.shrinkStart) return zone.shrinkStart - turn
  return zone.shrinkEvery - ((turn - zone.shrinkStart) % zone.shrinkEvery)
}

/** 독가스 안에서 한 턴을 보낸 액터가 입는 피해. */
export function gasDamage(actor: Actor): number {
  return Math.max(1, Math.floor(actor.combat.maxHp * GAS_DAMAGE_RATIO))
}
