import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createBattleInsect,
  calculateDamage,
  getEffectiveStat,
  determineFirstAttacker,
  applyStatChange,
  simulateBattle,
  simulateMultipleBattles,
} from './battle-engine'
import { insects } from '../data/insects'
import { moves } from '../data/moves'

describe('BattleEngine', () => {
  describe('createBattleInsect', () => {
    it('곤충을 배틀용 상태로 변환한다', () => {
      const rhinoceros = insects.rhinoceros_beetle
      const battleInsect = createBattleInsect(rhinoceros)

      expect(battleInsect.base).toBe(rhinoceros)
      expect(battleInsect.currentHp).toBe(battleInsect.maxHp)
      expect(battleInsect.maxHp).toBe(rhinoceros.baseStats.hp * 2 + 110)
      expect(battleInsect.statModifiers).toEqual({
        atk: 0,
        def: 0,
        spAtk: 0,
        spDef: 0,
        spd: 0,
      })
      expect(battleInsect.statusCondition).toBeNull()
    })
  })

  describe('getEffectiveStat', () => {
    it('스탯 단계가 0이면 기본값 반환', () => {
      expect(getEffectiveStat(100, 0)).toBe(100)
    })

    it('스탯 단계 +1이면 1.5배', () => {
      expect(getEffectiveStat(100, 1)).toBe(150)
    })

    it('스탯 단계 +2이면 2배', () => {
      expect(getEffectiveStat(100, 2)).toBe(200)
    })

    it('스탯 단계 -1이면 2/3배', () => {
      expect(getEffectiveStat(100, -1)).toBe(66)
    })

    it('스탯 단계 -2이면 1/2배', () => {
      expect(getEffectiveStat(100, -2)).toBe(50)
    })
  })

  describe('calculateDamage', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    it('상태기는 데미지 0 반환', () => {
      const attacker = createBattleInsect(insects.rhinoceros_beetle)
      const defender = createBattleInsect(insects.stag_beetle)
      const move = moves.shell_fortify

      const result = calculateDamage(attacker, defender, move)

      expect(result.damage).toBe(0)
      expect(result.critical).toBe(false)
    })

    it('물리 기술은 공격/방어 스탯 사용', () => {
      const attacker = createBattleInsect(insects.rhinoceros_beetle)
      const defender = createBattleInsect(insects.grasshopper)
      const move = moves.megahorn

      const result = calculateDamage(attacker, defender, move)

      expect(result.damage).toBeGreaterThan(0)
      expect(result.effectiveness).toBe(1.5)
    })

    it('최소 1 데미지 보장', () => {
      const attacker = createBattleInsect(insects.grasshopper)
      attacker.statModifiers.atk = -6
      const defender = createBattleInsect(insects.rhinoceros_beetle)
      defender.statModifiers.def = 6
      const move = moves.quick_hop

      const result = calculateDamage(attacker, defender, move)

      expect(result.damage).toBeGreaterThanOrEqual(1)
    })
  })

  describe('determineFirstAttacker', () => {
    it('우선도가 높은 쪽이 선공', () => {
      const player = createBattleInsect(insects.rhinoceros_beetle)
      const opponent = createBattleInsect(insects.grasshopper)
      const playerMove = moves.horn_thrust
      const opponentMove = moves.jump_kick

      const first = determineFirstAttacker(
        player,
        opponent,
        playerMove,
        opponentMove
      )

      expect(first).toBe('player')
    })

    it('우선도 같으면 스피드 빠른 쪽이 선공', () => {
      const player = createBattleInsect(insects.rhinoceros_beetle)
      const opponent = createBattleInsect(insects.grasshopper)
      const playerMove = moves.megahorn
      const opponentMove = moves.jump_kick

      const first = determineFirstAttacker(
        player,
        opponent,
        playerMove,
        opponentMove
      )

      expect(first).toBe('opponent')
    })
  })

  describe('applyStatChange', () => {
    it('스탯 변화 적용', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)

      const result = applyStatChange(insect, 'atk', 2)

      expect(result.changed).toBe(true)
      expect(result.newStage).toBe(2)
      expect(insect.statModifiers.atk).toBe(2)
    })

    it('최대 +6 제한', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)
      insect.statModifiers.atk = 5

      const result = applyStatChange(insect, 'atk', 2)

      expect(result.newStage).toBe(6)
    })

    it('최소 -6 제한', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)
      insect.statModifiers.def = -5

      const result = applyStatChange(insect, 'def', -2)

      expect(result.newStage).toBe(-6)
    })
  })

  describe('simulateBattle', () => {
    it('배틀 시뮬레이션 완료 후 승자 결정', () => {
      const result = simulateBattle(
        insects.rhinoceros_beetle,
        insects.grasshopper
      )

      expect(result.status).toBe('finished')
      expect(['player', 'opponent', 'draw']).toContain(result.winner)
      expect(result.turn).toBeGreaterThan(0)
    })
  })

  describe('simulateMultipleBattles', () => {
    it('N판 시뮬레이션 통계 반환', () => {
      const result = simulateMultipleBattles(
        insects.rhinoceros_beetle,
        insects.grasshopper,
        10
      )

      expect(result.playerWins + result.opponentWins + result.draws).toBe(10)
      expect(result.winRate).toBeGreaterThanOrEqual(0)
      expect(result.winRate).toBeLessThanOrEqual(100)
      expect(result.avgTurns).toBeGreaterThan(0)
    })
  })
})
