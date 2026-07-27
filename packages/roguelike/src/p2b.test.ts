import { describe, it, expect } from 'vitest'
import {
  getActionById,
  getActionTargeting,
  getActionRange,
  getArthropodById,
  type Environment,
} from '@super-insect-battle/engine'
import { createActor } from './actor'
import { createSmartBrain } from './ai/smart-brain'
import { tileMapFromStrings, tileAt } from './map'
import { createRun, applyCommand, type Level } from './run'

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
function action(id: string) {
  const a = getActionById(id)
  if (!a) throw new Error(`missing action ${id}`)
  return a
}

describe('action range/targeting metadata', () => {
  it('derives targeting and range', () => {
    expect(getActionTargeting(action('web_trap'))).toBe('ranged')
    expect(getActionRange(action('web_trap'))).toBe(4)
    expect(getActionTargeting(action('horn_lift'))).toBe('melee')
    expect(getActionRange(action('horn_lift'))).toBe(1)
    expect(getActionTargeting(action('shell_guard'))).toBe('self')
    expect(getActionRange(action('shell_guard'))).toBe(0)
  })
})

function corridor(width: number) {
  const top = '#'.repeat(width)
  const mid = '#' + '.'.repeat(width - 2) + '#'
  return tileMapFromStrings([top, mid, top])
}

describe('ranged abilities', () => {
  it('hits a target within range and line of sight', () => {
    const map = corridor(7)
    const player = createActor('p', species('mantis'), { x: 1, y: 1 }, 'player')
    const enemy = createActor(
      'e',
      species('cricket'),
      { x: 4, y: 1 },
      'hostile'
    )
    const level: Level = {
      depth: 1,
      map,
      actors: [player, enemy],
      environment: ENV,
      exit: { x: 9, y: 9 },
    }
    const run = createRun({ player, level, seed: 4 })
    const before = enemy.combat.currentHp

    for (let i = 0; i < 4 && enemy.combat.currentHp > 0; i++) {
      applyCommand(run, {
        type: 'ability',
        actionId: 'toxic_spray',
        target: { x: 4, y: 1 },
      })
    }
    expect(enemy.combat.currentHp).toBeLessThan(before)
  })

  it('does nothing when the target is out of range', () => {
    const map = corridor(8)
    const player = createActor('p', species('mantis'), { x: 1, y: 1 }, 'player')
    const enemy = createActor(
      'e',
      species('cricket'),
      { x: 5, y: 1 },
      'hostile'
    ) // 거리 4 > 사거리 3
    const level: Level = {
      depth: 1,
      map,
      actors: [player, enemy],
      environment: ENV,
      exit: { x: 9, y: 9 },
    }
    const run = createRun({ player, level, seed: 1 })
    const before = enemy.combat.currentHp

    applyCommand(run, {
      type: 'ability',
      actionId: 'toxic_spray',
      target: { x: 5, y: 1 },
    })
    expect(enemy.combat.currentHp).toBe(before)
  })

  it('is blocked by walls (no line of sight)', () => {
    const map = tileMapFromStrings(['#####', '#.#.#', '#####'])
    const player = createActor('p', species('mantis'), { x: 1, y: 1 }, 'player')
    const enemy = createActor(
      'e',
      species('cricket'),
      { x: 3, y: 1 },
      'hostile'
    )
    const level: Level = {
      depth: 1,
      map,
      actors: [player, enemy],
      environment: ENV,
      exit: { x: 9, y: 9 },
    }
    const run = createRun({ player, level, seed: 1 })
    const before = enemy.combat.currentHp

    applyCommand(run, {
      type: 'ability',
      actionId: 'toxic_spray',
      target: { x: 3, y: 1 },
    })
    expect(enemy.combat.currentHp).toBe(before)
  })

  it('self-target abilities buff the caster', () => {
    const map = tileMapFromStrings(['###', '#.#', '###'])
    const player = createActor('p', species('mantis'), { x: 1, y: 1 }, 'player')
    const level: Level = {
      depth: 1,
      map,
      actors: [player],
      environment: ENV,
      exit: { x: 9, y: 9 },
    }
    const run = createRun({ player, level, seed: 1 })

    applyCommand(run, {
      type: 'ability',
      actionId: 'rage',
      target: { x: 1, y: 1 },
    })
    expect(player.combat.statStages.strength).toBe(2)
  })
})

describe('items', () => {
  it('picks up and applies a floor item', () => {
    const map = tileMapFromStrings(['####', '#..#', '####'])
    map.tiles[1 * 4 + 2].itemId = 'nectar'
    const player = createActor('p', species('mantis'), { x: 1, y: 1 }, 'player')
    player.combat.currentHp = 50
    const level: Level = {
      depth: 1,
      map,
      actors: [player],
      environment: ENV,
      exit: { x: 9, y: 9 },
    }
    const run = createRun({ player, level, seed: 1 })

    applyCommand(run, { type: 'move', dir: 'e' })
    expect(player.pos).toEqual({ x: 2, y: 1 })
    expect(player.combat.currentHp).toBeGreaterThan(50)
    expect(tileAt(map, 2, 1)?.itemId).toBeUndefined()
  })
})

describe('smart-brain ranged usage', () => {
  it('fires a ranged ability when the player is in range', () => {
    const map = corridor(6)
    const player = createActor('p', species('mantis'), { x: 1, y: 1 }, 'player')
    const enemy = createActor(
      'e',
      species('black_widow'),
      { x: 4, y: 1 },
      'hostile',
      {
        brain: createSmartBrain(),
      }
    )
    const level: Level = {
      depth: 1,
      map,
      actors: [player, enemy],
      environment: ENV,
      exit: { x: 9, y: 9 },
    }
    const run = createRun({ player, level, seed: 1 })

    const command = createSmartBrain().decide(enemy, run, run.rng)
    expect(command.type).toBe('ability')
  })
})
