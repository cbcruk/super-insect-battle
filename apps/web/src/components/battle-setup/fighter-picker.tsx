import React from 'react'
import { arthropodList } from '@super-insect-battle/engine'
import type { Terrain } from '@super-insect-battle/engine'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select.tsx'
import { cn } from '../../lib/utils.ts'
import { calculateTier } from '../../lib/tier.ts'
import type {
  FighterPickerProps,
  FighterColor,
} from './fighter-picker.types.ts'

const TERRAIN_LABEL: Record<Terrain, string> = {
  forest: '숲',
  desert: '사막',
  wetland: '습지',
  cave: '동굴',
}

const GLOW_COLORS: Record<FighterColor, string> = {
  'text-cyan-400':
    'hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:border-cyan-400/50',
  'text-pink-400':
    'hover:shadow-[0_0_20px_rgba(244,114,182,0.3)] hover:border-pink-400/50',
}

export function FighterPicker({
  label,
  selected,
  onSelect,
  color,
}: FighterPickerProps): React.ReactNode {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border-2 border-border transition-all duration-200',
        GLOW_COLORS[color]
      )}
    >
      <div className="bg-table-header px-3 py-2">
        <span
          className={cn(
            'text-[11px] font-semibold uppercase tracking-wider',
            color
          )}
        >
          {label}
        </span>
      </div>
      <div className="bg-table-row-even p-3">
        <Select
          value={selected?.id ?? ''}
          onValueChange={(v) => {
            const a = arthropodList.find((x) => x.id === v)
            onSelect(a ?? null)
          }}
        >
          <SelectTrigger className="h-9 w-full text-sm">
            <SelectValue placeholder="Select fighter..." />
          </SelectTrigger>
          <SelectContent>
            {arthropodList.map((a) => {
              const tier = calculateTier(a)
              return (
                <SelectItem key={a.id} value={a.id}>
                  <span className={cn('font-bold', tier.color)}>
                    {tier.tier}
                  </span>
                  {a.nameKo}
                  <span className="ml-auto text-muted-foreground text-xs">
                    {a.habitat.preferredTerrains
                      .map((t) => TERRAIN_LABEL[t])
                      .join('/')}
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
