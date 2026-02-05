import React from 'react'
import type { Arthropod } from '@super-insect-battle/engine'
import { cn } from '../../lib/utils.ts'
import { Badge } from '../ui/badge.tsx'
import { STYLE_COLORS } from '../../lib/style-colors.ts'

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
  const style = STYLE_COLORS[arthropod.behavior.style]
  const ring = selectedAs ? selectionRing[selectedAs] : ''
  const badge = selectedAs ? selectionBadge[selectedAs] : null

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-lg border p-3 text-left transition-colors',
        style.bg,
        style.border,
        ring
      )}
    >
      {badge && (
        <Badge className={cn('absolute -right-1 -top-1 rounded px-1.5 py-0.5 text-[10px] font-black', badge.className)}>
          {badge.text}
        </Badge>
      )}
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-200">
          {arthropod.nameKo}
        </span>
        <Badge variant="outline" className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold border-transparent', style.text, style.bg)}>
          {arthropod.behavior.style}
        </Badge>
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
