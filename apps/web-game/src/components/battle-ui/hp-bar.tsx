import React from 'react'

interface HpBarProps {
  name: string
  currentHp: number
  maxHp: number
  side: 'player' | 'opponent'
}

export function HpBar({ name, currentHp, maxHp, side }: HpBarProps): React.ReactNode {
  const percentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100))

  const getBarColor = (): string => {
    if (percentage > 50) return 'bg-green-500'
    if (percentage > 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div
      className={`absolute top-4 ${side === 'player' ? 'left-4' : 'right-4'} w-48`}
    >
      <div className="text-sm font-bold mb-1">{name}</div>
      <div className="w-full h-4 bg-gray-700 rounded overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getBarColor()}`}
          style={{
            width: `${percentage}%`,
            float: side === 'player' ? 'left' : 'right',
          }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">
        HP {currentHp}/{maxHp}
      </div>
    </div>
  )
}
