import { describe, it, expect } from 'vitest'
import { createRng, randInt, randChance, pick } from './rng'
import { simulateBattle, simulateMultipleBattles } from './battle-engine'
import { arthropods } from '../data/arthropods'

describe('createRng (mulberry32)', () => {
  it('produces identical sequences for the same seed', () => {
    const a = createRng(12345)
    const b = createRng(12345)
    const seqA = Array.from({ length: 20 }, () => a())
    const seqB = Array.from({ length: 20 }, () => b())
    expect(seqA).toEqual(seqB)
  })

  it('produces different sequences for different seeds', () => {
    const a = createRng(1)
    const b = createRng(2)
    const seqA = Array.from({ length: 20 }, () => a())
    const seqB = Array.from({ length: 20 }, () => b())
    expect(seqA).not.toEqual(seqB)
  })

  it('stays within [0, 1)', () => {
    const rng = createRng(999)
    for (let i = 0; i < 1000; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('randInt respects inclusive bounds', () => {
    const rng = createRng(42)
    for (let i = 0; i < 500; i++) {
      const v = randInt(rng, 2, 4)
      expect(v).toBeGreaterThanOrEqual(2)
      expect(v).toBeLessThanOrEqual(4)
      expect(Number.isInteger(v)).toBe(true)
    }
  })

  it('randChance and pick are deterministic per seed', () => {
    const chanceA = Array.from({ length: 10 }, (_, i) =>
      randChance(createRng(i), 0.5)
    )
    const chanceB = Array.from({ length: 10 }, (_, i) =>
      randChance(createRng(i), 0.5)
    )
    expect(chanceA).toEqual(chanceB)

    const items = ['a', 'b', 'c', 'd'] as const
    expect(pick(createRng(7), items)).toBe(pick(createRng(7), items))
  })
})

describe('seeded battle reproducibility', () => {
  const p = arthropods.rhinoceros_beetle
  const o = arthropods.stag_beetle

  it('same seed yields an identical battle', () => {
    const r1 = simulateBattle(p, o, undefined, createRng(2026))
    const r2 = simulateBattle(p, o, undefined, createRng(2026))

    expect(r1.winner).toBe(r2.winner)
    expect(r1.turn).toBe(r2.turn)
    expect(r1.environment).toEqual(r2.environment)
    expect(r1.player.currentHp).toBe(r2.player.currentHp)
    expect(r1.opponent.currentHp).toBe(r2.opponent.currentHp)
    // 로그 전체(액션 문구·데미지)까지 완전 일치
    expect(r1.log).toEqual(r2.log)
  })

  it('different seeds diverge across a sample', () => {
    // 개별 전투는 우연히 같을 수 있으므로, 표본 승자 시퀀스가 갈리는지로 확인
    const seqA = Array.from(
      { length: 15 },
      (_, i) => simulateBattle(p, o, undefined, createRng(1000 + i)).winner
    )
    const seqB = Array.from(
      { length: 15 },
      (_, i) => simulateBattle(p, o, undefined, createRng(9000 + i)).winner
    )
    expect(seqA).not.toEqual(seqB)
  })

  it('simulateMultipleBattles is reproducible under a seed', () => {
    const a = simulateMultipleBattles(p, o, 50, undefined, createRng(77))
    const b = simulateMultipleBattles(p, o, 50, undefined, createRng(77))
    expect(a).toEqual(b)
  })

  it('defaults to non-seeded Math.random when no rng passed', () => {
    // 기존 동작 보존: 호출은 성공하고 유효한 승자를 반환
    const r = simulateBattle(p, o)
    expect(['player', 'opponent', 'draw']).toContain(r.winner)
  })
})
