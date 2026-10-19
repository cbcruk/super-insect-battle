import { describe, it, expect } from 'vitest'
import { getArthropodById, type Environment } from '@super-insect-battle/engine'
import {
  createActor,
  createRun,
  tileMapFromStrings,
  type CombatOutcome,
  type GridEvent,
  type Level,
  type RunState,
} from '@super-insect-battle/roguelike'
import { createGridNarrator } from './grid'

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

function arena(): RunState {
  const player = createActor(
    'player',
    species('mantis'),
    { x: 2, y: 1 },
    'player'
  )
  const opponent = createActor(
    'opponent',
    species('black_widow'),
    { x: 6, y: 1 },
    'opponent'
  )
  const level: Level = {
    depth: 1,
    map: tileMapFromStrings(['#########', '#.""....#', '#########']),
    actors: [player, opponent],
    environment: ENV,
    exit: null,
    zone: {
      center: { x: 4, y: 1 },
      initialRadius: 3,
      shrinkStart: 2,
      shrinkEvery: 1,
    },
  }
  return createRun({ player, level, seed: 1, mode: 'duel' })
}

function attack(overrides: Partial<CombatOutcome>): GridEvent {
  return {
    type: 'attack',
    outcome: {
      attackerId: 'player',
      defenderId: 'opponent',
      attackerPos: { x: 2, y: 1 },
      defenderPos: { x: 3, y: 1 },
      actionId: 'scythe_strike',
      hit: true,
      damage: 20,
      critical: false,
      defenderHp: 100,
      defeated: false,
      note: '',
      ...overrides,
    },
  }
}

const texts = (lines: { text: string }[]): string =>
  lines.map((l) => l.text).join('\n')

describe('createGridNarrator', () => {
  it('introduces both insects and the gas schedule', () => {
    const run = arena()
    const intro = texts(createGridNarrator(run).intro())
    expect(intro).toContain('사마귀')
    expect(intro).toContain('검은과부거미')
    expect(intro).toContain('2턴')
  })

  it('calls an ambush only on the first strike after slipping into grass', () => {
    const run = arena()
    const n = createGridNarrator(run)
    const hide = n.next(
      [
        {
          type: 'move',
          actorId: 'player',
          from: { x: 1, y: 1 },
          to: { x: 2, y: 1 },
        },
      ],
      run
    )
    expect(texts(hide)).toContain('수풀')

    const first = texts(n.next([attack({})], run))
    const second = texts(n.next([attack({})], run))
    expect(first).toMatch(/수풀 속에서|매복|박차고/)
    expect(second).not.toMatch(/수풀 속에서|매복|박차고/)
  })

  it('announces ranged pressure once per volley', () => {
    const run = arena()
    const n = createGridNarrator(run)
    const shot = attack({
      attackerId: 'opponent',
      defenderId: 'player',
      attackerPos: { x: 6, y: 1 },
      defenderPos: { x: 3, y: 1 },
      actionId: 'web_trap',
      damage: 0,
    })
    expect(texts(n.next([shot], run))).toContain('3칸 밖에서')
    expect(texts(n.next([shot], run))).not.toMatch(/칸 밖에서|견제|쏘아붙인다/)
  })

  it('reports gas damage as gas and the zone tightening', () => {
    const run = arena()
    const n = createGridNarrator(run)
    run.turn = 2
    const lines = texts(
      n.next(
        [
          {
            type: 'status',
            actorId: 'opponent',
            message: '검은과부거미이(가) 독가스에 휩싸였다! (5 데미지)',
            damage: 5,
            pos: { x: 7, y: 1 },
          },
        ],
        run
      )
    )
    expect(lines).toContain('독가스')
    expect(lines).toContain('반경 2칸')
    expect(lines).not.toContain('독이')
  })

  it('reports a rival slipping into grass only when the player saw it', () => {
    const sneak: GridEvent = {
      type: 'move',
      actorId: 'opponent',
      from: { x: 4, y: 1 },
      to: { x: 3, y: 1 },
    }
    const hidden = arena()
    hidden.level.visible = new Set(['2,1'])
    expect(createGridNarrator(hidden).next([sneak], hidden)).toEqual([])

    const watched = arena()
    watched.level.visible = new Set(['2,1', '4,1'])
    expect(texts(createGridNarrator(watched).next([sneak], watched))).toContain(
      '검은과부거미'
    )
  })

  it('closes with the winner once and then falls silent', () => {
    const run = arena()
    const n = createGridNarrator(run)
    run.status = 'won'
    const end = texts(
      n.next(
        [attack({ defeated: true }), { type: 'death', actorId: 'opponent' }],
        run
      )
    )
    expect(end).toContain('쓰러')
    expect(end).toContain('사마귀')
    expect(n.next([attack({})], run)).toEqual([])
  })

  it('narrates the same events the same way', () => {
    const play = (): string => {
      const run = arena()
      const n = createGridNarrator(run)
      return texts([
        ...n.intro(),
        ...n.next([attack({}), attack({ hit: false, damage: 0 })], run),
      ])
    }
    expect(play()).toBe(play())
  })

  it('narrates being held down and shaking off venom', () => {
    const run = arena()
    const n = createGridNarrator(run)
    const lines = texts(
      n.next(
        [
          {
            type: 'message',
            text: '검은과부거미은(는) 속박되어 움직일 수 없다!',
            pos: { x: 6, y: 1 },
            actorId: 'opponent',
          },
          {
            type: 'message',
            text: '사마귀의 독이 풀렸다.',
            pos: { x: 2, y: 1 },
            actorId: 'player',
          },
        ],
        run
      )
    )
    expect(lines).toContain('검은과부거미')
    expect(lines).toContain('사마귀의 독이 풀렸다.')
  })

  it('claims a status only when it actually took hold', () => {
    const run = arena()
    const n = createGridNarrator(run)
    const missed = texts(
      n.next([attack({ actionId: 'fang_bite', damage: 20 })], run)
    )
    const landed = texts(
      n.next(
        [
          attack({
            actionId: 'fang_bite',
            damage: 20,
            statusApplied: 'poison',
          }),
        ],
        run
      )
    )
    expect(missed).not.toMatch(/빠진다|걸렸다|늪/)
    expect(landed).toMatch(/빠진다|걸렸다|늪/)

    const trap = texts(
      n.next([attack({ actionId: 'web_trap', damage: 0 })], run)
    )
    expect(trap).toMatch(/효과가 없다|아랑곳/)
  })

  it("announces the gas tightening before the turn's gas damage", () => {
    const run = arena()
    const n = createGridNarrator(run)
    run.turn = 2
    const lines = n
      .next(
        [
          {
            type: 'status',
            actorId: 'opponent',
            message: '독가스',
            damage: 5,
            pos: { x: 7, y: 1 },
          },
        ],
        run
      )
      .map((l) => l.text)
    const shrink = lines.findIndex((t) => t.includes('반경'))
    const hurt = lines.findIndex(
      (t) => t.includes('독가스') && !t.includes('반경')
    )
    expect(shrink).toBeGreaterThan(-1)
    expect(shrink).toBeLessThan(hurt)
  })
})
