import { describe, expect, it } from 'vitest'
import {
  arthropodList,
  createRng,
  simulateBattle,
  type BattleState,
} from '@super-insect-battle/engine'
import { buildFeed, deriveEvents, narrate } from './index'

const SEEDS = [1, 7, 42, 2024, 99999]

function battles(): BattleState[] {
  return SEEDS.map((seed, i) =>
    simulateBattle(
      arthropodList[i % arthropodList.length],
      arthropodList[(i * 5 + 3) % arthropodList.length],
      undefined,
      createRng(seed)
    )
  )
}

describe('deriveEvents', () => {
  it('opens with an intro, closes with the result and keeps turns in order', () => {
    for (const state of battles()) {
      const events = deriveEvents(state)
      expect(events[0]).toMatchObject({
        kind: 'intro',
        player: state.player.base.nameKo,
        opponent: state.opponent.base.nameKo,
      })

      const last = events[events.length - 1]
      expect(last).toMatchObject({ kind: 'end', winner: state.winner })

      const turns = events.flatMap((e) => (e.kind === 'turn' ? [e.turn] : []))
      expect(turns).toEqual([...turns].sort((a, b) => a - b))
    }
  })

  it('names the fainted side as the loser', () => {
    for (const state of battles()) {
      const events = deriveEvents(state)
      const faints = events.flatMap((e) => (e.kind === 'faint' ? [e.side] : []))
      if (state.winner === 'player') expect(faints).toContain('opponent')
      if (state.winner === 'opponent') expect(faints).toContain('player')
    }
  })
})

describe('narrate', () => {
  it('is deterministic for the same battle', () => {
    for (const state of battles()) {
      const events = deriveEvents(state)
      expect(narrate(events)).toEqual(narrate(events))
    }
  })

  it('writes prose without leaking debug values', () => {
    for (const state of battles()) {
      for (const line of narrate(deriveEvents(state))) {
        expect(line.text.trim()).not.toBe('')
        expect(line.text).not.toMatch(/undefined|NaN|null|\[object/)
      }
    }
  })

  it('varies phrasing instead of repeating the same line', () => {
    const texts = battles().flatMap((state) =>
      narrate(deriveEvents(state)).map((line) => line.text)
    )
    expect(new Set(texts).size).toBeGreaterThan(texts.length / 2)
  })
})

describe('buildFeed', () => {
  it('tracks HP within bounds and ends with the loser at zero', () => {
    for (const state of battles()) {
      const feed = buildFeed(state)
      expect(feed.items.length).toBeGreaterThan(0)

      for (const { hp } of feed.items) {
        expect(hp.player).toBeGreaterThanOrEqual(0)
        expect(hp.opponent).toBeGreaterThanOrEqual(0)
        expect(hp.player).toBeLessThanOrEqual(feed.maxHp.player)
        expect(hp.opponent).toBeLessThanOrEqual(feed.maxHp.opponent)
      }

      const final = feed.items[feed.items.length - 1].hp
      if (state.winner === 'player') expect(final.opponent).toBe(0)
      if (state.winner === 'opponent') expect(final.player).toBe(0)
    }
  })
})
