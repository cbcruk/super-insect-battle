import { describe, it, expect } from 'vitest'
import { parsePlayArgs } from './cli-args'

const RANDOM = 42

describe('parsePlayArgs', () => {
  it('keeps the existing descent and showdown forms', () => {
    expect(parsePlayArgs([], RANDOM)).toEqual({ mode: 'descent', seed: 42 })
    expect(parsePlayArgs(['7'], RANDOM)).toEqual({ mode: 'descent', seed: 7 })
    expect(parsePlayArgs(['showdown', '9'], RANDOM)).toEqual({
      mode: 'showdown',
      seed: 9,
    })
  })

  it('reads a hand-played duel', () => {
    expect(parsePlayArgs(['duel', 'mantis', 'scorpion'], RANDOM)).toEqual({
      mode: 'duel',
      playerId: 'mantis',
      opponentId: 'scorpion',
      seed: 42,
      auto: false,
      batch: null,
    })
  })

  it('reads --auto and --batch in any position', () => {
    expect(
      parsePlayArgs(['duel', 'mantis', 'scorpion', '5', '--auto'], RANDOM)
    ).toMatchObject({ seed: 5, auto: true, batch: null })
    expect(
      parsePlayArgs(['duel', '--batch', '60', 'mantis', 'scorpion'], RANDOM)
    ).toMatchObject({ playerId: 'mantis', seed: 1, batch: 60 })
    expect(
      parsePlayArgs(
        ['duel', 'mantis', 'scorpion', '10', '--batch', '3'],
        RANDOM
      )
    ).toMatchObject({ seed: 10, batch: 3 })
  })

  it('explains bad input', () => {
    const bad = [
      ['duel', 'mantis'],
      ['duel', 'mantis', 'scorpion', 'x'],
      ['duel', 'mantis', 'scorpion', '--batch'],
      ['duel', 'mantis', 'scorpion', '--batch', '0'],
      ['duel', 'mantis', 'scorpion', '--fast'],
      ['showdown', '--auto'],
    ]
    for (const argv of bad) {
      expect(parsePlayArgs(argv, RANDOM)).toHaveProperty('error')
    }
  })
})
