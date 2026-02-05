import React from 'react'
import type { Arthropod } from '@super-insect-battle/engine'
import { arthropodList } from '@super-insect-battle/engine'
import { ArthropodCard } from './arthropod-card.tsx'

interface ArthropodSelectProps {
  selectedPlayer: Arthropod | null
  selectedOpponent: Arthropod | null
  onSelect: (arthropod: Arthropod) => void
}

export function ArthropodSelect({
  selectedPlayer,
  selectedOpponent,
  onSelect,
}: ArthropodSelectProps): React.ReactNode {
  function getSelectedAs(arthropod: Arthropod): '1p' | '2p' | null {
    if (selectedPlayer?.id === arthropod.id) return '1p'
    if (selectedOpponent?.id === arthropod.id) return '2p'
    return null
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
      {arthropodList.map((a) => (
        <ArthropodCard
          key={a.id}
          arthropod={a}
          selectedAs={getSelectedAs(a)}
          onClick={() => onSelect(a)}
        />
      ))}
    </div>
  )
}
