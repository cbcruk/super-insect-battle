import { describe, it, expect } from 'vitest'
import {
  createActor,
  createRun,
  posKey,
  tileMapFromStrings,
  type RunState,
} from '@super-insect-battle/roguelike'
import { getArthropodById } from '@super-insect-battle/engine'
import { describeCell } from './roguelike-cell.ts'
import { EDGE_LIGHT, REMEMBERED_LIGHT } from './sight-light.ts'

function corridor(): RunState {
  const species = getArthropodById('black_widow')!
  const player = createActor('player', species, { x: 1, y: 1 }, 'player')
  const enemy = createActor('enemy', species, { x: 8, y: 1 }, 'hostile', {
    glyph: 'E',
  })
  const run = createRun({
    player,
    seed: 1,
    level: {
      depth: 1,
      map: tileMapFromStrings(['###########', '#.........#', '###########']),
      actors: [player, enemy],
      environment: { terrain: 'forest', timeOfDay: 'day', weather: 'clear' },
      exit: { x: 9, y: 1 },
      visible: new Set(),
      discovered: new Set(),
    },
  })
  return run
}

describe('describeCell lighting', () => {
  it('dims far floor but keeps far insects and the exit bright', () => {
    const run = corridor()
    expect(describeCell(run, 2, 1)?.alpha).toBe(1)

    const enemy = describeCell(run, 8, 1)!
    expect(enemy.alpha).toBeCloseTo(EDGE_LIGHT)
    expect(enemy.glyphAlpha).toBe(1)

    const floor = describeCell(run, 7, 1)!
    expect(floor.glyphAlpha).toBe(floor.alpha)
    expect(floor.alpha).toBeLessThan(1)
  })

  it('shows remembered cells at the remembered light', () => {
    const run = corridor()
    run.level.visible!.delete(posKey(9, 1))
    run.level.discovered!.add(posKey(9, 1))
    const exit = describeCell(run, 9, 1)!
    expect(exit.alpha).toBe(REMEMBERED_LIGHT)
    expect(exit.glyphAlpha).toBe(REMEMBERED_LIGHT)
  })

  it('lights everything fully when there is no fog', () => {
    const run = corridor()
    run.level.visible = undefined
    expect(describeCell(run, 8, 1)?.alpha).toBe(1)
  })
})
