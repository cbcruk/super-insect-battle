import React from 'react'
import type { StatStages } from '@super-insect-battle/engine'
import { cn } from '../../../lib/utils.ts'
import { Badge } from '../../ui/badge.tsx'

const statLabels: Record<keyof StatStages, string> = {
  strength: 'ATK',
  defense: 'DEF',
  evasion: 'EVA',
}

interface StatBadgeProps {
  statStages: StatStages
}

export function StatBadge({ statStages }: StatBadgeProps): React.ReactNode {
  const entries = (Object.entries(statStages) as [keyof StatStages, number][]).filter(
    ([, v]) => v !== 0
  )

  if (entries.length === 0) return null

  return (
    <div className="flex gap-1">
      {entries.map(([stat, value]) => (
        <Badge
          key={stat}
          variant="outline"
          className={cn(
            'rounded px-1.5 py-0.5 text-[10px] font-bold border-transparent',
            value > 0
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          )}
        >
          {statLabels[stat]}
          {value > 0 ? `+${value}` : value}
        </Badge>
      ))}
    </div>
  )
}
