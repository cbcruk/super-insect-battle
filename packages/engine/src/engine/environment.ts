import type { Arthropod } from '../types/arthropod'
import type { Environment, Terrain, TimeOfDay } from '../types/environment'
import { TERRAINS, TIMES_OF_DAY } from '../types/environment'

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

export function getRandomEnvironment(): Environment {
  return {
    terrain: getRandomTerrain(),
    timeOfDay: getRandomTimeOfDay(),
  }
}

export function formatEnvironment(environment: Environment): string {
  return `${terrainNames[environment.terrain]} / ${timeOfDayNames[environment.timeOfDay]}`
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
