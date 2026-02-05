import React from 'react'
import type { BattleLogEntry } from '@super-insect-battle/engine'

interface LogEntryProps {
  entry: BattleLogEntry
}

export function LogEntry({ entry }: LogEntryProps): React.ReactNode {
  const isPlayer = entry.actor === 'player'

  return (
    <div className="py-1">
      <div className="flex items-start gap-2 text-sm">
        <span className={isPlayer ? 'text-cyan-400' : 'text-pink-400'}>
          {isPlayer ? '▶' : '◀'}
        </span>
        <div className="flex-1">
          <span className="text-gray-200">{entry.action}</span>
          {entry.damage != null && entry.damage > 0 && (
            <span className={`ml-2 font-bold ${entry.critical ? 'text-yellow-400' : 'text-red-400'}`}>
              -{entry.damage}
              {entry.critical && ' CRITICAL!'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
