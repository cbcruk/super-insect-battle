import type { StatusCondition } from './arthropod'

export type ActionCategory = 'attack' | 'defense' | 'special'

export interface ActionEffect {
  type: 'damage' | 'status' | 'buff' | 'debuff'
  target: 'self' | 'opponent'
  condition?: StatusCondition
  statChange?: {
    stat: 'strength' | 'defense' | 'evasion'
    stages: number
  }
}

export interface Action {
  id: string
  name: string
  nameKo: string
  category: ActionCategory
  power: number
  accuracy: number
  priority: number
  effect?: ActionEffect
  description: string
}
