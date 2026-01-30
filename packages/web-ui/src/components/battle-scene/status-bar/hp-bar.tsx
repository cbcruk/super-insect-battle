import React from 'react'

interface HpBarProps {
  current: number
  max: number
}

function getHpColor(ratio: number): string {
  if (ratio > 0.5) return 'bg-green-500'
  if (ratio > 0.25) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function HpBar({ current, max }: HpBarProps): React.ReactNode {
  const ratio = max > 0 ? Math.max(0, current) / max : 0
  const percent = Math.round(ratio * 100)

  return (
    <div className="flex items-center gap-2">
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-700">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getHpColor(ratio)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="min-w-[4rem] text-right text-xs font-mono text-gray-300">
        {current}/{max}
      </span>
    </div>
  )
}
