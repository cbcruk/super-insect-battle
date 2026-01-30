import React from 'react'
import { useNavigate } from 'react-router'
import {
  ArthropodSelect,
  useGameStore,
} from '@super-insect-battle/web-ui'

export function BattleSetupPage(): React.ReactNode {
  const navigate = useNavigate()
  const selectedPlayer = useGameStore((s) => s.selectedPlayer)
  const selectedOpponent = useGameStore((s) => s.selectedOpponent)
  const setPlayer = useGameStore((s) => s.setPlayer)
  const setOpponent = useGameStore((s) => s.setOpponent)

  const canStart = selectedPlayer != null && selectedOpponent != null

  function handleStart(): void {
    if (!canStart) return
    navigate('/battle')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-black text-amber-400">Battle Setup</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select two arthropods for AI vs AI battle
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-cyan-500/30 bg-gray-900/60 p-4">
          <ArthropodSelect
            selected={selectedPlayer}
            onSelect={setPlayer}
            label="PLAYER (Left)"
          />
        </div>
        <div className="rounded-xl border border-pink-500/30 bg-gray-900/60 p-4">
          <ArthropodSelect
            selected={selectedOpponent}
            onSelect={setOpponent}
            label="OPPONENT (Right)"
          />
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={handleStart}
          disabled={!canStart}
          className={`rounded-xl px-10 py-3 text-lg font-black transition-all ${
            canStart
              ? 'bg-amber-500 text-black hover:bg-amber-400 hover:scale-105'
              : 'cursor-not-allowed bg-gray-700 text-gray-500'
          }`}
        >
          Start Battle
        </button>
      </div>

      {canStart && (
        <div className="text-center text-sm text-gray-500">
          <span className="text-cyan-400">{selectedPlayer.nameKo}</span>
          {' vs '}
          <span className="text-pink-400">{selectedOpponent.nameKo}</span>
        </div>
      )}
    </div>
  )
}
