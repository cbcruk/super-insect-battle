import { describe, it, expect } from 'vitest'
import type { CombatOutcome, GridEvent } from '@super-insect-battle/roguelike'
import { toCombatFeedback } from './combat-feedback.ts'

function attack(overrides: Partial<CombatOutcome>): GridEvent {
  return {
    type: 'attack',
    outcome: {
      attackerId: 'e1',
      defenderId: 'player',
      defenderPos: { x: 3, y: 4 },
      actionId: 'fang_bite',
      hit: true,
      damage: 30,
      critical: false,
      defenderHp: 120,
      defeated: false,
      note: '타란튤라의 독니 물기! (30 데미지)',
      ...overrides,
    },
  }
}

describe('toCombatFeedback', () => {
  it('turns hits on the player into damage numbers and totals', () => {
    const fb = toCombatFeedback(
      [attack({}), attack({ damage: 50, critical: true })],
      'player'
    )
    expect(fb.effects.map((e) => e.label)).toEqual(['-30', '-50!'])
    expect(fb.effects.map((e) => e.delayMs)).toEqual([0, 140])
    expect(fb.effects.map((e) => e.stack)).toEqual([0, 1])
    expect(fb.effects.every((e) => e.onPlayer)).toBe(true)
    expect(fb.playerDamage).toBe(80)
    expect(fb.playerCritical).toBe(true)
    expect(fb.lines.map((l) => l.tone)).toEqual(['taken', 'taken'])
  })

  it('separates the player dealing, missing and killing', () => {
    const fb = toCombatFeedback(
      [
        attack({ attackerId: 'player', defenderId: 'e1' }),
        attack({
          attackerId: 'player',
          defenderId: 'e1',
          hit: false,
          damage: 0,
        }),
        attack({ attackerId: 'player', defenderId: 'e1', defeated: true }),
      ],
      'player'
    )
    expect(fb.lines.map((l) => l.tone)).toEqual(['dealt', 'missed', 'kill'])
    expect(fb.effects[1]).toMatchObject({ kind: 'miss', onPlayer: false })
    expect(fb.playerDamage).toBe(0)
  })

  it('shows venom ticks and counts them against the player', () => {
    const fb = toCombatFeedback(
      [
        {
          type: 'status',
          actorId: 'player',
          message: '사마귀은(는) 독 데미지를 받았다!',
          damage: 25,
          pos: { x: 1, y: 1 },
        },
      ],
      'player'
    )
    expect(fb.effects[0]).toMatchObject({ kind: 'venom', label: '-25' })
    expect(fb.playerDamage).toBe(25)
    expect(fb.lines[0].tone).toBe('taken')
  })

  it('drops map effects from the previous level on descend', () => {
    const fb = toCombatFeedback(
      [attack({}), { type: 'descend', depth: 1 }],
      'player'
    )
    expect(fb.effects).toEqual([])
    expect(fb.lines).toHaveLength(2)
  })
})
