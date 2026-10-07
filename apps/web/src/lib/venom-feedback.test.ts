import { describe, it, expect } from 'vitest'
import {
  applyCommand,
  createActor,
  createRun,
  tileMapFromStrings,
  type Actor,
  type GridEvent,
  type RunState,
} from '@super-insect-battle/roguelike'
import { getArthropodById } from '@super-insect-battle/engine'
import { toCombatFeedback } from './combat-feedback.ts'
import { cueForHit } from './stage-effects.ts'

const LAYOUT = ['#######', '#.....#', '#.....#', '#######']

function species(id: string) {
  const found = getArthropodById(id)
  if (!found) throw new Error(`unknown species ${id}`)
  return found
}

function arena(playerSpecies: string, seed: number): RunState {
  const player = createActor(
    'player',
    species(playerSpecies),
    { x: 2, y: 1 },
    'player'
  )
  const enemy = createActor(
    'enemy',
    species('rhinoceros_beetle'),
    { x: 3, y: 1 },
    'hostile'
  )
  return createRun({
    player,
    seed,
    level: {
      depth: 1,
      map: tileMapFromStrings(LAYOUT),
      actors: [player, enemy],
      environment: { terrain: 'forest', timeOfDay: 'day', weather: 'clear' },
      exit: { x: 5, y: 2 },
    },
  })
}

function poison(actor: Actor, potency: number): void {
  actor.combat.statusCondition = 'poison'
  actor.combat.appliedVenomPotency = potency
}

function enemyOf(run: RunState): Actor {
  const enemy = run.level.actors.find((a) => a.id === 'enemy')
  if (!enemy) throw new Error('enemy is gone')
  return enemy
}

function venomTick(events: GridEvent[], actorId: string) {
  return events.find(
    (e) => e.type === 'status' && e.actorId === actorId && e.damage > 0
  )
}

describe('venom damage during real play', () => {
  it('plays a venom burst on the enemy cell after a bite poisons it', () => {
    const run = arena('black_widow', 7)
    let events: GridEvent[] = []
    for (let turn = 0; turn < 20 && !venomTick(events, 'enemy'); turn++) {
      events = applyCommand(run, { type: 'move', dir: 'e' })
    }
    expect(venomTick(events, 'enemy')).toBeDefined()

    const fb = toCombatFeedback(events, 'player')
    const venom = fb.effects.find((e) => e.kind === 'venom')
    expect(venom).toMatchObject({ pos: { x: 3, y: 1 }, onPlayer: false })
    expect(cueForHit(venom!)).toEqual({
      flash: { color: '#a855f7', alpha: 0.6 },
      burst: 'venom',
    })
  })

  it('flashes red with a venom burst when the player is poisoned', () => {
    const run = arena('black_widow', 1)
    poison(run.player, 50)
    const events = applyCommand(run, { type: 'wait' })

    const fb = toCombatFeedback(events, 'player')
    const venom = fb.effects.find((e) => e.kind === 'venom')
    expect(venom).toMatchObject({ pos: { x: 2, y: 1 }, onPlayer: true })
    expect(fb.playerDamage).toBe(venom && Number(venom.label.slice(1)))
    expect(cueForHit(venom!)).toEqual({
      flash: { color: '#ef4444', alpha: 0.8 },
      burst: 'venom',
    })
  })

  it('sinks the enemy in place when poison finishes it off', () => {
    const run = arena('black_widow', 1)
    const enemy = enemyOf(run)
    poison(enemy, 50)
    enemy.combat.currentHp = 1
    const events = applyCommand(run, { type: 'wait' })

    expect(
      events.some((e) => e.type === 'death' && e.actorId === 'enemy')
    ).toBe(true)
    const fb = toCombatFeedback(events, 'player')
    const venom = fb.effects.find((e) => e.kind === 'venom')
    expect(fb.falls).toEqual([
      { pos: { x: 3, y: 1 }, from: null, delayMs: venom!.delayMs },
    ])
  })
})
