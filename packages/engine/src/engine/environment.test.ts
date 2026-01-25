import { describe, it, expect } from 'vitest'
import {
  getEnvironmentBonus,
  getWeatherBonus,
  getRandomTerrain,
  getRandomTimeOfDay,
  getRandomWeatherForTerrain,
  getRandomEnvironment,
  formatEnvironment,
  formatEnvironmentBonus,
  terrainNames,
  timeOfDayNames,
  weatherNames,
} from './environment'
import type { Arthropod } from '../types/arthropod'
import type { Environment } from '../types/environment'
import { TERRAINS, TIMES_OF_DAY, WEATHERS, TERRAIN_WEATHERS } from '../types/environment'

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
  it('returns max bonus for preferred terrain and time with clear weather', () => {
    const arthropod = createMockArthropod(['forest'], 'night')
    const environment: Environment = { terrain: 'forest', timeOfDay: 'night', weather: 'clear' }

    const bonus = getEnvironmentBonus(arthropod, environment)

    expect(bonus).toBeCloseTo(1.265, 3)
  })

  it('returns terrain bonus only for preferred terrain but wrong time', () => {
    const arthropod = createMockArthropod(['forest'], 'night')
    const environment: Environment = { terrain: 'forest', timeOfDay: 'day', weather: 'clear' }

    const bonus = getEnvironmentBonus(arthropod, environment)

    expect(bonus).toBeCloseTo(1.15 * 0.9, 3)
  })

  it('returns time bonus only for preferred time but wrong terrain', () => {
    const arthropod = createMockArthropod(['forest'], 'night')
    const environment: Environment = { terrain: 'desert', timeOfDay: 'night', weather: 'clear' }

    const bonus = getEnvironmentBonus(arthropod, environment)

    expect(bonus).toBeCloseTo(1.0 * 1.1, 3)
  })

  it('returns penalty for both wrong terrain and time', () => {
    const arthropod = createMockArthropod(['forest'], 'night')
    const environment: Environment = { terrain: 'desert', timeOfDay: 'day', weather: 'clear' }

    const bonus = getEnvironmentBonus(arthropod, environment)

    expect(bonus).toBeCloseTo(0.9, 3)
  })

  it('handles multiple preferred terrains', () => {
    const arthropod = createMockArthropod(['desert', 'cave'], 'night')
    const desertEnv: Environment = { terrain: 'desert', timeOfDay: 'night', weather: 'clear' }
    const caveEnv: Environment = { terrain: 'cave', timeOfDay: 'night', weather: 'clear' }

    expect(getEnvironmentBonus(arthropod, desertEnv)).toBeCloseTo(1.265, 3)
    expect(getEnvironmentBonus(arthropod, caveEnv)).toBeCloseTo(1.265, 3)
  })

  it('handles both preferred time', () => {
    const arthropod = createMockArthropod(['forest'], 'both')
    const dayEnv: Environment = { terrain: 'forest', timeOfDay: 'day', weather: 'clear' }
    const nightEnv: Environment = { terrain: 'forest', timeOfDay: 'night', weather: 'clear' }

    expect(getEnvironmentBonus(arthropod, dayEnv)).toBeCloseTo(1.265, 3)
    expect(getEnvironmentBonus(arthropod, nightEnv)).toBeCloseTo(1.265, 3)
  })
})

describe('getWeatherBonus', () => {
  it('returns 1.0 for clear weather', () => {
    const arthropod = createMockArthropod(['forest'], 'night')
    const env: Environment = { terrain: 'forest', timeOfDay: 'night', weather: 'clear' }

    expect(getWeatherBonus(arthropod, env)).toBe(1.0)
  })

  it('returns bonus for wetland arthropod in rain', () => {
    const arthropod = createMockArthropod(['wetland'], 'night')
    const env: Environment = { terrain: 'wetland', timeOfDay: 'night', weather: 'rain' }

    expect(getWeatherBonus(arthropod, env)).toBe(1.1)
  })

  it('returns penalty for non-wetland arthropod in rain', () => {
    const arthropod = createMockArthropod(['forest'], 'night')
    const env: Environment = { terrain: 'forest', timeOfDay: 'night', weather: 'rain' }

    expect(getWeatherBonus(arthropod, env)).toBe(0.95)
  })

  it('returns bonus for day arthropod in sunny weather', () => {
    const arthropod = createMockArthropod(['forest'], 'day')
    const env: Environment = { terrain: 'desert', timeOfDay: 'day', weather: 'sunny' }

    expect(getWeatherBonus(arthropod, env)).toBe(1.15)
  })

  it('returns penalty for night arthropod in sunny weather', () => {
    const arthropod = createMockArthropod(['forest'], 'night')
    const env: Environment = { terrain: 'desert', timeOfDay: 'day', weather: 'sunny' }

    expect(getWeatherBonus(arthropod, env)).toBe(0.9)
  })

  it('returns bonus for desert arthropod in sandstorm', () => {
    const arthropod = createMockArthropod(['desert'], 'night')
    const env: Environment = { terrain: 'desert', timeOfDay: 'night', weather: 'sandstorm' }

    expect(getWeatherBonus(arthropod, env)).toBe(1.1)
  })

  it('returns penalty for non-desert arthropod in sandstorm', () => {
    const arthropod = createMockArthropod(['forest'], 'night')
    const env: Environment = { terrain: 'desert', timeOfDay: 'night', weather: 'sandstorm' }

    expect(getWeatherBonus(arthropod, env)).toBe(0.9)
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

  it('getRandomWeatherForTerrain returns valid weather for terrain', () => {
    for (const terrain of TERRAINS) {
      for (let i = 0; i < 10; i++) {
        const weather = getRandomWeatherForTerrain(terrain)
        expect(TERRAIN_WEATHERS[terrain]).toContain(weather)
      }
    }
  })

  it('getRandomEnvironment returns valid environment with matching weather', () => {
    for (let i = 0; i < 20; i++) {
      const env = getRandomEnvironment()
      expect(TERRAINS).toContain(env.terrain)
      expect(TIMES_OF_DAY).toContain(env.timeOfDay)
      expect(WEATHERS).toContain(env.weather)
      expect(TERRAIN_WEATHERS[env.terrain]).toContain(env.weather)
    }
  })
})

describe('formatEnvironment', () => {
  it('formats environment with weather correctly', () => {
    expect(formatEnvironment({ terrain: 'forest', timeOfDay: 'day', weather: 'clear' })).toBe(
      '숲 / 낮 / 맑음'
    )
    expect(formatEnvironment({ terrain: 'desert', timeOfDay: 'night', weather: 'sandstorm' })).toBe(
      '사막 / 밤 / 모래폭풍'
    )
    expect(formatEnvironment({ terrain: 'wetland', timeOfDay: 'day', weather: 'rain' })).toBe(
      '습지 / 낮 / 비'
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

describe('weatherNames', () => {
  it('has all weathers', () => {
    expect(weatherNames.clear).toBe('맑음')
    expect(weatherNames.rain).toBe('비')
    expect(weatherNames.sunny).toBe('쾌청')
    expect(weatherNames.sandstorm).toBe('모래폭풍')
  })
})
