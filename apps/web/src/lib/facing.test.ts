import { describe, it, expect } from 'vitest'
import type { CombatOutcome, GridEvent } from '@super-insect-battle/roguelike'
import { facingAngle, nextFacings } from './facing.ts'

function attack(overrides: Partial<CombatOutcome>): GridEvent {
  return {
    type: 'attack',
    outcome: {
      attackerId: 'e1',
      defenderId: 'player',
      attackerPos: { x: 2, y: 2 },
      defenderPos: { x: 3, y: 2 },
      actionId: 'fang_bite',
      hit: true,
      damage: 10,
      critical: false,
      defenderHp: 100,
      defeated: false,
      note: '',
      ...overrides,
    },
  }
}

describe('facingAngle', () => {
  it('treats up as zero and turns clockwise', () => {
    const o = { x: 5, y: 5 }
    expect(facingAngle(o, { x: 5, y: 4 })).toBeCloseTo(0)
    expect(facingAngle(o, { x: 6, y: 5 })).toBeCloseTo(Math.PI / 2)
    expect(facingAngle(o, { x: 5, y: 6 })).toBeCloseTo(Math.PI)
    expect(facingAngle(o, { x: 4, y: 5 })).toBeCloseTo(-Math.PI / 2)
    expect(facingAngle(o, { x: 6, y: 4 })).toBeCloseTo(Math.PI / 4)
  })

  it('has no direction for the same cell', () => {
    expect(facingAngle({ x: 1, y: 1 }, { x: 1, y: 1 })).toBeNull()
  })
})

describe('nextFacings', () => {
  it('faces the way an actor moved', () => {
    const facings = nextFacings(new Map(), [
      {
        type: 'move',
        actorId: 'player',
        from: { x: 1, y: 1 },
        to: { x: 1, y: 2 },
      },
    ])
    expect(facings.get('player')).toBeCloseTo(Math.PI)
  })

  it('faces the target when attacking, letting the last action win', () => {
    const facings = nextFacings(new Map(), [
      { type: 'move', actorId: 'e1', from: { x: 2, y: 3 }, to: { x: 2, y: 2 } },
      attack({}),
    ])
    expect(facings.get('e1')).toBeCloseTo(Math.PI / 2)
    expect(facings.has('player')).toBe(false)
  })

  it('keeps earlier facings and forgets the dead', () => {
    const previous = new Map([
      ['player', 0],
      ['e1', 1],
    ])
    const facings = nextFacings(previous, [{ type: 'death', actorId: 'e1' }])
    expect(facings.get('player')).toBe(0)
    expect(facings.has('e1')).toBe(false)
    expect(previous.has('e1')).toBe(true)
  })
})
