import type { StatusCondition } from './arthropod'

export type ActionCategory = 'attack' | 'defense' | 'special'

/** 격자 로그라이크에서의 타게팅 방식. 1:1 배틀은 무시(항상 상대). */
export type ActionTargeting = 'self' | 'melee' | 'ranged'

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
  cooldown: number
  effect?: ActionEffect
  description: string
  /** 격자 사거리(칸). 미지정 시 타게팅에서 유도(self:0, melee:1, ranged:4). */
  range?: number
  /** 격자 타게팅. 미지정 시 효과/위력에서 유도. */
  targeting?: ActionTargeting
}
