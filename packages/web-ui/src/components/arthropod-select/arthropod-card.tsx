import React from 'react'
import type { Arthropod } from '@super-insect-battle/engine'

const styleColors: Record<string, { bg: string; text: string; border: string }> = {
  grappler: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  striker: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  venomous: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  defensive: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
}

const selectionRing: Record<string, string> = {
  '1p': 'ring-2 ring-cyan-400',
  '2p': 'ring-2 ring-pink-400',
}

const selectionBadge: Record<string, { text: string; className: string }> = {
  '1p': { text: '1P', className: 'bg-cyan-500 text-black' },
  '2p': { text: '2P', className: 'bg-pink-500 text-black' },
}

interface ArthropodCardProps {
  arthropod: Arthropod
  selectedAs?: '1p' | '2p' | null
  onClick: () => void
}

export function ArthropodCard({
  arthropod,
  selectedAs = null,
  onClick,
}: ArthropodCardProps): React.ReactNode {
  const style = styleColors[arthropod.behavior.style] ?? styleColors.grappler
  const ring = selectedAs ? selectionRing[selectedAs] : ''
  const badge = selectedAs ? selectionBadge[selectedAs] : null

  return (
    <button
      onClick={onClick}
      className={`relative rounded-lg border p-3 text-left transition-all hover:scale-[1.02] ${style.bg} ${style.border} ${ring}`}
    >
      {badge && (
        <span className={`absolute -right-1 -top-1 rounded px-1.5 py-0.5 text-[10px] font-black ${badge.className}`}>
          {badge.text}
        </span>
      )}
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
