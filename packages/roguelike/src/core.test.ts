import { describe, it, expect } from 'vitest'
import { getArthropodById, type Environment } from '@super-insect-battle/engine'
import { createActor } from './actor'
import { createBasicBrain } from './ai/basic-brain'
import { tileMapFromStrings } from './map'
import { createRun, applyCommand, type Level } from './run'
import { makeDemoLevel } from './demo-level'
import type { Direction } from './geometry'

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

describe('movement', () => {
  it('walks onto floor and is blocked by walls', () => {
    const map = tileMapFromStrings(['#####', '#...#', '#####'])
    const player = createActor('p', species('mantis'), { x: 1, y: 1 }, 'player')
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

    applyCommand(run, { type: 'move', dir: 'n' }) // 벽
    expect(player.pos).toEqual({ x: 2, y: 1 })
  })
})

describe('bump combat', () => {
  it('reduces adjacent enemy HP', () => {
    const map = tileMapFromStrings(['#####', '#...#', '#####'])
    const player = createActor(
      'p',
      species('titan_beetle'),
      { x: 1, y: 1 },
      'player'
    )
    const enemy = createActor(
      'e',
      species('cricket'),
      { x: 2, y: 1 },
      'hostile'
    )
    const level: Level = {
      depth: 1,
      map,
      actors: [player, enemy],
      environment: ENV,
      exit: { x: 9, y: 9 },
    }
    const run = createRun({ player, level, seed: 3 })
    const before = enemy.combat.currentHp

    for (let i = 0; i < 5 && enemy.combat.currentHp > 0; i++) {
      applyCommand(run, { type: 'move', dir: 'e' })
    }
    expect(enemy.combat.currentHp).toBeLessThan(before)
  })
})

describe('win / lose', () => {
  it('reaching the exit wins the run', () => {
    const map = tileMapFromStrings(['####', '#..#', '####'])
    const player = createActor('p', species('mantis'), { x: 1, y: 1 }, 'player')
    const level: Level = {
      depth: 1,
      map,
      actors: [player],
      environment: ENV,
      exit: { x: 2, y: 1 },
    }
    const run = createRun({ player, level, seed: 1 })

    applyCommand(run, { type: 'move', dir: 'e' })
    expect(run.status).toBe('won')
  })

  it('player death ends the run', () => {
    const map = tileMapFromStrings(['####', '#..#', '####'])
    const player = createActor(
      'p',
      species('cricket'),
      { x: 1, y: 1 },
      'player'
    )
    const enemy = createActor(
      'e',
      species('titan_beetle'),
      { x: 2, y: 1 },
      'hostile',
      {
        brain: createBasicBrain(),
      }
    )
    const level: Level = {
      depth: 1,
      map,
      actors: [player, enemy],
      environment: ENV,
      exit: { x: 9, y: 9 },
    }
    const run = createRun({ player, level, seed: 5 })

    let guard = 0
    while (run.status === 'playing' && guard < 500) {
      applyCommand(run, { type: 'wait' })
      guard++
    }
    expect(run.status).toBe('dead')
  })
})

describe('determinism', () => {
  const script: Direction[] = Array.from({ length: 40 }, () => 'e')

  function play(seed: number) {
    const { level, player } = makeDemoLevel()
    const run = createRun({ player, level, seed })
    const events = script.flatMap((dir) =>
      applyCommand(run, { type: 'move', dir })
    )
    return { events, status: run.status, turn: run.turn }
  }

  it('same seed + same script → identical events and outcome', () => {
    const a = play(2026)
    const b = play(2026)
    expect(JSON.stringify(a.events)).toBe(JSON.stringify(b.events))
    expect(a.status).toBe(b.status)
    expect(a.turn).toBe(b.turn)
  })

  it('different seeds can diverge', () => {
    const seeds = [1, 2, 3, 4, 5, 6, 7, 8]
    const signatures = seeds.map((s) => JSON.stringify(play(s).events))
    const unique = new Set(signatures)
    expect(unique.size).toBeGreaterThan(1)
  })
})
