import { describe, it, expect } from 'vitest'
import {
  createRng,
  getActionById,
  getArthropodById,
  type Action,
  type Environment,
} from '@super-insect-battle/engine'
import { createActor, type Actor } from './actor'
import { pickHardAction } from './ai/hard-choice'
import { createSmartBrain } from './ai/smart-brain'
import { estimateDamage, hitProbability } from './combat'
import { tileMapFromStrings } from './map'
import { createRun, type Level, type RunState } from './run'

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

function actions(actor: Actor): Action[] {
  return actor.combat.actions.flatMap((id) => getActionById(id) ?? [])
}

function arena(
  attackerId: string,
  foeId: string,
  gap: number
): { run: RunState; attacker: Actor; foe: Actor } {
  const width = gap + 3
  const map = tileMapFromStrings([
    '#'.repeat(width),
    '#' + '.'.repeat(width - 2) + '#',
    '#'.repeat(width),
  ])
  const player = createActor('p', species(foeId), { x: 1, y: 1 }, 'player')
  const attacker = createActor(
    'e',
    species(attackerId),
    { x: 1 + gap, y: 1 },
    'e'
  )
  const level: Level = {
    depth: 1,
    map,
    actors: [player, attacker],
    environment: ENV,
    exit: null,
  }
  return { run: createRun({ player, level, seed: 1 }), attacker, foe: player }
}

function expectedHit(run: RunState, a: Actor, foe: Actor, x: Action): number {
  return (
    estimateDamage(a, foe, x, run.level) * hitProbability(a, foe, x, run.level)
  )
}

describe('hard grid AI', () => {
  it('opens with a status move on a healthy foe', () => {
    const { run, attacker, foe } = arena('centipede', 'mantis', 1)
    const pick = pickHardAction(attacker, foe, actions(attacker), run.level)
    expect(pick.effect?.type).toBe('status')
  })

  it('goes for the most expected damage once the foe already has a status', () => {
    const { run, attacker, foe } = arena('centipede', 'mantis', 1)
    foe.combat.statusCondition = 'poison'
    const candidates = actions(attacker)
    const pick = pickHardAction(attacker, foe, candidates, run.level)
    const best = Math.max(
      ...candidates.map((x) => expectedHit(run, attacker, foe, x))
    )
    expect(expectedHit(run, attacker, foe, pick)).toBe(best)
  })

  it('skips self buffs when the next hit should finish the foe', () => {
    const { run, attacker, foe } = arena('dung_beetle', 'mantis', 1)
    foe.combat.currentHp = 1
    const pick = pickHardAction(attacker, foe, actions(attacker), run.level)
    expect(pick.power).toBeGreaterThan(0)
  })

  it('estimates without touching the run RNG', () => {
    const { run, attacker, foe } = arena('mantis', 'scorpion', 1)
    const twin = arena('mantis', 'scorpion', 1).run
    for (const x of actions(attacker)) {
      estimateDamage(attacker, foe, x, run.level)
      hitProbability(attacker, foe, x, run.level)
    }
    expect(run.rng()).toBe(twin.rng())
  })
})

describe('easy grid AI', () => {
  it('sometimes picks an attack that cannot reach and walks in instead', () => {
    const kinds = { easy: new Set<string>(), medium: new Set<string>() }
    for (let seed = 1; seed <= 30; seed++) {
      for (const difficulty of ['easy', 'medium'] as const) {
        const { run, attacker } = arena('tarantula', 'mantis', 3)
        run.rng = createRng(seed)
        const command = createSmartBrain({ difficulty }).decide(
          attacker,
          run,
          run.rng
        )
        kinds[difficulty].add(command.type)
      }
    }
    expect(kinds.easy).toContain('move')
    expect(kinds.medium).toEqual(new Set(['ability']))
  })
})
