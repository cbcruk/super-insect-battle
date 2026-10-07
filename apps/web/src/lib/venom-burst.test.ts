import { describe, expect, it } from 'vitest'
import {
  spawnVenomBurst,
  stepVenomParticle,
  venomParticleFade,
} from './venom-burst.ts'

describe('venom burst', () => {
  it('spawns particles that rise from the cell center', () => {
    const particles = spawnVenomBurst(100, 100, 0, () => 0.5)
    expect(particles.length).toBeGreaterThan(0)
    for (const p of particles) {
      expect(p.x).toBe(100)
      expect(p.vy).toBeLessThan(0)
    }
  })

  it('holds still while delayed, then moves and expires', () => {
    const [p] = spawnVenomBurst(0, 0, 100, () => 0.5)
    expect(stepVenomParticle(p, 60)).toBe(true)
    expect(p.y).toBe(0)
    expect(p.delayMs).toBe(40)

    stepVenomParticle(p, 40)
    stepVenomParticle(p, 100)
    expect(p.y).toBeLessThan(0)
    expect(venomParticleFade(p)).toBeLessThan(1)

    expect(stepVenomParticle(p, p.lifeMs)).toBe(false)
    expect(venomParticleFade(p)).toBe(0)
  })
})
