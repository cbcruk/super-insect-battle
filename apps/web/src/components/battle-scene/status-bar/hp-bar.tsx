import React from 'react'
import { cn } from '../../../lib/utils.ts'
import { Progress } from '../../ui/progress.tsx'

interface HpBarProps {
  current: number
  max: number
}

function getHpColor(ratio: number): string {
  if (ratio > 0.5) return '[&_[data-slot=progress-indicator]]:bg-green-500'
  if (ratio > 0.25) return '[&_[data-slot=progress-indicator]]:bg-yellow-500'
  return '[&_[data-slot=progress-indicator]]:bg-red-500'
}

export function HpBar({ current, max }: HpBarProps): React.ReactNode {
  const ratio = max > 0 ? Math.max(0, current) / max : 0
  const percent = Math.round(ratio * 100)

  return (
    <div className="flex items-center gap-2">
      <Progress
        value={percent}
        className={cn('h-3 flex-1 bg-gray-700', getHpColor(ratio))}
      />
      <span className="min-w-16 text-right text-xs font-mono text-gray-300">
        {current}/{max}
      </span>
    </div>
  )
}
