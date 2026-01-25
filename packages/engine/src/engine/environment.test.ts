import { describe, it, expect } from 'vitest'
import {
  getEnvironmentBonus,
  getRandomTerrain,
  getRandomTimeOfDay,
  getRandomEnvironment,
  formatEnvironment,
  formatEnvironmentBonus,
  terrainNames,
  timeOfDayNames,
} from './environment'
import type { Arthropod } from '../types/arthropod'
import type { Environment } from '../types/environment'
import { TERRAINS, TIMES_OF_DAY } from '../types/environment'

const createMockArthropod = (
  preferredTerrains: Array<'forest' | 'desert' | 'wetland' | 'cave'>,
  preferredTime: 'day' | 'night' | 'both'
): Arthropod => ({
  id: 'test',
  name: 'Test',
  nameKo: '테스트',
  physical: { weightG: 10, lengthMm: 50, strengthIndex: 50 },
  weapon: { type: 'horn', power: 50, venomous: false },
  behavior: { aggression: 50, style: 'grappler' },
  defense: { armorRating: 50, evasion: 50 },
  habitat: { preferredTerrains, preferredTime },
  actions: ['test_action'],
  description: 'Test arthropod',
})

describe('getEnvironmentBonus', () => {
  it('returns max bonus for preferred terrain and time', () => {
    const arthropod = createMockArthropod(['forest'], 'night')
    const environment: Environment = { terrain: 'forest', timeOfDay: 'night' }

    const bonus = getEnvironmentBonus(arthropod, environment)

    expect(bonus).toBeCloseTo(1.265, 3)
  })

  it('returns terrain bonus only for preferred terrain but wrong time', () => {
    const arthropod = createMockArthropod(['forest'], 'night')
    const environment: Environment = { terrain: 'forest', timeOfDay: 'day' }

    const bonus = getEnvironmentBonus(arthropod, environment)

    expect(bonus).toBeCloseTo(1.15 * 0.9, 3)
  })

  it('returns time bonus only for preferred time but wrong terrain', () => {
    const arthropod = createMockArthropod(['forest'], 'night')
    const environment: Environment = { terrain: 'desert', timeOfDay: 'night' }

    const bonus = getEnvironmentBonus(arthropod, environment)

    expect(bonus).toBeCloseTo(1.0 * 1.1, 3)
  })

  it('returns penalty for both wrong terrain and time', () => {
    const arthropod = createMockArthropod(['forest'], 'night')
    const environment: Environment = { terrain: 'desert', timeOfDay: 'day' }

    const bonus = getEnvironmentBonus(arthropod, environment)

    expect(bonus).toBeCloseTo(0.9, 3)
  })

  it('handles multiple preferred terrains', () => {
    const arthropod = createMockArthropod(['desert', 'cave'], 'night')
    const desertEnv: Environment = { terrain: 'desert', timeOfDay: 'night' }
    const caveEnv: Environment = { terrain: 'cave', timeOfDay: 'night' }

    expect(getEnvironmentBonus(arthropod, desertEnv)).toBeCloseTo(1.265, 3)
    expect(getEnvironmentBonus(arthropod, caveEnv)).toBeCloseTo(1.265, 3)
  })

  it('handles both preferred time', () => {
    const arthropod = createMockArthropod(['forest'], 'both')
    const dayEnv: Environment = { terrain: 'forest', timeOfDay: 'day' }
    const nightEnv: Environment = { terrain: 'forest', timeOfDay: 'night' }

    expect(getEnvironmentBonus(arthropod, dayEnv)).toBeCloseTo(1.265, 3)
    expect(getEnvironmentBonus(arthropod, nightEnv)).toBeCloseTo(1.265, 3)
  })
})

describe('random environment generators', () => {
  it('getRandomTerrain returns valid terrain', () => {
    for (let i = 0; i < 20; i++) {
      const terrain = getRandomTerrain()
      expect(TERRAINS).toContain(terrain)
    }
  })

  it('getRandomTimeOfDay returns valid time', () => {
    for (let i = 0; i < 20; i++) {
      const time = getRandomTimeOfDay()
      expect(TIMES_OF_DAY).toContain(time)
    }
  })

  it('getRandomEnvironment returns valid environment', () => {
    for (let i = 0; i < 20; i++) {
      const env = getRandomEnvironment()
      expect(TERRAINS).toContain(env.terrain)
      expect(TIMES_OF_DAY).toContain(env.timeOfDay)
    }
  })
})

describe('formatEnvironment', () => {
  it('formats environment correctly', () => {
    expect(formatEnvironment({ terrain: 'forest', timeOfDay: 'day' })).toBe(
      '숲 / 낮'
    )
    expect(formatEnvironment({ terrain: 'desert', timeOfDay: 'night' })).toBe(
      '사막 / 밤'
    )
    expect(formatEnvironment({ terrain: 'wetland', timeOfDay: 'day' })).toBe(
      '습지 / 낮'
    )
    expect(formatEnvironment({ terrain: 'cave', timeOfDay: 'night' })).toBe(
      '동굴 / 밤'
    )
  })
})

describe('formatEnvironmentBonus', () => {
  it('formats positive bonus', () => {
    expect(formatEnvironmentBonus(1.15)).toBe('+15%')
    expect(formatEnvironmentBonus(1.265)).toBe('+26%')
  })

  it('formats negative bonus', () => {
    expect(formatEnvironmentBonus(0.9)).toBe('-10%')
    expect(formatEnvironmentBonus(0.85)).toBe('-15%')
  })

  it('formats neutral bonus', () => {
    expect(formatEnvironmentBonus(1.0)).toBe('±0%')
  })
})

describe('terrainNames', () => {
  it('has all terrains', () => {
    expect(terrainNames.forest).toBe('숲')
    expect(terrainNames.desert).toBe('사막')
    expect(terrainNames.wetland).toBe('습지')
    expect(terrainNames.cave).toBe('동굴')
  })
})

describe('timeOfDayNames', () => {
  it('has all times', () => {
    expect(timeOfDayNames.day).toBe('낮')
    expect(timeOfDayNames.night).toBe('밤')
  })
})
