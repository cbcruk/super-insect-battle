export type Terrain = 'forest' | 'desert' | 'wetland' | 'cave'
export type TimeOfDay = 'day' | 'night'
export type Weather = 'clear' | 'rain' | 'sunny' | 'sandstorm'

export interface Environment {
  terrain: Terrain
  timeOfDay: TimeOfDay
  weather: Weather
}

export interface HabitatPreference {
  preferredTerrains: Terrain[]
  preferredTime: 'day' | 'night' | 'both'
}

export const TERRAINS: Terrain[] = ['forest', 'desert', 'wetland', 'cave']
export const TIMES_OF_DAY: TimeOfDay[] = ['day', 'night']
export const WEATHERS: Weather[] = ['clear', 'rain', 'sunny', 'sandstorm']

export const TERRAIN_WEATHERS: Record<Terrain, Weather[]> = {
  forest: ['clear', 'rain'],
  desert: ['clear', 'sunny', 'sandstorm'],
  wetland: ['clear', 'rain'],
  cave: ['clear'],
}
