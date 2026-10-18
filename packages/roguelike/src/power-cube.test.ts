import { describe, it, expect } from 'vitest'
import {
  createBattleArthropod,
  getArthropodById,
  type Environment,
} from '@super-insect-battle/engine'
import { createActor } from './actor'
import { tileAt, tileMapFromStrings } from './map'
import { absorbCubes, CUBE_HP_RATIO } from './power-cube'
import { applyCommand, createRun, type Level } from './run'

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

describe('absorbCubes', () => {
  it('raises max and current HP per cube and strength every third cube', () => {
    const actor = createActor('a', species('mantis'), { x: 0, y: 0 }, 'a')
    const base = createBattleArthropod(actor.species).maxHp
    const perCube = Math.round(base * CUBE_HP_RATIO)
    actor.combat.currentHp = 10

    absorbCubes(actor, 2)
    expect(actor.cubes).toBe(2)
    expect(actor.combat.maxHp).toBe(base + perCube * 2)
    expect(actor.combat.currentHp).toBe(10 + perCube * 2)
    expect(actor.combat.statStages.strength).toBe(0)

    absorbCubes(actor, 1)
    expect(actor.combat.statStages.strength).toBe(1)
  })
})

describe('cubes on the grid', () => {
  function run(rows: string[], actors: Level['actors']) {
    const level: Level = {
      depth: 1,
      map: tileMapFromStrings(rows),
      actors,
      environment: ENV,
      exit: null,
    }
    return createRun({ player: actors[0], level, seed: 1, mode: 'showdown' })
  }

  it('lets the actor stepping on a cube tile take every cube there', () => {
    const player = createActor('p', species('mantis'), { x: 1, y: 1 }, 'player')
    const r = run(['#####', '#...#', '#####'], [player])
    const tile = tileAt(r.level.map, 2, 1)
    if (tile) tile.cubes = 3

    const events = applyCommand(r, { type: 'move', dir: 'e' })

    expect(player.cubes).toBe(3)
    expect(tile?.cubes).toBeUndefined()
    expect(events.some((e) => e.type === 'pickup')).toBe(true)
  })

  it('drops all held cubes where an actor falls', () => {
    const player = createActor(
      'p',
      species('stag_beetle'),
      { x: 1, y: 1 },
      'player'
    )
    const rival = createActor('r', species('cricket'), { x: 2, y: 1 }, 'r')
    const third = createActor('t', species('cricket'), { x: 3, y: 3 }, 't')
    rival.cubes = 4
    rival.combat.currentHp = 1
    const r = run(
      ['#####', '#...#', '#...#', '#...#', '#####'],
      [player, rival, third]
    )

    for (let i = 0; i < 10 && rival.combat.currentHp > 0; i++) {
      applyCommand(r, { type: 'move', dir: 'e' })
    }

    expect(rival.combat.currentHp).toBe(0)
    expect((tileAt(r.level.map, 2, 1)?.cubes ?? 0) + player.cubes).toBe(4)
  })
})
