import type { ThreatLevel } from '@super-insect-battle/roguelike'

export interface ThreatColorSet {
  hex: string
  text: string
  badge: string
}

/** 위협 단계별 색. 맵 글리프(hex)와 HUD 배지(Tailwind)가 같은 의미를 공유한다. */
export const THREAT_COLORS: Record<ThreatLevel, ThreatColorSet> = {
  low: {
    hex: '#a3b1c2',
    text: 'text-slate-300',
    badge: 'bg-slate-500/20 text-slate-300',
  },
  moderate: {
    hex: '#facc15',
    text: 'text-yellow-300',
    badge: 'bg-yellow-500/15 text-yellow-300',
  },
  high: {
    hex: '#fb923c',
    text: 'text-orange-400',
    badge: 'bg-orange-500/20 text-orange-400',
  },
  deadly: {
    hex: '#ef4444',
    text: 'text-red-400',
    badge: 'bg-red-500/25 text-red-300',
  },
}
