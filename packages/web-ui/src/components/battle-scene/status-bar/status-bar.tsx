import React from 'react'
import type { BattleArthropod } from '@super-insect-battle/engine'
import { HpBar } from './hp-bar.tsx'
import { StatBadge } from './stat-badge.tsx'
import { StatusBadge } from './status-badge.tsx'

interface StatusBarProps {
  arthropod: BattleArthropod
  displayedHp: number
  side: 'player' | 'opponent'
}

export function StatusBar({
  arthropod,
  displayedHp,
  side,
}: StatusBarProps): React.ReactNode {
  const isPlayer = side === 'player'

  return (
    <div
      className={`rounded-lg bg-gray-900/80 p-3 backdrop-blur-sm ${
        isPlayer ? 'border-l-2 border-cyan-500' : 'border-r-2 border-pink-500'
      }`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span
          className={`text-sm font-bold ${
            isPlayer ? 'text-cyan-300' : 'text-pink-300'
          }`}
        >
          {arthropod.base.nameKo}
        </span>
        <div className="flex gap-1">
          <StatBadge statStages={arthropod.statStages} />
          <StatusBadge
            condition={arthropod.statusCondition}
            battleMode={arthropod.battleMode}
          />
        </div>
      </div>
      <HpBar current={displayedHp} max={arthropod.maxHp} />
    </div>
  )
}
