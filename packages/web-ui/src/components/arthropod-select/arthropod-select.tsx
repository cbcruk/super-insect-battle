import React from 'react'
import type { Arthropod } from '@super-insect-battle/engine'
import { arthropodList } from '@super-insect-battle/engine'
import { ArthropodCard } from './arthropod-card.tsx'

interface ArthropodSelectProps {
  selected: Arthropod | null
  onSelect: (arthropod: Arthropod) => void
  label: string
}

export function ArthropodSelect({
  selected,
  onSelect,
  label,
}: ArthropodSelectProps): React.ReactNode {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold text-gray-400">{label}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {arthropodList.map((a) => (
          <ArthropodCard
            key={a.id}
            arthropod={a}
            selected={selected?.id === a.id}
            onClick={() => onSelect(a)}
          />
        ))}
      </div>
    </div>
  )
}
