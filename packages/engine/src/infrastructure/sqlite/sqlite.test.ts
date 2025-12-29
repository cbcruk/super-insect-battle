import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createLocalSqliteUnitOfWork, SqliteUnitOfWork } from './sqlite-unit-of-work'
import type { Player, OwnedInsect, Match, MatchLog } from '../../domain/entities'

describe('SQLite Repository', () => {
  let uow: SqliteUnitOfWork

  beforeEach(async () => {
    uow = await createLocalSqliteUnitOfWork(':memory:')
  })

  afterEach(async () => {
    await uow.close()
  })

  describe('PlayerRepository', () => {
    const createPlayer = (id: string): Player => ({
      id,
      visibleId: `visible-${id}`,
      nickname: `player-${id}`,
      rating: 1000,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    })

    it('save and findById', async () => {
      const player = createPlayer('p1')
      await uow.players.save(player)

      const found = await uow.players.findById('p1')
      expect(found).not.toBeNull()
      expect(found!.nickname).toBe('player-p1')
    })

    it('findByVisibleId', async () => {
      const player = createPlayer('p1')
      await uow.players.save(player)

      const found = await uow.players.findByVisibleId('visible-p1')
      expect(found).not.toBeNull()
      expect(found!.id).toBe('p1')
    })

    it('findByNickname', async () => {
      const player = createPlayer('p1')
      await uow.players.save(player)

      const found = await uow.players.findByNickname('player-p1')
      expect(found).not.toBeNull()
    })

    it('findTopByRating', async () => {
      await uow.players.save({ ...createPlayer('p1'), rating: 1200 })
      await uow.players.save({ ...createPlayer('p2'), rating: 1500 })
      await uow.players.save({ ...createPlayer('p3'), rating: 1100 })

      const top = await uow.players.findTopByRating(2)
      expect(top).toHaveLength(2)
      expect(top[0].id).toBe('p2')
      expect(top[1].id).toBe('p1')
    })

    it('updateRating', async () => {
      await uow.players.save(createPlayer('p1'))
      await uow.players.updateRating('p1', 1300)

      const found = await uow.players.findById('p1')
      expect(found!.rating).toBe(1300)
    })

    it('delete', async () => {
      await uow.players.save(createPlayer('p1'))
      const deleted = await uow.players.delete('p1')
      expect(deleted).toBe(true)

      const found = await uow.players.findById('p1')
      expect(found).toBeNull()
    })
  })

  describe('OwnedInsectRepository', () => {
    const createInsect = (id: string, playerId: string): OwnedInsect => ({
      id,
      playerId,
      speciesId: 'rhinoceros_beetle',
      nickname: null,
      level: 1,
      exp: 0,
      ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, spd: 15 },
      obtainedAt: new Date(),
    })

    beforeEach(async () => {
      await uow.players.save({
        id: 'player1',
        visibleId: 'v1',
        nickname: 'nick1',
        rating: 1000,
        createdAt: new Date(),
        lastActiveAt: new Date(),
      })
    })

    it('save and findById', async () => {
      const insect = createInsect('i1', 'player1')
      await uow.ownedInsects.save(insect)

      const found = await uow.ownedInsects.findById('i1')
      expect(found).not.toBeNull()
      expect(found!.speciesId).toBe('rhinoceros_beetle')
    })

    it('findByPlayerId', async () => {
      await uow.ownedInsects.save(createInsect('i1', 'player1'))
      await uow.ownedInsects.save(createInsect('i2', 'player1'))

      const insects = await uow.ownedInsects.findByPlayerId('player1')
      expect(insects).toHaveLength(2)
    })

    it('findByPlayerIdAndSpeciesId', async () => {
      await uow.ownedInsects.save(createInsect('i1', 'player1'))
      await uow.ownedInsects.save({
        ...createInsect('i2', 'player1'),
        speciesId: 'stag_beetle',
      })

      const beetles = await uow.ownedInsects.findByPlayerIdAndSpeciesId(
        'player1',
        'rhinoceros_beetle'
      )
      expect(beetles).toHaveLength(1)
      expect(beetles[0].id).toBe('i1')
    })

    it('updateLevel', async () => {
      await uow.ownedInsects.save(createInsect('i1', 'player1'))
      await uow.ownedInsects.updateLevel('i1', 5, 1200)

      const found = await uow.ownedInsects.findById('i1')
      expect(found!.level).toBe(5)
      expect(found!.exp).toBe(1200)
    })

    it('IVs are stored as JSON', async () => {
      const insect = createInsect('i1', 'player1')
      insect.ivs = { hp: 31, atk: 28, def: 20, spAtk: 15, spDef: 25, spd: 30 }
      await uow.ownedInsects.save(insect)

      const found = await uow.ownedInsects.findById('i1')
      expect(found!.ivs.hp).toBe(31)
      expect(found!.ivs.spd).toBe(30)
    })
  })

  describe('MatchRepository', () => {
    const createMatch = (id: string): Match => ({
      id,
      player1Id: 'p1',
      player2Id: 'p2',
      player1InsectId: 'i1',
      player2InsectId: 'i2',
      winnerId: null,
      startedAt: new Date(),
      endedAt: null,
      totalTurns: 0,
      status: 'active',
    })

    beforeEach(async () => {
      await uow.players.save({
        id: 'p1',
        visibleId: 'v1',
        nickname: 'n1',
        rating: 1000,
        createdAt: new Date(),
        lastActiveAt: new Date(),
      })
      await uow.players.save({
        id: 'p2',
        visibleId: 'v2',
        nickname: 'n2',
        rating: 1000,
        createdAt: new Date(),
        lastActiveAt: new Date(),
      })
    })

    it('save and findById', async () => {
      await uow.matches.save(createMatch('m1'))
      const found = await uow.matches.findById('m1')
      expect(found).not.toBeNull()
      expect(found!.status).toBe('active')
    })

    it('findActiveMatches', async () => {
      await uow.matches.save(createMatch('m1'))
      await uow.matches.save({ ...createMatch('m2'), status: 'finished' })

      const active = await uow.matches.findActiveMatches()
      expect(active).toHaveLength(1)
      expect(active[0].id).toBe('m1')
    })

    it('updateStatus', async () => {
      await uow.matches.save(createMatch('m1'))
      await uow.matches.updateStatus('m1', 'finished', 'p1')

      const found = await uow.matches.findById('m1')
      expect(found!.status).toBe('finished')
      expect(found!.winnerId).toBe('p1')
      expect(found!.endedAt).not.toBeNull()
    })

    it('findByPlayerId', async () => {
      await uow.matches.save(createMatch('m1'))
      await uow.matches.save({ ...createMatch('m2'), player1Id: 'p2', player2Id: 'p1' })

      const matches = await uow.matches.findByPlayerId('p1')
      expect(matches).toHaveLength(2)
    })
  })

  describe('MatchLogRepository', () => {
    beforeEach(async () => {
      await uow.players.save({
        id: 'p1',
        visibleId: 'v1',
        nickname: 'n1',
        rating: 1000,
        createdAt: new Date(),
        lastActiveAt: new Date(),
      })
      await uow.matches.save({
        id: 'm1',
        player1Id: 'p1',
        player2Id: null,
        player1InsectId: 'i1',
        player2InsectId: 'i2',
        winnerId: null,
        startedAt: new Date(),
        endedAt: null,
        totalTurns: 0,
        status: 'active',
      })
    })

    it('save and findByMatchId', async () => {
      const log: MatchLog = {
        id: 'log1',
        matchId: 'm1',
        initialSnapshot: {
          turn: 0,
          player1: {
            speciesId: 'rhinoceros_beetle',
            currentHp: 100,
            maxHp: 100,
            statModifiers: { atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 },
            statusCondition: null,
            sleepTurns: 0,
          },
          player2: {
            speciesId: 'stag_beetle',
            currentHp: 80,
            maxHp: 80,
            statModifiers: { atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 },
            statusCondition: null,
            sleepTurns: 0,
          },
          timestamp: new Date(),
        },
        actions: [],
        createdAt: new Date(),
      }
      await uow.matchLogs.save(log)

      const found = await uow.matchLogs.findByMatchId('m1')
      expect(found).not.toBeNull()
      expect(found!.initialSnapshot.player1.speciesId).toBe('rhinoceros_beetle')
    })

    it('appendAction', async () => {
      const log: MatchLog = {
        id: 'log1',
        matchId: 'm1',
        initialSnapshot: {
          turn: 0,
          player1: {
            speciesId: 'rhinoceros_beetle',
            currentHp: 100,
            maxHp: 100,
            statModifiers: { atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 },
            statusCondition: null,
            sleepTurns: 0,
          },
          player2: {
            speciesId: 'stag_beetle',
            currentHp: 80,
            maxHp: 80,
            statModifiers: { atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 },
            statusCondition: null,
            sleepTurns: 0,
          },
          timestamp: new Date(),
        },
        actions: [],
        createdAt: new Date(),
      }
      await uow.matchLogs.save(log)

      await uow.matchLogs.appendAction('m1', {
        sequence: 1,
        turn: 1,
        type: 'turn_start',
        actor: 1,
        data: { turnNumber: 1 },
      })

      const found = await uow.matchLogs.findByMatchId('m1')
      expect(found!.actions).toHaveLength(1)
      expect(found!.actions[0].type).toBe('turn_start')
    })
  })

  describe('Transaction', () => {
    it('commit persists changes', async () => {
      await uow.begin()
      await uow.players.save({
        id: 'tx1',
        visibleId: 'vtx1',
        nickname: 'ntx1',
        rating: 1000,
        createdAt: new Date(),
        lastActiveAt: new Date(),
      })
      await uow.commit()

      const found = await uow.players.findById('tx1')
      expect(found).not.toBeNull()
    })

    it('rollback reverts changes', async () => {
      await uow.begin()
      await uow.players.save({
        id: 'tx2',
        visibleId: 'vtx2',
        nickname: 'ntx2',
        rating: 1000,
        createdAt: new Date(),
        lastActiveAt: new Date(),
      })
      await uow.rollback()

      const found = await uow.players.findById('tx2')
      expect(found).toBeNull()
    })
  })
})
