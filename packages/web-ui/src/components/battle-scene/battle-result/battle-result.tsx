import React from 'react'
import type { Arthropod } from '@super-insect-battle/engine'

interface BattleResultProps {
  winner: 'player' | 'opponent' | 'draw' | null
  player: Arthropod
  opponent: Arthropod
  totalTurns: number
  onClose: () => void
  onSaveReplay?: () => void
  onDownloadReplay?: () => void
  replaySaved?: boolean
}

export function BattleResult({
  winner,
  player,
  opponent,
  totalTurns,
  onClose,
  onSaveReplay,
  onDownloadReplay,
  replaySaved = false,
}: BattleResultProps): React.ReactNode {
  const winnerName =
    winner === 'player'
      ? player.nameKo
      : winner === 'opponent'
        ? opponent.nameKo
        : null

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-xl bg-gray-900 p-8 text-center shadow-2xl">
        {winner === 'draw' ? (
          <h2 className="mb-2 text-3xl font-black text-gray-400">DRAW</h2>
        ) : (
          <>
            <h2 className="mb-2 text-3xl font-black text-amber-400">
              {winnerName} WIN!
            </h2>
            <p className="text-gray-400">
              {winner === 'player' ? player.name : opponent.name} wins the battle
            </p>
          </>
        )}
        <p className="mt-2 text-sm text-gray-500">Total turns: {totalTurns}</p>
        <div className="mt-6 flex gap-3 justify-center">
          {onSaveReplay && (
            <button
              onClick={onSaveReplay}
              disabled={replaySaved}
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-bold text-gray-300 transition-colors hover:border-amber-500 hover:text-amber-400 disabled:opacity-40"
            >
              {replaySaved ? 'Saved' : 'Save Replay'}
            </button>
          )}
          {onDownloadReplay && (
            <button
              onClick={onDownloadReplay}
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-bold text-gray-300 transition-colors hover:border-amber-500 hover:text-amber-400"
            >
              Download
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg bg-amber-500 px-6 py-2 font-bold text-black transition-colors hover:bg-amber-400"
          >
            Return
          </button>
        </div>
      </div>
    </div>
  )
}
