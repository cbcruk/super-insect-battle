import { describe, it, expect } from 'vitest'
import { getArthropodById, type Environment } from '@super-insect-battle/engine'
import { createActor } from './actor'
import { assessThreat, visibleEnemies } from './threat'
import { createGeneratedRun, HOSTILE_GLYPHS } from './generate'

const ENV: Environment = {
  terrain: 'forest',
  timeOfDay: 'day',
  weather: 'clear',
}

function actor(id: string, faction: 'player' | 'hostile') {
  const species = getArthropodById(id)
  if (!species) throw new Error(`missing ${id}`)
  return createActor(id, species, { x: 0, y: 0 }, faction)
}

describe('hostile glyphs', () => {
  it('gives every hostile species a distinct glyph', () => {
    const glyphs = Object.values(HOSTILE_GLYPHS)
    expect(new Set(glyphs).size).toBe(glyphs.length)
  })
})

describe('assessThreat', () => {
  it('rates the giant hornet above the earwig', () => {
    const player = actor('rhinoceros_beetle', 'player')
    const rank = { low: 0, moderate: 1, high: 2, deadly: 3 }
    const hornet = assessThreat(player, actor('giant_hornet', 'hostile'), ENV)
    const earwig = assessThreat(player, actor('earwig', 'hostile'), ENV)
    expect(rank[hornet.level]).toBeGreaterThan(rank[earwig.level])
    expect(hornet.venomous).toBe(true)
  })

  it('escalates as the player loses HP', () => {
    const player = actor('mantis', 'player')
    const enemy = actor('centipede', 'hostile')
    const full = assessThreat(player, enemy, ENV)
    player.combat.currentHp = Math.ceil(player.combat.maxHp * 0.1)
    const hurt = assessThreat(player, enemy, ENV)
    expect(hurt.hitsToKillPlayer).toBeLessThan(full.hitsToKillPlayer)
    expect(hurt.winChance).toBeLessThan(full.winChance)
    expect(hurt.level).toBe('deadly')
  })

  it('leaves the real actors untouched', () => {
    const player = actor('mantis', 'player')
    const enemy = actor('giant_hornet', 'hostile')
    const before = JSON.stringify([player.combat, enemy.combat, player.pos])
    assessThreat(player, enemy, ENV)
    expect(JSON.stringify([player.combat, enemy.combat, player.pos])).toBe(
      before
    )
  })

  it('settles immediately when the player is already down', () => {
    const player = actor('mantis', 'player')
    player.combat.currentHp = 0
    const threat = assessThreat(player, actor('scorpion', 'hostile'), ENV)
    expect(threat.level).toBe('deadly')
    expect(threat.winChance).toBe(0)
  })

  it('is deterministic', () => {
    const player = actor('stag_beetle', 'player')
    const enemy = actor('scorpion', 'hostile')
    expect(assessThreat(player, enemy, ENV)).toEqual(
      assessThreat(player, enemy, ENV)
    )
  })
})

describe('visibleEnemies', () => {
  it('lists only living hostiles inside the field of view', () => {
    const run = createGeneratedRun({
      playerSpecies: getArthropodById('mantis')!,
      seed: 42,
    })
    for (const enemy of visibleEnemies(run)) {
      expect(enemy.faction).toBe('hostile')
      expect(run.level.visible.has(`${enemy.pos.x},${enemy.pos.y}`)).toBe(true)
    }
  })
})
