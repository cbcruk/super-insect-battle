import { describe, it, expect } from 'vitest'
import { getArthropodById, type Environment } from '@super-insect-battle/engine'
import { createActor } from './actor'
import { chebyshev } from './geometry'
import { tileMapFromStrings } from './map'
import { applyCommand, createRun, type Level } from './run'
import { survivorCount } from './run'
import { createShowdownRun, showdownPlacement } from './showdown'

const ENV: Environment = {
  terrain: 'forest',
  timeOfDay: 'day',
  weather: 'clear',
}

function species(id: string) {
  const a = getArthropodById(id)
  if (!a) throw new Error(`missing ${id}`)
  return a
}

describe('createShowdownRun', () => {
  it('drops the player and rivals, each in their own faction, into an exitless arena', () => {
    const run = createShowdownRun({ playerSpecies: species('mantis'), seed: 3 })
    const factions = new Set(run.level.actors.map((a) => a.faction))

    expect(run.mode).toBe('showdown')
    expect(run.level.exit).toBeNull()
    expect(run.level.actors).toHaveLength(10)
    expect(factions.size).toBe(10)
    expect(survivorCount(run)).toBe(9)
  })

  it('spreads spawns apart', () => {
    const run = createShowdownRun({ playerSpecies: species('mantis'), seed: 3 })
    const { actors } = run.level
    for (const a of actors) {
      for (const b of actors) {
        if (a !== b) expect(chebyshev(a.pos, b.pos)).toBeGreaterThanOrEqual(4)
      }
    }
  })

  it('is deterministic per seed', () => {
    const layout = (seed: number) =>
      createShowdownRun({ playerSpecies: species('mantis'), seed })
        .level.actors.map((a) => `${a.species.id}@${a.pos.x},${a.pos.y}`)
        .join(' ')
    expect(layout(11)).toBe(layout(11))
    expect(layout(11)).not.toBe(layout(12))
  })
})

describe('showdown outcome', () => {
  function duel(enemyHp: number) {
    const player = createActor(
      'p',
      species('stag_beetle'),
      { x: 1, y: 1 },
      'player'
    )
    const rival = createActor('r', species('cricket'), { x: 2, y: 1 }, 'r')
    rival.combat.currentHp = enemyHp
    const level: Level = {
      depth: 1,
      map: tileMapFromStrings(['####', '#..#', '####']),
      actors: [player, rival],
      environment: ENV,
      exit: null,
    }
    return createRun({ player, level, seed: 1, mode: 'showdown' })
  }

  it('wins once the last rival falls', () => {
    const run = duel(1)
    for (let i = 0; i < 10 && run.status === 'playing'; i++) {
      applyCommand(run, { type: 'move', dir: 'e' })
    }
    expect(run.status).toBe('won')
    expect(showdownPlacement(run)).toBe(1)
  })

  it('ranks a fallen player behind every surviving rival', () => {
    const run = duel(10)
    run.player.combat.currentHp = 1
    run.player.combat.statusCondition = 'poison'
    applyCommand(run, { type: 'wait' })
    expect(run.status).toBe('dead')
    expect(showdownPlacement(run)).toBe(2)
  })
})

describe('confusion self-hit', () => {
  it('kills an actor knocked to 0 HP by its own confusion instead of stalling the turn loop', () => {
    const player = createActor('p', species('mantis'), { x: 1, y: 1 }, 'player')
    const level: Level = {
      depth: 1,
      map: tileMapFromStrings(['###', '#.#', '###']),
      actors: [player],
      environment: ENV,
      exit: null,
    }
    const run = createRun({ player, level, seed: 5 })
    player.combat.currentHp = 1
    player.combat.statusCondition = 'confusion'

    for (let i = 0; i < 40 && run.status === 'playing'; i++) {
      player.combat.statusCondition = 'confusion'
      applyCommand(run, { type: 'wait' })
    }
    expect(run.status).toBe('dead')
  })
})
