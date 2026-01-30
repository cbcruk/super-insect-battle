import React from 'react'
import type { Arthropod } from '@super-insect-battle/engine'

const styleColors: Record<string, { bg: string; text: string; border: string }> = {
  grappler: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  striker: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  venomous: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  defensive: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
}

interface ArthropodCardProps {
  arthropod: Arthropod
  selected?: boolean
  onClick: () => void
}

export function ArthropodCard({
  arthropod,
  selected = false,
  onClick,
}: ArthropodCardProps): React.ReactNode {
  const style = styleColors[arthropod.behavior.style] ?? styleColors.grappler

  return (
    <button
      onClick={onClick}
      className={`rounded-lg border p-3 text-left transition-all hover:scale-[1.02] ${style.bg} ${style.border} ${
        selected ? 'ring-2 ring-amber-400' : ''
      }`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-200">
          {arthropod.nameKo}
        </span>
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${style.text} ${style.bg}`}>
          {arthropod.behavior.style}
        </span>
      </div>
      <p className="text-xs text-gray-500">{arthropod.name}</p>
      <div className="mt-2 flex gap-3 text-[10px] text-gray-400">
        <span>STR {arthropod.physical.strengthIndex}</span>
        <span>ARM {arthropod.defense.armorRating}</span>
        <span>EVA {arthropod.defense.evasion}</span>
      </div>
    </button>
  )
}
