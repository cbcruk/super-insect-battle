import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  applyStatusCondition,
  checkCanMove,
  processEndOfTurnStatus,
  getBurnAttackMultiplier,
  getParalysisSpeedMultiplier,
} from './status-condition'
import { createBattleInsect } from './battle-engine'
import { insects } from '../data/insects'

describe('status-condition', () => {
  describe('applyStatusCondition', () => {
    it('상태이상이 없는 곤충에게 독 적용 성공', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)

      const result = applyStatusCondition(insect, 'poison')

      expect(result).toBe(true)
      expect(insect.statusCondition).toBe('poison')
    })

    it('이미 상태이상이 있으면 적용 실패', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)
      insect.statusCondition = 'burn'

      const result = applyStatusCondition(insect, 'poison')

      expect(result).toBe(false)
      expect(insect.statusCondition).toBe('burn')
    })

    it('수면 상태 적용 시 sleepTurns 설정 (1-3턴)', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)

      applyStatusCondition(insect, 'sleep')

      expect(insect.statusCondition).toBe('sleep')
      expect(insect.sleepTurns).toBeGreaterThanOrEqual(1)
      expect(insect.sleepTurns).toBeLessThanOrEqual(3)
    })
  })

  describe('checkCanMove', () => {
    it('상태이상 없으면 행동 가능', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)

      const result = checkCanMove(insect)

      expect(result.canMove).toBe(true)
      expect(result.message).toBeNull()
    })

    it('마비 상태에서 25% 확률로 행동 불가', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)
      insect.statusCondition = 'paralysis'

      vi.spyOn(Math, 'random').mockReturnValue(0.1)

      const result = checkCanMove(insect)

      expect(result.canMove).toBe(false)
      expect(result.message).toContain('마비')

      vi.restoreAllMocks()
    })

    it('마비 상태에서 75% 확률로 행동 가능', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)
      insect.statusCondition = 'paralysis'

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const result = checkCanMove(insect)

      expect(result.canMove).toBe(true)

      vi.restoreAllMocks()
    })

    it('수면 상태에서 행동 불가', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)
      insect.statusCondition = 'sleep'
      insect.sleepTurns = 2

      const result = checkCanMove(insect)

      expect(result.canMove).toBe(false)
      expect(result.message).toContain('잠들어')
      expect(insect.sleepTurns).toBe(1)
    })

    it('수면 턴이 끝나면 깨어남', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)
      insect.statusCondition = 'sleep'
      insect.sleepTurns = 1

      const result = checkCanMove(insect)

      expect(result.canMove).toBe(true)
      expect(result.message).toContain('눈을 떴다')
      expect(insect.statusCondition).toBeNull()
    })
  })

  describe('processEndOfTurnStatus', () => {
    it('독 상태에서 최대 HP의 1/8 데미지', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)
      insect.statusCondition = 'poison'
      const initialHp = insect.currentHp
      const expectedDamage = Math.floor(insect.maxHp / 8)

      const result = processEndOfTurnStatus(insect)

      expect(result.damage).toBe(expectedDamage)
      expect(insect.currentHp).toBe(initialHp - expectedDamage)
      expect(result.message).toContain('독 데미지')
    })

    it('화상 상태에서 최대 HP의 1/16 데미지', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)
      insect.statusCondition = 'burn'
      const initialHp = insect.currentHp
      const expectedDamage = Math.floor(insect.maxHp / 16)

      const result = processEndOfTurnStatus(insect)

      expect(result.damage).toBe(expectedDamage)
      expect(insect.currentHp).toBe(initialHp - expectedDamage)
      expect(result.message).toContain('화상 데미지')
    })

    it('마비 상태에서 턴 종료 데미지 없음', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)
      insect.statusCondition = 'paralysis'
      const initialHp = insect.currentHp

      const result = processEndOfTurnStatus(insect)

      expect(result.damage).toBe(0)
      expect(insect.currentHp).toBe(initialHp)
    })
  })

  describe('getBurnAttackMultiplier', () => {
    it('화상 상태에서 0.5 반환', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)
      insect.statusCondition = 'burn'

      expect(getBurnAttackMultiplier(insect)).toBe(0.5)
    })

    it('정상 상태에서 1.0 반환', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)

      expect(getBurnAttackMultiplier(insect)).toBe(1.0)
    })
  })

  describe('getParalysisSpeedMultiplier', () => {
    it('마비 상태에서 0.5 반환', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)
      insect.statusCondition = 'paralysis'

      expect(getParalysisSpeedMultiplier(insect)).toBe(0.5)
    })

    it('정상 상태에서 1.0 반환', () => {
      const insect = createBattleInsect(insects.rhinoceros_beetle)

      expect(getParalysisSpeedMultiplier(insect)).toBe(1.0)
    })
  })
})
