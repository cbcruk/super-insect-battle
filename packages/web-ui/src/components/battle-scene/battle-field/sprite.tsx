import React from 'react'
import type { Arthropod } from '@super-insect-battle/engine'

const styleColors: Record<string, string> = {
  grappler: '#DC2626',
  striker: '#059669',
  venomous: '#9333EA',
  defensive: '#2563EB',
}

interface SpriteProps {
  arthropod: Arthropod
  side: 'player' | 'opponent'
  fainted?: boolean
  className?: string
}

function getSpriteSize(lengthMm: number): number {
  const minSize = 64
  const maxSize = 128
  const minLength = 30
  const maxLength = 200
  const ratio = (lengthMm - minLength) / (maxLength - minLength)
  return Math.round(minSize + Math.max(0, Math.min(1, ratio)) * (maxSize - minSize))
}

export function Sprite({
  arthropod,
  side,
  fainted = false,
  className = '',
}: SpriteProps): React.ReactNode {
  const color = styleColors[arthropod.behavior.style] ?? '#6B7280'
  const size = getSpriteSize(arthropod.physical.lengthMm)
  const isPlayer = side === 'player'

  return (
    <div
      className={`flex flex-col items-center transition-all duration-300 ${
        fainted ? 'translate-y-4 opacity-0' : ''
      } ${className}`}
    >
      <div
        className="flex items-center justify-center rounded-full border-2 border-white/20 shadow-lg"
        style={{
          width: size,
          height: size,
          backgroundColor: `${color}20`,
          borderColor: `${color}60`,
        }}
      >
        <span
          className="text-center text-xs font-bold leading-tight"
          style={{ color, fontSize: Math.max(10, size / 7) }}
        >
          {arthropod.nameKo}
        </span>
      </div>
      <span
        className={`mt-1 text-xs font-medium ${
          isPlayer ? 'text-cyan-300' : 'text-pink-300'
        }`}
      >
        {arthropod.name}
      </span>
    </div>
  )
}
