import { describe, it, expect } from 'vitest'
import { getArthropodById, type Environment } from '@super-insect-battle/engine'
import { createActor, type Actor } from './actor'
import { createSmartBrain } from './ai/smart-brain'
import { isEventVisible } from './event-visibility'
import type { GridEvent } from './events'
import { isHostile } from './faction'
import { posKey } from './geometry'
import { tileMapFromStrings } from './map'
import { applyCommand, createRun, type Level, type RunState } from './run'
import { nearestEnemyInRange } from './targeting'

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

function makeRun(rows: string[], actors: Actor[], seed = 1): RunState {
  const level: Level = {
    depth: 1,
    map: tileMapFromStrings(rows),
    actors,
    environment: ENV,
    exit: { x: 0, y: 0 },
  }
  return createRun({ player: actors[0], level, seed })
}

describe('isHostile', () => {
  it('treats different factions as enemies and same faction as allies', () => {
    const a = createActor('a', species('cricket'), { x: 0, y: 0 }, 'ants')
    const b = createActor('b', species('cricket'), { x: 0, y: 0 }, 'ants')
    const c = createActor('c', species('cricket'), { x: 0, y: 0 }, 'wasps')
    expect(isHostile(a, b)).toBe(false)
    expect(isHostile(a, c)).toBe(true)
  })
})

describe('infighting', () => {
  it('lets non-player factions hunt each other out of the player’s sight', () => {
    const player = createActor('p', species('mantis'), { x: 1, y: 1 }, 'player')
    const a = createActor('a', species('scorpion'), { x: 4, y: 1 }, 'a', {
      brain: createSmartBrain(),
    })
    const b = createActor('b', species('centipede'), { x: 8, y: 1 }, 'b', {
      brain: createSmartBrain(),
    })
    const run = makeRun(
      ['##########', '#.##.....#', '##########'],
      [player, a, b]
    )

    const events: GridEvent[] = []
    for (let i = 0; i < 20; i++)
      events.push(...applyCommand(run, { type: 'wait' }))

    const attacks = events.filter((e) => e.type === 'attack')
    expect(attacks.length).toBeGreaterThan(0)
    expect(player.combat.currentHp).toBe(player.combat.maxHp)
    for (const attack of attacks) {
      expect(run.log).not.toContain(attack.outcome.note)
    }
  })

  it('switches to a closer visible enemy', () => {
    const player = createActor('p', species('mantis'), { x: 1, y: 1 }, 'player')
    const hunter = createActor('h', species('scorpion'), { x: 5, y: 1 }, 'h', {
      brain: createSmartBrain(),
    })
    const rival = createActor('r', species('cricket'), { x: 7, y: 1 }, 'r')
    const run = makeRun(
      ['#########', '#.......#', '#########'],
      [player, hunter, rival]
    )

    const command = hunter.brain?.decide(hunter, run, run.rng)
    expect(command).toEqual({ type: 'move', dir: 'e' })
  })
})

describe('nearestEnemyInRange', () => {
  it('prefers the weaker enemy at equal distance', () => {
    const player = createActor('p', species('mantis'), { x: 3, y: 1 }, 'player')
    const left = createActor('l', species('cricket'), { x: 1, y: 1 }, 'hostile')
    const right = createActor(
      'r',
      species('cricket'),
      { x: 5, y: 1 },
      'hostile'
    )
    right.combat.currentHp = 1
    const run = makeRun(
      ['#######', '#.....#', '#######'],
      [player, left, right]
    )

    expect(nearestEnemyInRange(run, player, 5)?.id).toBe('r')
  })
})

describe('isEventVisible', () => {
  const visible = new Set([posKey(1, 1)])

  it('shows an attack when either side is in sight', () => {
    const attack = (attackerX: number, defenderX: number): GridEvent =>
      ({
        type: 'attack',
        outcome: {
          attackerPos: { x: attackerX, y: 1 },
          defenderPos: { x: defenderX, y: 1 },
        },
      }) as GridEvent
    expect(isEventVisible(attack(1, 5), visible)).toBe(true)
    expect(isEventVisible(attack(5, 1), visible)).toBe(true)
    expect(isEventVisible(attack(5, 6), visible)).toBe(false)
  })

  it('always shows positionless messages', () => {
    expect(isEventVisible({ type: 'message', text: 'x' }, visible)).toBe(true)
    expect(
      isEventVisible(
        { type: 'message', text: 'x', pos: { x: 9, y: 9 } },
        visible
      )
    ).toBe(false)
  })
})

describe('hunt radius', () => {
  it('only goes looking for unseen enemies within the radius', () => {
    const rows = ['############', '#...""""...#', '############']
    const setup = (huntRadius?: number) => {
      const player = createActor(
        'p',
        species('mantis'),
        { x: 1, y: 1 },
        'player'
      )
      const far = createActor('f', species('cricket'), { x: 10, y: 1 }, 'f', {
        brain: createSmartBrain({ hunt: true, huntRadius }),
      })
      const run = makeRun(rows, [player, far])
      return far.brain?.decide(far, run, run.rng)
    }

    expect(setup(6)).toEqual({ type: 'wait' })
    expect(setup()).toEqual({ type: 'move', dir: 'w' })
  })
})
