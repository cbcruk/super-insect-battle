import type { WeaponType } from '@super-insect-battle/engine'

export interface InsectBodyProps {
  weaponType: WeaponType
  lengthMm: number
  weightG: number
  color: string
  side: 'player' | 'opponent'
}

export interface BodyPartProps {
  scale: number
  thickness: number
  color: string
  darkColor: string
  side: 'player' | 'opponent'
}

export function getBodyScale(lengthMm: number): number {
  const minLength = 15
  const maxLength = 280
  const minScale = 0.5
  const maxScale = 2.0
  const ratio = (lengthMm - minLength) / (maxLength - minLength)
  return minScale + Math.max(0, Math.min(1, ratio)) * (maxScale - minScale)
}

export function getBodyThickness(weightG: number): number {
  const minWeight = 0.5
  const maxWeight = 120
  const minThickness = 0.6
  const maxThickness = 1.4
  const ratio = (weightG - minWeight) / (maxWeight - minWeight)
  return minThickness + Math.max(0, Math.min(1, ratio)) * (maxThickness - minThickness)
}

export function getDarkColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const darken = 0.6
  return `#${Math.round(r * darken).toString(16).padStart(2, '0')}${Math.round(g * darken).toString(16).padStart(2, '0')}${Math.round(b * darken).toString(16).padStart(2, '0')}`
}
