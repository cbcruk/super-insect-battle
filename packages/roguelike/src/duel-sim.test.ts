import { describe, it, expect } from 'vitest'
import { getArthropodById } from '@super-insect-battle/engine'
import { createDuelRun, duelOutcome } from './duel'
import { duelBatch, runAutoDuel } from './duel-sim'
import { duelReport } from './render'

function species(id: string) {
  const a = getArthropodById(id)
  if (!a) throw new Error(`missing ${id}`)
  return a
}

describe('duel sim', () => {
  it('plays an AI vs AI duel to the end, the same way per seed', () => {
    const a = runAutoDuel(species('mantis'), species('scorpion'), 3)
    const b = runAutoDuel(species('mantis'), species('scorpion'), 3)
    expect(a.status).not.toBe('playing')
    expect(duelReport(a)).toBe(duelReport(b))
    expect(duelReport(a)).toMatch(
      /^승자: .+\((1P|상대)\) · \d+턴 · 남은 HP \d+\/\d+$/
    )
  })

  it('passes the opponent AI settings to the opponent brain', () => {
    const mantis = species('mantis')
    const beetle = species('dung_beetle')
    const differs = Array.from({ length: 20 }, (_, i) => i + 1).some(
      (seed) =>
        duelReport(runAutoDuel(beetle, mantis, seed)) !==
        duelReport(runAutoDuel(beetle, mantis, seed, { difficulty: 'easy' }))
    )
    expect(differs).toBe(true)
    expect(
      duelBatch(beetle, mantis, 20, 1, { difficulty: 'easy' })
    ).not.toEqual(duelBatch(beetle, mantis, 20, 1))
  })

  it('tallies a batch over consecutive seeds', () => {
    const mantis = species('mantis')
    const scorpion = species('scorpion')
    const result = duelBatch(mantis, scorpion, 5, 3)
    const wins = [3, 4, 5, 6, 7].filter(
      (seed) => runAutoDuel(mantis, scorpion, seed).status === 'won'
    ).length
    expect(result).toMatchObject({ games: 5, playerWins: wins })
    expect(result.draws).toBeGreaterThanOrEqual(0)
    expect(result.averageTurns).toBeGreaterThan(0)
  })

  it('calls a double knockout a draw whichever side fell first', () => {
    for (const status of ['won', 'dead'] as const) {
      const run = createDuelRun({
        playerSpecies: species('mantis'),
        opponentSpecies: species('scorpion'),
        seed: 1,
      })
      for (const actor of run.level.actors) actor.combat.currentHp = 0
      run.status = status
      expect(duelOutcome(run)).toBe('draw')
      expect(duelReport(run)).toMatch(/^무승부/)
    }
  })

  it('reads a finished duel from the survivor', () => {
    const run = createDuelRun({
      playerSpecies: species('mantis'),
      opponentSpecies: species('scorpion'),
      seed: 1,
    })
    expect(duelOutcome(run)).toBe('undecided')
    run.player.combat.currentHp = 0
    run.status = 'dead'
    expect(duelOutcome(run)).toBe('opponent')
    expect(duelReport(run)).toMatch(/^승자: 전갈\(상대\)/)
  })
})
