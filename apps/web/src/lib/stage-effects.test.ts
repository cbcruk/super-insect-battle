import { describe, expect, it } from 'vitest'
import {
  createFlash,
  cueForHit,
  flashAlpha,
  stepFlash,
} from './stage-effects.ts'

describe('cueForHit', () => {
  it('flashes red whenever the player takes a hit', () => {
    expect(cueForHit({ kind: 'damage', onPlayer: true }).flash?.color).toBe(
      '#ef4444'
    )
    expect(cueForHit({ kind: 'venom', onPlayer: true }).flash?.color).toBe(
      '#ef4444'
    )
  })

  it('pairs venom and critical hits with their bursts', () => {
    expect(cueForHit({ kind: 'venom', onPlayer: false }).burst).toBe('venom')
    expect(cueForHit({ kind: 'critical', onPlayer: true }).burst).toBe(
      'critical'
    )
    expect(cueForHit({ kind: 'damage', onPlayer: false }).burst).toBeUndefined()
  })

  it('stays quiet for misses and conditions', () => {
    expect(cueForHit({ kind: 'miss', onPlayer: true })).toEqual({})
    expect(cueForHit({ kind: 'condition', onPlayer: false })).toEqual({})
  })
})

describe('cell flash', () => {
  it('is invisible while delayed, then fades out', () => {
    const f = createFlash(1, 2, { color: '#fff', alpha: 0.8 }, 100)
    expect(flashAlpha(f)).toBe(0)
    stepFlash(f, 100)
    expect(flashAlpha(f)).toBeCloseTo(0.8)
    stepFlash(f, 200)
    expect(flashAlpha(f)).toBeLessThan(0.8)
    expect(stepFlash(f, 200)).toBe(false)
  })
})
