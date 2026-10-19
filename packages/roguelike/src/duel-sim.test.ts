import { describe, it, expect } from 'vitest'
import { getArthropodById } from '@super-insect-battle/engine'
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

  it('tallies a batch over consecutive seeds', () => {
    const mantis = species('mantis')
    const scorpion = species('scorpion')
    const result = duelBatch(mantis, scorpion, 5, 3)
    const wins = [3, 4, 5, 6, 7].filter(
      (seed) => runAutoDuel(mantis, scorpion, seed).status === 'won'
    ).length
    expect(result).toMatchObject({ games: 5, playerWins: wins })
    expect(result.averageTurns).toBeGreaterThan(0)
  })
})
