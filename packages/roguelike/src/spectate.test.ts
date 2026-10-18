import { describe, it, expect } from 'vitest'
import { getArthropodById, type Environment } from '@super-insect-battle/engine'
import { createActor } from './actor'
import { tileAt, tileMapFromStrings } from './map'
import { showdownReport } from './render'
import {
  applyCommand,
  canSpectate,
  createRun,
  spectateTurn,
  survivorCount,
  type Level,
} from './run'
import {
  createShowdownRun,
  showdownPlacement,
  showdownWinner,
} from './showdown'

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

function fallenShowdown(seed: number) {
  const run = createShowdownRun({ playerSpecies: species('cricket'), seed })
  while (run.status === 'playing') applyCommand(run, { type: 'wait' })
  return run
}

describe('spectating', () => {
  it('plays the arena out to a single winner after the player falls', () => {
    const run = fallenShowdown(2)
    expect(run.status).toBe('dead')
    const placement = showdownPlacement(run)
    const endTurn = run.stats.endTurn
    expect(canSpectate(run)).toBe(placement > 2)

    while (canSpectate(run)) spectateTurn(run)

    expect(run.status).toBe('dead')
    expect(survivorCount(run)).toBe(1)
    expect(showdownWinner(run)).not.toBeNull()
    expect(showdownPlacement(run)).toBe(placement)
    expect(run.stats.endTurn).toBe(endTurn)
    expect(run.level.visible).toBeUndefined()
    expect(showdownReport(run)).toContain(`${placement}위`)
    expect(showdownReport(run)).toContain('우승: ')
  })

  it('does nothing while the player is alive', () => {
    const run = createShowdownRun({ playerSpecies: species('mantis'), seed: 2 })
    expect(canSpectate(run)).toBe(false)
    expect(spectateTurn(run)).toEqual([])
    expect(run.turn).toBe(0)
  })
})

describe('run stats', () => {
  function arena(actors: Level['actors']) {
    const level: Level = {
      depth: 1,
      map: tileMapFromStrings(['#####', '#...#', '#...#', '#####']),
      actors,
      environment: ENV,
      exit: null,
    }
    return createRun({ player: actors[0], level, seed: 1, mode: 'showdown' })
  }

  it('credits the player with kills they land and keeps collected cubes after dropping them', () => {
    const player = createActor(
      'p',
      species('stag_beetle'),
      { x: 1, y: 1 },
      'player'
    )
    const weak = createActor('w', species('cricket'), { x: 3, y: 1 }, 'w')
    const other = createActor('o', species('cricket'), { x: 3, y: 2 }, 'o')
    weak.combat.currentHp = 1
    const run = arena([player, weak, other])
    const cubeTile = tileAt(run.level.map, 2, 1)
    if (cubeTile) cubeTile.cubes = 2

    applyCommand(run, { type: 'move', dir: 'e' })
    for (let i = 0; i < 10 && weak.combat.currentHp > 0; i++) {
      applyCommand(run, { type: 'move', dir: 'e' })
    }

    expect(run.stats.kills).toBe(1)
    expect(run.stats.cubesCollected).toBe(2)
  })
})
