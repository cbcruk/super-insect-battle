import { describe, expect, it } from 'vitest'
import {
  LUNGE_DURATION_MS,
  LUNGE_IMPACT_MS,
  impactLeadMs,
  lungeReach,
  motionFrame,
  motionKind,
  recoilPush,
  unitDirection,
} from './attack-motion.ts'

describe('motionKind', () => {
  it('lunges at adjacent targets, including diagonals', () => {
    expect(motionKind({ x: 1, y: 1 }, { x: 2, y: 1 })).toBe('lunge')
    expect(motionKind({ x: 1, y: 1 }, { x: 2, y: 2 })).toBe('lunge')
  })

  it('fires a projectile at distant targets and skips self-targets', () => {
    expect(motionKind({ x: 1, y: 1 }, { x: 4, y: 1 })).toBe('projectile')
    expect(motionKind({ x: 1, y: 1 }, { x: 1, y: 1 })).toBeNull()
  })
})

describe('timing curves', () => {
  it('lunges out to full reach at impact, then returns', () => {
    expect(lungeReach(0)).toBe(0)
    expect(lungeReach(LUNGE_IMPACT_MS)).toBeCloseTo(1)
    expect(lungeReach((LUNGE_IMPACT_MS + LUNGE_DURATION_MS) / 2)).toBeLessThan(
      1
    )
    expect(lungeReach(LUNGE_DURATION_MS)).toBe(0)
  })

  it('pushes the target back and lets it settle', () => {
    expect(recoilPush(1)).toBeGreaterThan(0.9)
    expect(recoilPush(1000)).toBe(0)
  })

  it('delays impact longer for farther projectiles, up to a cap', () => {
    const near = impactLeadMs('projectile', { x: 0, y: 0 }, { x: 2, y: 0 })
    const far = impactLeadMs('projectile', { x: 0, y: 0 }, { x: 5, y: 0 })
    const huge = impactLeadMs('projectile', { x: 0, y: 0 }, { x: 40, y: 0 })
    expect(far).toBeGreaterThan(near)
    expect(huge).toBeLessThanOrEqual(220)
    expect(impactLeadMs('lunge', { x: 0, y: 0 }, { x: 1, y: 0 })).toBe(
      LUNGE_IMPACT_MS
    )
  })
})

describe('unitDirection', () => {
  it('keeps diagonal lunges the same length as straight ones', () => {
    const d = unitDirection({ x: 0, y: 0 }, { x: 1, y: 1 })
    expect(Math.hypot(d.x, d.y)).toBeCloseTo(1)
  })
})

describe('motionFrame', () => {
  const lunge = {
    kind: 'lunge' as const,
    from: { x: 0, y: 0 },
    to: { x: 1, y: 0 },
    hit: true,
  }

  it('moves the attacker toward the target and pushes the target on impact', () => {
    const atImpact = motionFrame(lunge, LUNGE_IMPACT_MS)
    expect(atImpact.attacker.x).toBeCloseTo(0.4)
    expect(atImpact.defender.x).toBe(0)

    const after = motionFrame(lunge, LUNGE_IMPACT_MS + 10)
    expect(after.defender.x).toBeGreaterThan(0)
    expect(after.done).toBe(false)

    expect(motionFrame(lunge, 1000).done).toBe(true)
  })

  it('leaves the target still on a miss', () => {
    const frame = motionFrame({ ...lunge, hit: false }, LUNGE_IMPACT_MS + 10)
    expect(frame.defender).toEqual({ x: 0, y: 0 })
  })

  it('flies a projectile from the attacker to the target', () => {
    const shot = { ...lunge, kind: 'projectile' as const, to: { x: 4, y: 0 } }
    const flight = impactLeadMs('projectile', shot.from, shot.to)
    const mid = motionFrame(shot, flight / 2)
    expect(mid.attacker).toEqual({ x: 0, y: 0 })
    expect(mid.projectile?.head.x).toBeCloseTo(2)
    expect(mid.projectile!.tail.x).toBeLessThan(mid.projectile!.head.x)
    expect(motionFrame(shot, flight).projectile).toBeNull()
  })
})
