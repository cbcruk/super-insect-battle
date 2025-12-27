import { describe, it, expect } from 'vitest'
import {
  getTypeEffectiveness,
  getEffectivenessLevel,
  getEffectivenessText,
  typeChart,
} from './type-chart'

describe('typeChart', () => {
  describe('getTypeEffectiveness', () => {
    it('갑충 -> 도약 상성 1.5배', () => {
      expect(getTypeEffectiveness('beetle', 'hopper')).toBe(1.5)
    })

    it('갑충 -> 맹독 상성 0.5배', () => {
      expect(getTypeEffectiveness('beetle', 'venomous')).toBe(0.5)
    })

    it('같은 타입끼리는 1배', () => {
      expect(getTypeEffectiveness('beetle', 'beetle')).toBe(1.0)
    })
  })

  describe('getEffectivenessLevel', () => {
    it('1.5배 이상은 super', () => {
      expect(getEffectivenessLevel(1.5)).toBe('super')
      expect(getEffectivenessLevel(2.0)).toBe('super')
    })

    it('1배는 normal', () => {
      expect(getEffectivenessLevel(1.0)).toBe('normal')
    })

    it('1배 미만 0 초과는 not-very', () => {
      expect(getEffectivenessLevel(0.5)).toBe('not-very')
    })

    it('0은 immune', () => {
      expect(getEffectivenessLevel(0)).toBe('immune')
    })
  })

  describe('getEffectivenessText', () => {
    it('1.5배 이상은 효과가 굉장했다!', () => {
      expect(getEffectivenessText(1.5)).toBe('효과가 굉장했다!')
    })

    it('0.5배 이하는 효과가 별로', () => {
      expect(getEffectivenessText(0.5)).toBe('효과가 별로인 것 같다...')
    })

    it('0은 효과가 없다', () => {
      expect(getEffectivenessText(0)).toBe('효과가 없는 것 같다...')
    })

    it('1배는 빈 문자열', () => {
      expect(getEffectivenessText(1.0)).toBe('')
    })
  })

  describe('typeChart completeness', () => {
    const allTypes = [
      'beetle',
      'hopper',
      'flying',
      'swarm',
      'venomous',
      'survivor',
      'parasite',
      'luminous',
    ] as const

    it('모든 타입 조합이 정의되어 있다', () => {
      for (const attackType of allTypes) {
        for (const defenseType of allTypes) {
          expect(typeChart[attackType][defenseType]).toBeDefined()
          expect(typeof typeChart[attackType][defenseType]).toBe('number')
        }
      }
    })
  })
})
