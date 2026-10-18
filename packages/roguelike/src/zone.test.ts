import { describe, it, expect } from 'vitest'
import { getArthropodById, type Environment } from '@super-insect-battle/engine'
import { createActor } from './actor'
import { createSmartBrain } from './ai/smart-brain'
import { tileMapFromStrings } from './map'
import { applyCommand, createRun, type Level } from './run'
import { createShowdownRun } from './showdown'
import {
  gasDamage,
  isInGas,
  turnsUntilShrink,
  zoneRadius,
  type SafeZone,
} from './zone'

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

const ZONE: SafeZone = {
  center: { x: 5, y: 5 },
  initialRadius: 3,
  shrinkStart: 10,
  shrinkEvery: 2,
}

describe('safe zone schedule', () => {
  it('holds until shrinkStart, then shrinks one step per interval down to 0', () => {
    expect(zoneRadius(ZONE, 0)).toBe(3)
    expect(zoneRadius(ZONE, 9)).toBe(3)
    expect(zoneRadius(ZONE, 10)).toBe(2)
    expect(zoneRadius(ZONE, 11)).toBe(2)
    expect(zoneRadius(ZONE, 12)).toBe(1)
    expect(zoneRadius(ZONE, 14)).toBe(0)
    expect(zoneRadius(ZONE, 99)).toBe(0)
  })

  it('counts down to the next shrink and stops once only the center is left', () => {
    expect(turnsUntilShrink(ZONE, 4)).toBe(6)
    expect(turnsUntilShrink(ZONE, 10)).toBe(2)
    expect(turnsUntilShrink(ZONE, 11)).toBe(1)
    expect(turnsUntilShrink(ZONE, 14)).toBeNull()
  })

  it('puts tiles beyond the radius in gas', () => {
    expect(isInGas(ZONE, { x: 8, y: 5 }, 0)).toBe(false)
    expect(isInGas(ZONE, { x: 8, y: 5 }, 10)).toBe(true)
    expect(isInGas(ZONE, { x: 5, y: 5 }, 99)).toBe(false)
  })
})

describe('gas in a run', () => {
  function level(zone: SafeZone, actors: Level['actors']): Level {
    return {
      depth: 1,
      map: tileMapFromStrings([
        '#########',
        '#.......#',
        '#.......#',
        '#########',
      ]),
      actors,
      environment: ENV,
      exit: null,
      zone,
    }
  }
  const zone: SafeZone = {
    center: { x: 1, y: 1 },
    initialRadius: 0,
    shrinkStart: 0,
    shrinkEvery: 1,
  }

  it('hurts actors that end their turn in gas', () => {
    const player = createActor('p', species('mantis'), { x: 6, y: 1 }, 'player')
    const run = createRun({ player, level: level(zone, [player]), seed: 1 })
    const before = player.combat.currentHp

    const events = applyCommand(run, { type: 'wait' })

    expect(player.combat.currentHp).toBe(before - gasDamage(player))
    expect(events.some((e) => e.type === 'status')).toBe(true)
  })

  it('makes brains retreat toward the center instead of chasing', () => {
    const player = createActor(
      'p',
      species('mantis'),
      { x: 10, y: 3 },
      'player'
    )
    const rival = createActor('r', species('cricket'), { x: 8, y: 1 }, 'r', {
      brain: createSmartBrain({ hunt: true }),
    })
    const run = createRun({
      player,
      level: {
        depth: 1,
        map: tileMapFromStrings([
          '############',
          '#..........#',
          '#..........#',
          '#..........#',
          '############',
        ]),
        actors: [player, rival],
        environment: ENV,
        exit: null,
        zone: { ...zone, initialRadius: 7, shrinkStart: 1 },
      },
      seed: 1,
    })
    const command = rival.brain?.decide(rival, run, run.rng)
    expect(command).toEqual({ type: 'move', dir: 'w' })
  })

  it('ends every showdown once the gas closes in', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const run = createShowdownRun({
        playerSpecies: species('mantis'),
        seed,
      })
      while (run.status === 'playing' && run.turn < 200) {
        applyCommand(run, { type: 'wait' })
      }
      expect(run.status).not.toBe('playing')
    }
  })
})
