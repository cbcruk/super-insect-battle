export type Terrain = 'forest' | 'desert' | 'wetland' | 'cave'
export type TimeOfDay = 'day' | 'night'

export interface Environment {
  terrain: Terrain
  timeOfDay: TimeOfDay
}

export interface HabitatPreference {
  preferredTerrains: Terrain[]
  preferredTime: 'day' | 'night' | 'both'
}

export const TERRAINS: Terrain[] = ['forest', 'desert', 'wetland', 'cave']
export const TIMES_OF_DAY: TimeOfDay[] = ['day', 'night']
