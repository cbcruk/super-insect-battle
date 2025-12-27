import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryPlayerRepository } from './in-memory-player-repository'
import { InMemoryOwnedInsectRepository } from './in-memory-owned-insect-repository'
import { InMemoryMatchRepository } from './in-memory-match-repository'
import { InMemoryMatchLogRepository } from './in-memory-match-log-repository'
import { InMemoryUnitOfWork } from './in-memory-unit-of-work'
import type { Player, OwnedInsect, Match, MatchLog } from '../../domain/entities'

describe('InMemoryPlayerRepository', () => {
  let repo: InMemoryPlayerRepository

  const createPlayer = (id: string, nickname: string): Player => ({
    id,
    visibleId: `visible_${id}`,
    nickname,
    rating: 1000,
    createdAt: new Date(),
    lastActiveAt: new Date(),
  })

  beforeEach(() => {
    repo = new InMemoryPlayerRepository()
  })

  it('save 후 findById로 조회 가능', async () => {
    const player = createPlayer('1', 'TestPlayer')
    await repo.save(player)

    const found = await repo.findById('1')
    expect(found).not.toBeNull()
    expect(found?.nickname).toBe('TestPlayer')
  })

  it('findByNickname으로 조회 가능', async () => {
    await repo.save(createPlayer('1', 'UniqueNickname'))

    const found = await repo.findByNickname('UniqueNickname')
    expect(found).not.toBeNull()
    expect(found?.id).toBe('1')
  })

  it('findTopByRating 정렬 확인', async () => {
    await repo.save({ ...createPlayer('1', 'Low'), rating: 800 })
    await repo.save({ ...createPlayer('2', 'High'), rating: 1500 })
    await repo.save({ ...createPlayer('3', 'Mid'), rating: 1200 })

    const top = await repo.findTopByRating(2)
    expect(top).toHaveLength(2)
    expect(top[0].nickname).toBe('High')
    expect(top[1].nickname).toBe('Mid')
  })

  it('updateRating으로 레이팅 업데이트', async () => {
    await repo.save(createPlayer('1', 'Player'))

    const updated = await repo.updateRating('1', 1200)
    expect(updated?.rating).toBe(1200)
  })

  it('delete 후 조회 불가', async () => {
    await repo.save(createPlayer('1', 'ToDelete'))

    const deleted = await repo.delete('1')
    expect(deleted).toBe(true)

    const found = await repo.findById('1')
    expect(found).toBeNull()
  })
})

describe('InMemoryOwnedInsectRepository', () => {
  let repo: InMemoryOwnedInsectRepository

  const createOwnedInsect = (
    id: string,
    playerId: string,
    speciesId: string
  ): OwnedInsect => ({
    id,
    playerId,
    speciesId,
    nickname: null,
    level: 1,
    exp: 0,
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, spd: 15 },
    obtainedAt: new Date(),
  })

  beforeEach(() => {
    repo = new InMemoryOwnedInsectRepository()
  })

  it('findByPlayerId로 플레이어의 곤충 조회', async () => {
    await repo.save(createOwnedInsect('1', 'player1', 'rhinoceros_beetle'))
    await repo.save(createOwnedInsect('2', 'player1', 'stag_beetle'))
    await repo.save(createOwnedInsect('3', 'player2', 'scorpion'))

    const player1Insects = await repo.findByPlayerId('player1')
    expect(player1Insects).toHaveLength(2)
  })

  it('updateLevel로 레벨 업데이트', async () => {
    await repo.save(createOwnedInsect('1', 'player1', 'rhinoceros_beetle'))

    const updated = await repo.updateLevel('1', 10, 500)
    expect(updated?.level).toBe(10)
    expect(updated?.exp).toBe(500)
  })
})

describe('InMemoryMatchRepository', () => {
  let repo: InMemoryMatchRepository

  const createMatch = (
    id: string,
    player1Id: string,
    player2Id: string | null
  ): Match => ({
    id,
    player1Id,
    player2Id,
    player1InsectId: 'insect1',
    player2InsectId: 'insect2',
    winnerId: null,
    startedAt: new Date(),
    endedAt: null,
    totalTurns: 0,
    status: 'active',
  })

  beforeEach(() => {
    repo = new InMemoryMatchRepository()
  })

  it('findActiveMatchByPlayerId로 진행 중 매치 조회', async () => {
    await repo.save(createMatch('1', 'player1', 'player2'))

    const active = await repo.findActiveMatchByPlayerId('player1')
    expect(active).not.toBeNull()
    expect(active?.id).toBe('1')
  })

  it('updateStatus로 매치 종료 처리', async () => {
    await repo.save(createMatch('1', 'player1', 'player2'))

    const updated = await repo.updateStatus('1', 'finished', 'player1')
    expect(updated?.status).toBe('finished')
    expect(updated?.winnerId).toBe('player1')
    expect(updated?.endedAt).not.toBeNull()
  })

  it('종료된 매치는 findActiveMatchByPlayerId에서 제외', async () => {
    const match = createMatch('1', 'player1', 'player2')
    match.status = 'finished'
    await repo.save(match)

    const active = await repo.findActiveMatchByPlayerId('player1')
    expect(active).toBeNull()
  })
})

describe('InMemoryMatchLogRepository', () => {
  let repo: InMemoryMatchLogRepository

  const createMatchLog = (id: string, matchId: string): MatchLog => ({
    id,
    matchId,
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
        currentHp: 100,
        maxHp: 100,
        statModifiers: { atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 },
        statusCondition: null,
        sleepTurns: 0,
      },
      timestamp: new Date(),
    },
    actions: [],
    createdAt: new Date(),
  })

  beforeEach(() => {
    repo = new InMemoryMatchLogRepository()
  })

  it('findByMatchId로 매치 로그 조회', async () => {
    await repo.save(createMatchLog('log1', 'match1'))

    const found = await repo.findByMatchId('match1')
    expect(found).not.toBeNull()
    expect(found?.id).toBe('log1')
  })

  it('appendAction으로 액션 추가', async () => {
    await repo.save(createMatchLog('log1', 'match1'))

    const success = await repo.appendAction('match1', {
      sequence: 1,
      turn: 1,
      type: 'move_execute',
      actor: 1,
      data: { moveId: 'horn_thrust', hit: true },
    })

    expect(success).toBe(true)

    const log = await repo.findByMatchId('match1')
    expect(log?.actions).toHaveLength(1)
    expect(log?.actions[0].type).toBe('move_execute')
  })
})

describe('InMemoryUnitOfWork', () => {
  let uow: InMemoryUnitOfWork

  beforeEach(() => {
    uow = new InMemoryUnitOfWork()
  })

  it('모든 repository에 접근 가능', () => {
    expect(uow.players).toBeDefined()
    expect(uow.ownedInsects).toBeDefined()
    expect(uow.matches).toBeDefined()
    expect(uow.matchLogs).toBeDefined()
  })

  it('begin/commit 트랜잭션 흐름', async () => {
    await uow.begin()

    await uow.players.save({
      id: '1',
      visibleId: 'test',
      nickname: 'Test',
      rating: 1000,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    })

    await uow.commit()

    const player = await uow.players.findById('1')
    expect(player).not.toBeNull()
  })

  it('clear로 모든 데이터 초기화', async () => {
    await uow.players.save({
      id: '1',
      visibleId: 'test',
      nickname: 'Test',
      rating: 1000,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    })

    uow.clear()

    const player = await uow.players.findById('1')
    expect(player).toBeNull()
  })
})
