import { describe, expect, it } from 'vitest'
import { particleFade, spawnBurst, stepParticle } from './hit-particles.ts'

describe('hit particles', () => {
  it('spawns venom particles rising from the cell center', () => {
    const particles = spawnBurst('venom', 100, 100, 0, () => 0.5)
    expect(particles.length).toBeGreaterThan(0)
    for (const p of particles) {
      expect(p.x).toBe(100)
      expect(p.vy).toBeLessThan(0)
    }
  })

  it('scatters critical sparks in every direction', () => {
    let i = 0
    const sweep = (): number => (i++ % 11) / 11
    const particles = spawnBurst('critical', 0, 0, 0, sweep)
    expect(particles.some((p) => p.vx > 0)).toBe(true)
    expect(particles.some((p) => p.vx < 0)).toBe(true)
  })

  it('holds still while delayed, then moves and expires', () => {
    const [p] = spawnBurst('venom', 0, 0, 100, () => 0.5)
    expect(stepParticle(p, 60)).toBe(true)
    expect(p.y).toBe(0)
    expect(p.delayMs).toBe(40)

    stepParticle(p, 40)
    stepParticle(p, 100)
    expect(p.y).toBeLessThan(0)
    expect(particleFade(p)).toBeLessThan(1)

    expect(stepParticle(p, p.lifeMs)).toBe(false)
    expect(particleFade(p)).toBe(0)
  })
})
