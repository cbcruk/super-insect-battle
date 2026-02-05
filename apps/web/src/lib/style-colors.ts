import type { BehaviorStyle } from '@super-insect-battle/engine'

export interface StyleColorSet {
  bg: string
  text: string
  border: string
  badge: string
  hex: string
}

export const STYLE_COLORS: Record<BehaviorStyle, StyleColorSet> = {
  grappler: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
    badge: 'bg-red-500/20 text-red-400',
    hex: '#DC2626',
  },
  striker: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-400',
    hex: '#059669',
  },
  venomous: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    badge: 'bg-purple-500/20 text-purple-400',
    hex: '#9333EA',
  },
  defensive: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-400',
    hex: '#2563EB',
  },
}

export const WEAPON_TYPE_NAMES: Record<string, string> = {
  horn: 'Horn',
  mandible: 'Mandible',
  stinger: 'Stinger',
  fang: 'Fang',
  foreleg: 'Foreleg',
  leg: 'Leg',
}
