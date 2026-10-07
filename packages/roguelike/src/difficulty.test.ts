import { describe, it, expect } from 'vitest'
import { getArthropodById, type Environment } from '@super-insect-battle/engine'
import { createActor } from './actor'
import { createSmartBrain } from './ai/smart-brain'
import { createGeneratedRun, hostilePoolFor } from './generate'
import { DIRECTIONS, addDir, chebyshev } from './geometry'
import { isWalkable, tileMapFromStrings } from './map'
import { applyCommand, createRun, type Level } from './run'
import { decayVenom, scaleAppliedVenom } from './venom'

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

describe('hostilePoolFor', () => {
  it('keeps the strongest hostiles out of the first level', () => {
    expect(hostilePoolFor(1)).not.toContain('giant_hornet')
    expect(hostilePoolFor(1)).not.toContain('scorpion')
    expect(hostilePoolFor(2)).toContain('centipede')
    expect(hostilePoolFor(3)).toContain('giant_hornet')
  })
})

describe('run venom', () => {
  it('weakens on application and wears off after a few ticks', () => {
    const combat = createActor(
      'p',
      species('mantis'),
      { x: 0, y: 0 },
      'player'
    ).combat
    combat.statusCondition = 'poison'
    combat.appliedVenomPotency = 95
    scaleAppliedVenom(combat)
    expect(combat.appliedVenomPotency).toBe(38)

    let ticks = 0
    while (combat.statusCondition === 'poison' && ticks < 20) {
      decayVenom(combat)
      ticks++
    }
    expect(combat.statusCondition).toBeNull()
    expect(ticks).toBeLessThanOrEqual(5)
  })
})

describe('descend recovery', () => {
  it('heals part of the max HP and clears poison on reaching the next level', () => {
    const run = createGeneratedRun({
      playerSpecies: species('mantis'),
      seed: 3,
    })
    const { exit, map } = run.level
    const dir = DIRECTIONS.find((d) => {
      const from = addDir(exit, d)
      return isWalkable(map, from.x, from.y)
    })!
    run.player.pos = addDir(exit, dir)
    run.level.actors = [run.player]
    run.player.combat.currentHp = 20
    run.player.combat.statusCondition = 'poison'
    run.player.combat.appliedVenomPotency = 30

    const back = DIRECTIONS.find((d) => {
      const to = addDir(run.player.pos, d)
      return to.x === exit.x && to.y === exit.y
    })!
    applyCommand(run, { type: 'move', dir: back })

    expect(run.level.depth).toBe(2)
    expect(run.player.combat.currentHp).toBeGreaterThan(20)
    expect(run.player.combat.statusCondition).toBeNull()
    expect(run.log.some((line) => line.startsWith('숨을 고른다'))).toBe(true)
  })
})

describe('enemy awareness', () => {
  function corridor(enemyX: number): ReturnType<typeof createRun> {
    const map = tileMapFromStrings([
      '#####################',
      '#...................#',
      '#####################',
    ])
    const player = createActor(
      'player',
      species('mantis'),
      { x: 1, y: 1 },
      'player'
    )
    const enemy = createActor(
      'e',
      species('earwig'),
      { x: enemyX, y: 1 },
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
      exit: { x: 19, y: 1 },
      visible: new Set(),
      discovered: new Set(),
    }
    return createRun({ player, level, seed: 1 })
  }

  it('ignores a player it has not noticed yet', () => {
    const run = corridor(18)
    const enemy = run.level.actors[1]
    const decision = enemy.brain!.decide(enemy, run, run.rng)
    expect(decision).toEqual({ type: 'wait' })
  })

  it('keeps chasing once the player has come into view', () => {
    const run = corridor(18)
    const enemy = run.level.actors[1]
    run.player.pos = { x: 12, y: 1 }
    expect(enemy.brain!.decide(enemy, run, run.rng).type).toBe('move')

    run.player.pos = { x: 1, y: 1 }
    expect(chebyshev(enemy.pos, run.player.pos)).toBeGreaterThan(7)
    expect(enemy.brain!.decide(enemy, run, run.rng).type).toBe('move')
  })
})
