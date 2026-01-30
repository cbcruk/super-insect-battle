import React, { useEffect, useRef } from 'react'
import type { BattleLogEntry } from '@super-insect-battle/engine'
import { LogEntry } from './log-entry.tsx'

interface BattleLogProps {
  entries: BattleLogEntry[]
  playerName: string
  opponentName: string
}

export function BattleLog({
  entries,
  playerName,
  opponentName,
}: BattleLogProps): React.ReactNode {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries.length])

  let lastTurn = 0

  return (
    <div className="flex h-full flex-col rounded-lg bg-gray-900/80 backdrop-blur-sm">
      <div className="border-b border-gray-700 px-4 py-2">
        <h3 className="text-sm font-bold text-gray-400">Battle Log</h3>
        <p className="text-xs text-gray-500">
          <span className="text-cyan-400">{playerName}</span>
          {' vs '}
          <span className="text-pink-400">{opponentName}</span>
        </p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2">
        {entries.map((entry, i) => {
          const showTurnHeader = entry.turn !== lastTurn
          lastTurn = entry.turn
          return (
            <React.Fragment key={i}>
              {showTurnHeader && (
                <div className="my-2 flex items-center gap-2">
                  <div className="flex-1 border-t border-gray-700" />
                  <span className="text-xs font-bold text-amber-400">
                    Turn {entry.turn}
                  </span>
                  <div className="flex-1 border-t border-gray-700" />
                </div>
              )}
              <LogEntry entry={entry} />
            </React.Fragment>
          )
        })}
        {entries.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-600">
            Waiting for battle to start...
          </p>
        )}
      </div>
    </div>
  )
}
