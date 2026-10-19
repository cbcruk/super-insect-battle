import { describe, it, expect } from 'vitest'
import { getArthropodById } from '@super-insect-battle/engine'
import { createDuelRun } from '@super-insect-battle/roguelike'
import { duelWinner } from './duel-winner.ts'

function duel() {
  const mantis = getArthropodById('mantis')
  const scorpion = getArthropodById('scorpion')
  if (!mantis || !scorpion) throw new Error('missing species')
  return createDuelRun({
    playerSpecies: mantis,
    opponentSpecies: scorpion,
    seed: 1,
  })
}

describe('duelWinner', () => {
  it('is undefined while the duel is still playing', () => {
    expect(duelWinner(duel())).toBeUndefined()
  })

  it('treats a same-turn double knockout as a draw even when status says won', () => {
    const run = duel()
    run.status = 'won'
    for (const actor of run.level.actors) actor.combat.currentHp = 0
    expect(duelWinner(run)).toBeUndefined()
  })

  it('names the sole survivor', () => {
    const run = duel()
    run.status = 'dead'
    run.player.combat.currentHp = 0
    expect(duelWinner(run)?.species.id).toBe('scorpion')
  })
})
