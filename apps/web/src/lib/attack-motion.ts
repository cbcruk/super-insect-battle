import type { Vec2 } from '@super-insect-battle/roguelike'
import type {
  AttackMotion,
  MotionFrame,
  MotionKind,
} from './attack-motion.types.ts'

/** 돌진이 대상에 닿기까지 걸리는 시간(ms). */
export const LUNGE_IMPACT_MS = 70
/** 돌진이 제자리로 돌아오기까지의 전체 시간(ms). */
export const LUNGE_DURATION_MS = 170
/** 맞은 쪽이 밀렸다 돌아오는 시간(ms). */
export const RECOIL_DURATION_MS = 140

const PROJECTILE_MS_PER_CELL = 30
const PROJECTILE_MAX_MS = 220
const LUNGE_REACH = 0.4
const RECOIL_DISTANCE = 0.15
const TRAIL_LENGTH = 0.3

const chebyshev = (a: Vec2, b: Vec2): number =>
  Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))

/**
 * 공격자와 대상의 거리로 움직임 종류를 정한다.
 *
 * @returns 자기 자신을 대상으로 한 기술이면 `null`.
 */
export function motionKind(from: Vec2, to: Vec2): MotionKind | null {
  const distance = chebyshev(from, to)
  if (distance === 0) return null
  return distance === 1 ? 'lunge' : 'projectile'
}

/** 투사체가 대상까지 날아가는 시간(ms). */
export function projectileFlightMs(from: Vec2, to: Vec2): number {
  return Math.min(
    PROJECTILE_MAX_MS,
    chebyshev(from, to) * PROJECTILE_MS_PER_CELL
  )
}

/** 움직임이 시작된 뒤 대상에 닿기까지의 시간(ms). 피격 연출을 이만큼 늦춘다. */
export function impactLeadMs(kind: MotionKind, from: Vec2, to: Vec2): number {
  return kind === 'lunge' ? LUNGE_IMPACT_MS : projectileFlightMs(from, to)
}

/**
 * 돌진 시작 후 `tMs` 시점에 대상 쪽으로 뻗은 정도(0 → 1 → 0).
 *
 * 닿을 때까지는 빠르게 뻗고, 이후 천천히 돌아온다.
 */
export function lungeReach(tMs: number): number {
  if (tMs <= 0 || tMs >= LUNGE_DURATION_MS) return 0
  if (tMs < LUNGE_IMPACT_MS) {
    const t = tMs / LUNGE_IMPACT_MS
    return 1 - (1 - t) * (1 - t)
  }
  const t = (tMs - LUNGE_IMPACT_MS) / (LUNGE_DURATION_MS - LUNGE_IMPACT_MS)
  return (1 - t) * (1 - t)
}

/** 피격 후 `tMs` 시점에 맞은 쪽이 밀려난 정도(1 → 0). */
export function recoilPush(tMs: number): number {
  if (tMs <= 0 || tMs >= RECOIL_DURATION_MS) return 0
  const t = tMs / RECOIL_DURATION_MS
  return (1 - t) * (1 - t)
}

/** 방향 벡터를 길이 1로 맞춘다. 대각 돌진이 직선보다 멀리 나가지 않게 한다. */
export function unitDirection(from: Vec2, to: Vec2): Vec2 {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy)
  return length === 0 ? { x: 0, y: 0 } : { x: dx / length, y: dy / length }
}

const ZERO: Vec2 = { x: 0, y: 0 }

const scale = (v: Vec2, k: number): Vec2 => ({ x: v.x * k, y: v.y * k })

const lerp = (a: Vec2, b: Vec2, t: number): Vec2 => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
})

/**
 * 움직임 시작 후 `elapsedMs` 시점의 프레임을 계산한다.
 *
 * 돌진은 공격자가 대상 쪽으로 뻗었다 돌아오고, 투사체는 출발점에서 대상까지 날아간다.
 * 명중했다면 닿는 순간부터 맞은 쪽이 공격 방향으로 밀렸다 돌아온다.
 */
export function motionFrame(
  motion: Pick<AttackMotion, 'kind' | 'from' | 'to' | 'hit'>,
  elapsedMs: number
): MotionFrame {
  const dir = unitDirection(motion.from, motion.to)
  const impact = impactLeadMs(motion.kind, motion.from, motion.to)
  const sinceImpact = elapsedMs - impact

  const attacker =
    motion.kind === 'lunge'
      ? scale(dir, lungeReach(elapsedMs) * LUNGE_REACH)
      : ZERO
  const defender = motion.hit
    ? scale(dir, recoilPush(sinceImpact) * RECOIL_DISTANCE)
    : ZERO

  let projectile: MotionFrame['projectile'] = null
  if (motion.kind === 'projectile' && elapsedMs >= 0 && sinceImpact < 0) {
    const progress = elapsedMs / impact
    projectile = {
      head: lerp(motion.from, motion.to, progress),
      tail: lerp(motion.from, motion.to, Math.max(0, progress - TRAIL_LENGTH)),
    }
  }

  const end = Math.max(
    motion.kind === 'lunge' ? LUNGE_DURATION_MS : impact,
    motion.hit ? impact + RECOIL_DURATION_MS : impact
  )

  return { attacker, defender, projectile, done: elapsedMs >= end }
}
