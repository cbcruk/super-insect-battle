import { describe, it, expect } from 'vitest'
import {
  insects,
  simulateBattle,
  simulateBattleWithReplay,
  simulateMultipleBattles,
} from '../index'

describe('배틀 시뮬레이션 통합테스트', () => {
  describe('단일 배틀', () => {
    it('장수풍뎅이 vs 사슴벌레 배틀이 정상 완료된다', () => {
      const result = simulateBattle(
        insects.rhinoceros_beetle,
        insects.stag_beetle
      )

      expect(result.status).toBe('finished')
      expect(['player', 'opponent', 'draw']).toContain(result.winner)
      expect(result.turn).toBeGreaterThan(0)
      expect(result.log.length).toBeGreaterThan(0)
    })

    it('배틀 로그에 턴 정보가 기록된다', () => {
      const result = simulateBattle(
        insects.rhinoceros_beetle,
        insects.stag_beetle
      )

      for (const log of result.log) {
        expect(log.turn).toBeGreaterThanOrEqual(0)
        expect(typeof log.action).toBe('string')
      }
    })

    it('모든 곤충 조합으로 배틀이 가능하다', () => {
      const insectList = Object.values(insects)

      for (const attacker of insectList) {
        for (const defender of insectList) {
          const result = simulateBattle(attacker, defender)
          expect(result.status).toBe('finished')
        }
      }
    })
  })

  describe('상태이상 시스템', () => {
    it('전갈 vs 장수풍뎅이 배틀에서 상태이상이 발생할 수 있다', () => {
      let statusConditionOccurred = false

      for (let i = 0; i < 20; i++) {
        const result = simulateBattle(insects.scorpion, insects.rhinoceros_beetle)

        const hasStatusLog = result.log.some(
          (log) =>
            log.action.includes('독') ||
            log.action.includes('마비') ||
            log.action.includes('수면') ||
            log.action.includes('화상')
        )

        if (hasStatusLog) {
          statusConditionOccurred = true
          break
        }
      }

      expect(statusConditionOccurred).toBe(true)
    })
  })

  describe('N판 시뮬레이션', () => {
    it('100판 시뮬레이션 결과 합계가 정확하다', () => {
      const n = 100
      const sim = simulateMultipleBattles(
        insects.rhinoceros_beetle,
        insects.stag_beetle,
        n
      )

      expect(sim.playerWins + sim.opponentWins + sim.draws).toBe(n)
    })

    it('승률이 0-100% 범위 내에 있다', () => {
      const sim = simulateMultipleBattles(
        insects.rhinoceros_beetle,
        insects.stag_beetle,
        100
      )

      expect(sim.winRate).toBeGreaterThanOrEqual(0)
      expect(sim.winRate).toBeLessThanOrEqual(100)
    })

    it('평균 턴 수가 유효하다', () => {
      const sim = simulateMultipleBattles(
        insects.rhinoceros_beetle,
        insects.stag_beetle,
        100
      )

      expect(sim.avgTurns).toBeGreaterThan(0)
      expect(sim.avgTurns).toBeLessThan(100)
    })

    it('1000판 시뮬레이션이 안정적으로 완료된다', () => {
      const sim = simulateMultipleBattles(
        insects.rhinoceros_beetle,
        insects.stag_beetle,
        1000
      )

      // 1000판 모두 정상 완료되어야 함
      expect(sim.playerWins + sim.opponentWins + sim.draws).toBe(1000)
      expect(sim.avgTurns).toBeGreaterThan(0)
    })
  })

  describe('리플레이 시스템', () => {
    it('리플레이 데이터가 생성된다', () => {
      const result = simulateBattleWithReplay(
        insects.grasshopper,
        insects.stag_beetle
      )

      expect(result.replay).toBeDefined()
      expect(result.replay.actions.length).toBeGreaterThan(0)
      expect(result.replay.initialSnapshot).toBeDefined()
    })

    it('초기 스냅샷이 올바른 형태이다', () => {
      const result = simulateBattleWithReplay(
        insects.rhinoceros_beetle,
        insects.stag_beetle
      )

      const snapshot = result.replay.initialSnapshot
      expect(snapshot.turn).toBe(0)
      expect(snapshot.player1).toBeDefined()
      expect(snapshot.player2).toBeDefined()
      expect(snapshot.player1.currentHp).toBe(snapshot.player1.maxHp)
      expect(snapshot.player2.currentHp).toBe(snapshot.player2.maxHp)
    })

    it('액션에 시퀀스 번호가 순차적으로 부여된다', () => {
      const result = simulateBattleWithReplay(
        insects.rhinoceros_beetle,
        insects.stag_beetle
      )

      // 시퀀스는 1부터 시작
      for (let i = 0; i < result.replay.actions.length; i++) {
        expect(result.replay.actions[i].sequence).toBe(i + 1)
      }
    })

    it('액션 타입이 유효하다', () => {
      const result = simulateBattleWithReplay(
        insects.rhinoceros_beetle,
        insects.stag_beetle
      )

      const validTypes = [
        'turn_start',
        'turn_end',
        'move_select',
        'move_execute',
        'damage_dealt',
        'status_applied',
        'status_damage',
        'stat_changed',
        'faint',
      ]

      for (const action of result.replay.actions) {
        expect(validTypes).toContain(action.type)
      }
    })

    it('totalActions가 실제 액션 수와 일치한다', () => {
      const result = simulateBattleWithReplay(
        insects.rhinoceros_beetle,
        insects.stag_beetle
      )

      expect(result.replay.totalActions).toBe(result.replay.actions.length)
    })
  })
})
