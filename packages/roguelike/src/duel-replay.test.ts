import { describe, it, expect } from 'vitest'
import { createRng, getArthropodById } from '@super-insect-battle/engine'
import type { Command } from './command'
import { createDuelRun, type DuelOptions } from './duel'
import {
  createDuelReplay,
  isDuelReplay,
  playDuelReplay,
  startDuelReplay,
} from './duel-replay'
import type { Direction } from './geometry'
import { applyCommand, type RunState } from './run'

function species(id: string) {
  const a = getArthropodById(id)
  if (!a) throw new Error(`missing ${id}`)
  return a
}

function options(seed: number, autopilot: boolean): DuelOptions {
  return {
    playerSpecies: species('mantis'),
    opponentSpecies: species('scorpion'),
    seed,
    autopilot,
  }
}

function summary(run: RunState): string {
  return [
    run.status,
    run.turn,
    ...run.level.actors.map(
      (a) => `${a.id}:${a.combat.currentHp}@${a.pos.x},${a.pos.y}`
    ),
  ].join(' ')
}

const DIRS: Direction[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

describe('duel replay', () => {
  it('reproduces an AI vs AI duel from the header alone', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const run = createDuelRun(options(seed, true))
      while (run.status === 'playing' && run.player.brain) {
        applyCommand(run, run.player.brain.decide(run.player, run, run.rng))
      }
      const replay = createDuelReplay(options(seed, true))
      expect(replay.commands).toEqual([])
      expect(summary(playDuelReplay(replay)!)).toBe(summary(run))
    }
  })

  it('reproduces a hand-played duel from its recorded commands', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const run = createDuelRun(options(seed, false))
      const replay = createDuelReplay(options(seed, false))
      const human = createRng(seed * 31)
      while (run.status === 'playing' && run.turn < 300) {
        const command: Command =
          human() < 0.15
            ? { type: 'wait' }
            : { type: 'move', dir: DIRS[Math.floor(human() * DIRS.length)] }
        replay.commands.push(command)
        applyCommand(run, command)
      }
      const copy = JSON.parse(JSON.stringify(replay)) as unknown
      expect(isDuelReplay(copy)).toBe(true)
      if (isDuelReplay(copy)) {
        expect(summary(playDuelReplay(copy)!)).toBe(summary(run))
      }
    }
  })

  it('replays with the recorded opponent AI settings', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const opts: DuelOptions = {
        ...options(seed, true),
        opponentAI: { difficulty: 'hard', personality: 'aggressive' },
      }
      const run = createDuelRun(opts)
      while (run.status === 'playing' && run.player.brain) {
        applyCommand(run, run.player.brain.decide(run.player, run, run.rng))
      }
      const copy = JSON.parse(JSON.stringify(createDuelReplay(opts))) as unknown
      expect(isDuelReplay(copy)).toBe(true)
      if (isDuelReplay(copy)) {
        expect(copy.opponentAI).toEqual(opts.opponentAI)
        expect(summary(playDuelReplay(copy)!)).toBe(summary(run))
      }
    }
  })

  it('rejects malformed records and unknown species', () => {
    expect(isDuelReplay(null)).toBe(false)
    expect(isDuelReplay({ version: 2 })).toBe(false)
    const replay = createDuelReplay(options(1, true))
    expect(startDuelReplay({ ...replay, opponentSpeciesId: 'dragon' })).toBe(
      null
    )
  })
})
