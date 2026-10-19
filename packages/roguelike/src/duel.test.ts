import { describe, it, expect } from 'vitest'
import { getArthropodById } from '@super-insect-battle/engine'
import { createDuelRun, isAutopilot } from './duel'
import { applyCommand } from './run'

function species(id: string) {
  const a = getArthropodById(id)
  if (!a) throw new Error(`missing ${id}`)
  return a
}

describe('createDuelRun', () => {
  it('stands two rival factions apart in an exitless, gas-closing arena', () => {
    const run = createDuelRun({
      playerSpecies: species('mantis'),
      opponentSpecies: species('scorpion'),
      seed: 4,
    })
    const [player, opponent] = run.level.actors

    expect(run.mode).toBe('duel')
    expect(run.level.actors).toHaveLength(2)
    expect(player.faction).not.toBe(opponent.faction)
    expect(opponent.species.id).toBe('scorpion')
    expect(run.level.exit).toBeNull()
    expect(run.level.zone).toBeDefined()
    expect(isAutopilot(run)).toBe(false)
    expect(run.level.visible).toBeDefined()
  })

  it('lets AI fight AI to a decision with the whole arena in view', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const run = createDuelRun({
        playerSpecies: species('mantis'),
        opponentSpecies: species('scorpion'),
        seed,
        autopilot: true,
      })
      while (isAutopilot(run) && run.turn < 200) {
        const brain = run.player.brain
        if (!brain) break
        applyCommand(run, brain.decide(run.player, run, run.rng))
      }
      expect(run.status).not.toBe('playing')
      expect(run.level.visible).toBeUndefined()
      expect(run.stats.placement).toBe(run.status === 'won' ? 1 : 2)
    }
  })
})
