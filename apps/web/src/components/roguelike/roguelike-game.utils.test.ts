import { describe, it, expect } from 'vitest'
import { getArthropodById } from '@super-insect-battle/engine'
import {
  createGeneratedRun,
  createShowdownRun,
} from '@super-insect-battle/roguelike'
import { outcomeTitle, progressLabel } from './roguelike-game.utils.ts'

const mantis = getArthropodById('mantis')!

describe('progressLabel', () => {
  it('shows depth for descent and survivors for showdown', () => {
    const descent = createGeneratedRun({ playerSpecies: mantis, seed: 1 })
    const showdown = createShowdownRun({ playerSpecies: mantis, seed: 1 })
    expect(progressLabel(descent)).toBe('밀림 1층 / 3')
    expect(progressLabel(showdown)).toBe('쇼다운 · 생존 9마리')
  })
})

describe('outcomeTitle', () => {
  it('adds the placement when the player falls in a showdown', () => {
    const run = createShowdownRun({ playerSpecies: mantis, seed: 1 })
    run.status = 'dead'
    run.level.actors = run.level.actors.filter((a) => a !== run.player)
    expect(outcomeTitle(run)).toBe('쓰러졌다... 10위')
    run.status = 'won'
    expect(outcomeTitle(run)).toBe('최후의 1마리!')
  })
})
