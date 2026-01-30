import React from 'react'
import type { StatusCondition, BattleMode } from '@super-insect-battle/engine'

const conditionStyles: Record<StatusCondition, { label: string; color: string }> = {
  poison: { label: 'PSN', color: 'bg-purple-500/20 text-purple-400' },
  burn: { label: 'BRN', color: 'bg-red-500/20 text-red-400' },
  paralysis: { label: 'PAR', color: 'bg-yellow-500/20 text-yellow-400' },
  confusion: { label: 'CNF', color: 'bg-pink-500/20 text-pink-400' },
  sleep: { label: 'SLP', color: 'bg-blue-500/20 text-blue-400' },
  bind: { label: 'BND', color: 'bg-amber-500/20 text-amber-400' },
}

const modeStyles: Record<BattleMode, { label: string; color: string }> = {
  flee: { label: 'FLEE', color: 'bg-sky-500/20 text-sky-400' },
  brace: { label: 'BRACE', color: 'bg-emerald-500/20 text-emerald-400' },
}

interface StatusBadgeProps {
  condition: StatusCondition | null
  battleMode: BattleMode | null
}

export function StatusBadge({
  condition,
  battleMode,
}: StatusBadgeProps): React.ReactNode {
  if (!condition && !battleMode) return null

  return (
    <div className="flex gap-1">
      {condition && (
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${conditionStyles[condition].color}`}
        >
          {conditionStyles[condition].label}
        </span>
      )}
      {battleMode && (
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${modeStyles[battleMode].color}`}
        >
          {modeStyles[battleMode].label}
        </span>
      )}
    </div>
  )
}
