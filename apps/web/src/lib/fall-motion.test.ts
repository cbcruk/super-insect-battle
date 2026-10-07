import { describe, expect, it } from 'vitest'
import { FALL_DURATION_MS, fallFrame } from './fall-motion.ts'

const pos = { x: 5, y: 5 }

describe('fallFrame', () => {
  it('stands still until the killing blow lands', () => {
    const frame = fallFrame(0, pos, { x: 4, y: 5 })
    expect(frame).toMatchObject({
      alpha: 1,
      rotation: 0,
      scale: 1,
      done: false,
    })
    expect(frame.offset).toEqual({ x: 0, y: 0 })
  })

  it('is knocked away from the attacker, tilting and fading', () => {
    const mid = fallFrame(FALL_DURATION_MS / 2, pos, { x: 4, y: 5 })
    expect(mid.offset.x).toBeGreaterThan(0)
    expect(mid.rotation).toBeGreaterThan(0)
    expect(mid.alpha).toBeLessThan(1)
    expect(mid.alpha).toBeGreaterThan(0)

    const left = fallFrame(FALL_DURATION_MS / 2, pos, { x: 6, y: 5 })
    expect(left.offset.x).toBeLessThan(0)
    expect(left.rotation).toBeLessThan(0)
  })

  it('sinks in place when there is no attacker', () => {
    const frame = fallFrame(FALL_DURATION_MS / 2, pos, null)
    expect(frame.offset.x).toBe(0)
    expect(frame.offset.y).toBeGreaterThan(0)
  })

  it('only fades under reduced motion', () => {
    const frame = fallFrame(FALL_DURATION_MS / 2, pos, { x: 4, y: 5 }, true)
    expect(frame.offset).toEqual({ x: 0, y: 0 })
    expect(frame.rotation).toBe(0)
    expect(frame.alpha).toBeCloseTo(0.5)
  })

  it('finishes invisible', () => {
    const end = fallFrame(FALL_DURATION_MS, pos, { x: 4, y: 5 })
    expect(end.done).toBe(true)
    expect(end.alpha).toBe(0)
  })
})
