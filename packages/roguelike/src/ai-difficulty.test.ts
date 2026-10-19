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
import { tileAt, tileMapFromStrings } from './map'
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

  it('buffs early in a long fight but attacks when only a few hits remain', () => {
    const { run, attacker, foe } = arena('dung_beetle', 'scorpion', 1)
    foe.combat.statusCondition = 'poison'
    const candidates = actions(attacker)
    expect(
      pickHardAction(attacker, foe, candidates, run.level).effect?.target
    ).toBe('self')

    // 어떤 공격으로도 확실히 쓰러뜨리지 못하는, 두어 번 남은 체력
    foe.combat.currentHp =
      Math.max(
        ...candidates.map((x) => estimateDamage(attacker, foe, x, run.level, 0))
      ) + 1
    const late = pickHardAction(attacker, foe, candidates, run.level)
    expect(late.power).toBeGreaterThan(0)
  })

  it('throws on an empty candidate list', () => {
    const { run, attacker, foe } = arena('mantis', 'scorpion', 1)
    expect(() => pickHardAction(attacker, foe, [], run.level)).toThrow()
  })
})

describe('grid hit estimates', () => {
  it('lowers the hit chance against a foe in tall grass', () => {
    const { run, attacker, foe } = arena('mantis', 'scorpion', 1)
    const strike = actions(attacker)[0]
    const open = hitProbability(attacker, foe, strike, run.level)
    tileAt(run.level.map, foe.pos.x, foe.pos.y)!.terrain = 'tallgrass'
    expect(hitProbability(attacker, foe, strike, run.level)).toBeLessThan(open)
  })

  it('brackets the mid estimate between the minimum and maximum roll', () => {
    const { run, attacker, foe } = arena('mantis', 'scorpion', 1)
    const strike = actions(attacker)[0]
    const low = estimateDamage(attacker, foe, strike, run.level, 0)
    const mid = estimateDamage(attacker, foe, strike, run.level)
    const high = estimateDamage(attacker, foe, strike, run.level, 1)
    expect(low).toBeLessThanOrEqual(mid)
    expect(mid).toBeLessThanOrEqual(high)
    expect(low).toBeLessThan(high)
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
