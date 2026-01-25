import type { Arthropod } from '../types/arthropod'
import type { Environment, Terrain, TimeOfDay, Weather } from '../types/environment'
import { TERRAINS, TIMES_OF_DAY, TERRAIN_WEATHERS } from '../types/environment'

export const terrainNames: Record<Terrain, string> = {
  forest: '숲',
  desert: '사막',
  wetland: '습지',
  cave: '동굴',
}

export const timeOfDayNames: Record<TimeOfDay, string> = {
  day: '낮',
  night: '밤',
}

export const weatherNames: Record<Weather, string> = {
  clear: '맑음',
  rain: '비',
  sunny: '쾌청',
  sandstorm: '모래폭풍',
}

export function getWeatherBonus(
  arthropod: Arthropod,
  environment: Environment
): number {
  const { weather } = environment

  if (weather === 'clear') {
    return 1.0
  }

  if (weather === 'rain') {
    if (arthropod.habitat.preferredTerrains.includes('wetland')) {
      return 1.1
    }
    return 0.95
  }

  if (weather === 'sunny') {
    if (arthropod.habitat.preferredTime === 'day') {
      return 1.15
    }
    if (arthropod.habitat.preferredTime === 'night') {
      return 0.9
    }
    return 1.0
  }

  if (weather === 'sandstorm') {
    if (arthropod.habitat.preferredTerrains.includes('desert')) {
      return 1.1
    }
    return 0.9
  }

  return 1.0
}

export function getEnvironmentBonus(
  arthropod: Arthropod,
  environment: Environment
): number {
  let bonus = 1.0

  if (arthropod.habitat.preferredTerrains.includes(environment.terrain)) {
    bonus *= 1.15
  }

  if (
    arthropod.habitat.preferredTime === environment.timeOfDay ||
    arthropod.habitat.preferredTime === 'both'
  ) {
    bonus *= 1.1
  } else {
    bonus *= 0.9
  }

  bonus *= getWeatherBonus(arthropod, environment)

  return bonus
}

export function getRandomTerrain(): Terrain {
  const index = Math.floor(Math.random() * TERRAINS.length)
  return TERRAINS[index]
}

export function getRandomTimeOfDay(): TimeOfDay {
  const index = Math.floor(Math.random() * TIMES_OF_DAY.length)
  return TIMES_OF_DAY[index]
}

export function getRandomWeatherForTerrain(terrain: Terrain): Weather {
  const possibleWeathers = TERRAIN_WEATHERS[terrain]
  const index = Math.floor(Math.random() * possibleWeathers.length)
  return possibleWeathers[index]
}

export function getRandomEnvironment(): Environment {
  const terrain = getRandomTerrain()
  return {
    terrain,
    timeOfDay: getRandomTimeOfDay(),
    weather: getRandomWeatherForTerrain(terrain),
  }
}

export function formatEnvironment(environment: Environment): string {
  return `${terrainNames[environment.terrain]} / ${timeOfDayNames[environment.timeOfDay]} / ${weatherNames[environment.weather]}`
}

export function formatEnvironmentBonus(bonus: number): string {
  if (bonus > 1) {
    const percent = Math.round((bonus - 1) * 100)
    return `+${percent}%`
  } else if (bonus < 1) {
    const percent = Math.round((1 - bonus) * 100)
    return `-${percent}%`
  }
  return '±0%'
}
