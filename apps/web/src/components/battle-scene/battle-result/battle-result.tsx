import React from 'react'
import type { Arthropod } from '@super-insect-battle/engine'
import { Button } from '../../ui/button.tsx'

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
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="rounded-lg border border-white/10 bg-card p-8 text-center shadow-2xl">
        {winner === 'draw' ? (
          <h2 className="mb-2 text-3xl font-medium tracking-tight text-gray-400">DRAW</h2>
        ) : (
          <>
            <h2 className="mb-2 text-3xl font-medium tracking-tight text-foreground">
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
            <Button
              variant="outline"
              onClick={onSaveReplay}
              disabled={replaySaved}
            >
              {replaySaved ? 'Saved' : 'Save Replay'}
            </Button>
          )}
          {onDownloadReplay && (
            <Button variant="outline" onClick={onDownloadReplay}>
              Download
            </Button>
          )}
          <Button onClick={onClose}>
            Return
          </Button>
        </div>
      </div>
    </div>
  )
}
