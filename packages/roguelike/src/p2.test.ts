import { describe, it, expect } from 'vitest'
import {
  createRng,
  getArthropodById,
  type Environment,
} from '@super-insect-battle/engine'
import { generateJungle } from './mapgen'
import { computeVisible } from './fov'
import { stepAlongPath } from './pathfind'
import { createGeneratedRun, enterLevel } from './generate'
import { createRun, applyCommand, type Level, type RunState } from './run'
import { createActor } from './actor'
import { createSmartBrain } from './ai/smart-brain'
import { tileMapFromStrings, isWalkable } from './map'
import { chebyshev, dirToward, addDir, posKey } from './geometry'

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

describe('mapgen', () => {
  it('is deterministic for a seed', () => {
    const a = generateJungle({ width: 40, height: 22, rng: createRng(11) })
    const b = generateJungle({ width: 40, height: 22, rng: createRng(11) })
    expect(a.map.tiles.map((t) => t.terrain)).toEqual(
      b.map.tiles.map((t) => t.terrain)
    )
    expect(a.floors).toEqual(b.floors)
  })

  it('borders are walls and floors form one connected region', () => {
    const { map, floors } = generateJungle({
      width: 40,
      height: 22,
      rng: createRng(3),
    })
    // 테두리 벽
    for (let x = 0; x < map.width; x++) {
      expect(map.tiles[x].terrain).toBe('wall')
      expect(map.tiles[(map.height - 1) * map.width + x].terrain).toBe('wall')
    }
    // 모든 floor 가 floors[0]에서 8방향 도달 가능
    const walkSet = new Set(floors.map((f) => posKey(f.x, f.y)))
    const seen = new Set<string>()
    const stack = [floors[0]]
    seen.add(posKey(floors[0].x, floors[0].y))
    while (stack.length) {
      const c = stack.pop()!
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = c.x + dx
          const ny = c.y + dy
          const k = posKey(nx, ny)
          if (walkSet.has(k) && !seen.has(k)) {
            seen.add(k)
            stack.push({ x: nx, y: ny })
          }
        }
      }
    }
    expect(seen.size).toBe(floors.length)
  })
})

describe('fov', () => {
  it('sees near tiles and is blocked by walls', () => {
    // 원점(1,1) 오른쪽에 벽(3,1) → (5,1)은 안 보임
    const map = tileMapFromStrings(['#######', '#..#..#', '#######'])
    const visible = computeVisible(map, { x: 1, y: 1 }, 8)
    expect(visible.has(posKey(1, 1))).toBe(true)
    expect(visible.has(posKey(2, 1))).toBe(true)
    expect(visible.has(posKey(5, 1))).toBe(false) // 벽 뒤
  })
})

describe('pathfind', () => {
  it('steps toward a reachable target and avoids walls', () => {
    const map = tileMapFromStrings([
      '#######',
      '#.....#',
      '#.###.#',
      '#.....#',
      '#######',
    ])
    const from = { x: 1, y: 1 }
    const to = { x: 5, y: 1 }
    const dir = stepAlongPath(map, from, to, () => false)
    expect(dir).not.toBeNull()
    const next = addDir(from, dir!)
    expect(isWalkable(map, next.x, next.y)).toBe(true)
    expect(chebyshev(next, to)).toBeLessThan(chebyshev(from, to))
  })

  it('returns null when unreachable', () => {
    const map = tileMapFromStrings(['#####', '#.#.#', '#.#.#', '#####'])
    const dir = stepAlongPath(map, { x: 1, y: 1 }, { x: 3, y: 1 }, () => false)
    expect(dir).toBeNull()
  })
})

describe('smart-brain', () => {
  it('pathfinds toward the player', () => {
    const map = tileMapFromStrings([
      '#########',
      '#.......#',
      '#.......#',
      '#.......#',
      '#.......#',
      '#.......#',
      '#.......#',
      '#.......#',
      '#########',
    ])
    const player = createActor('p', species('mantis'), { x: 1, y: 1 }, 'player')
    const enemy = createActor(
      'e',
      species('scorpion'),
      { x: 7, y: 7 },
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
      exit: { x: 1, y: 7 },
    }
    const run = createRun({ player, level, seed: 1, maxDepth: 1 })
    const before = chebyshev(enemy.pos, player.pos)

    for (let i = 0; i < 4; i++) applyCommand(run, { type: 'wait' })
    expect(chebyshev(enemy.pos, player.pos)).toBeLessThan(before)
  })
})

describe('zone descent', () => {
  it('stepping on the exit below maxDepth generates the next level', () => {
    const map = tileMapFromStrings(['####', '#..#', '####'])
    const player = createActor('p', species('mantis'), { x: 1, y: 1 }, 'player')
    const level: Level = {
      depth: 1,
      map,
      actors: [player],
      environment: ENV,
      exit: { x: 2, y: 1 },
    }
    const run = createRun({ player, level, seed: 9, maxDepth: 2 })

    applyCommand(run, { type: 'move', dir: 'e' }) // 출구 진입
    expect(run.status).toBe('playing')
    expect(run.level.depth).toBe(2)
    expect(run.level.actors).toContain(run.player)
    expect(run.level.map.width).toBeGreaterThan(4) // 새 절차 맵
  })

  it('enterLevel carries the player and its persistent HP', () => {
    const run = createGeneratedRun({
      playerSpecies: species('mantis'),
      seed: 1,
      maxDepth: 3,
    })
    expect(run.level.depth).toBe(1)
    run.player.combat.currentHp = 42
    enterLevel(run, 2)
    expect(run.level.depth).toBe(2)
    expect(run.level.actors).toContain(run.player)
    expect(run.player.combat.currentHp).toBe(42) // HP 지속
  })
})

describe('generated run determinism', () => {
  function playToExit(seed: number) {
    const run = createGeneratedRun({
      playerSpecies: species('mantis'),
      seed,
      maxDepth: 3,
    })
    const scripted = (r: RunState) => {
      const { player, level } = r
      const enemy = level.actors.find(
        (a) =>
          a.faction === 'hostile' &&
          a.combat.currentHp > 0 &&
          chebyshev(a.pos, player.pos) === 1
      )
      if (enemy) {
        const d = dirToward(player.pos, enemy.pos)
        if (d) return { type: 'move' as const, dir: d }
      }
      const occupied = (x: number, y: number) =>
        level.actors.some(
          (a) =>
            a !== player &&
            a.combat.currentHp > 0 &&
            a.pos.x === x &&
            a.pos.y === y
        )
      const d = stepAlongPath(level.map, player.pos, level.exit, occupied)
      return d ? { type: 'move' as const, dir: d } : { type: 'wait' as const }
    }

    const events: unknown[] = []
    let steps = 0
    while (run.status === 'playing' && steps < 400) {
      events.push(...applyCommand(run, scripted(run)))
      steps++
    }
    return {
      events,
      status: run.status,
      turn: run.turn,
      depth: run.level.depth,
    }
  }

  it('same seed → identical run', () => {
    const a = playToExit(7)
    const b = playToExit(7)
    expect(a.status).toBe(b.status)
    expect(a.turn).toBe(b.turn)
    expect(a.depth).toBe(b.depth)
    expect(JSON.stringify(a.events)).toBe(JSON.stringify(b.events))
  })
})
