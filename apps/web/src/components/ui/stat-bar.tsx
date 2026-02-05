import * as React from 'react'

import { cn } from '../../lib/utils'

interface StatBarProps {
  value: number
  max: number
  color?: string
  size?: 'sm' | 'md'
  showValue?: boolean
  className?: string
}

export function StatBar({
  value,
  max,
  color = 'bg-primary',
  size = 'sm',
  showValue = false,
  className,
}: StatBarProps): React.ReactElement {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex-1 rounded-full bg-stat-bar-track',
          size === 'sm' ? 'h-1.5' : 'h-2'
        )}
      >
        <div
          className={cn(color, 'h-full rounded-full transition-all')}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue && (
        <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
          {value}
        </span>
      )}
    </div>
  )
}
