import type { HabitatPreference } from './environment'

export type WeaponType =
  | 'horn'
  | 'mandible'
  | 'stinger'
  | 'fang'
  | 'foreleg'
  | 'leg'

export type BehaviorStyle = 'grappler' | 'striker' | 'venomous' | 'defensive'

export interface PhysicalStats {
  weightG: number
  lengthMm: number
  strengthIndex: number
}

export interface WeaponStats {
  type: WeaponType
  power: number
  venomous: boolean
  venomPotency?: number
}

export interface BehaviorStats {
  aggression: number
  style: BehaviorStyle
}

export interface DefenseStats {
  armorRating: number
  evasion: number
}

export interface Arthropod {
  id: string
  name: string
  nameKo: string
  physical: PhysicalStats
  weapon: WeaponStats
  behavior: BehaviorStats
  defense: DefenseStats
  habitat: HabitatPreference
  actions: string[]
  description: string
}

export type StatusCondition = 'poison' | 'bind'

export type BattleMode = 'flee' | 'brace'

export type StatType = 'strength' | 'defense' | 'evasion'

export interface StatStages {
  strength: number
  defense: number
  evasion: number
}

export interface BattleArthropod {
  base: Arthropod
  currentHp: number
  maxHp: number
  statusCondition: StatusCondition | null
  bindTurns: number
  appliedVenomPotency: number
  battleMode: BattleMode | null
  modeTurns: number
  actions: string[]
  statStages: StatStages
}
