import React, { useCallback } from 'react'
import { useNavigate } from 'react-router'
import type { Arthropod } from '@super-insect-battle/engine'
import {
  ArthropodSelect,
  useGameStore,
} from '@super-insect-battle/web-ui'

type SelectPhase = '1p' | '2p'

export function BattleSetupPage(): React.ReactNode {
  const navigate = useNavigate()
  const selectedPlayer = useGameStore((s) => s.selectedPlayer)
  const selectedOpponent = useGameStore((s) => s.selectedOpponent)
  const setPlayer = useGameStore((s) => s.setPlayer)
  const setOpponent = useGameStore((s) => s.setOpponent)

  const phase: SelectPhase = selectedPlayer == null ? '1p' : '2p'
  const canStart = selectedPlayer != null && selectedOpponent != null

  const handleSelect = useCallback(
    (arthropod: Arthropod): void => {
      if (selectedPlayer?.id === arthropod.id) {
        setPlayer(null)
        setOpponent(null)
        return
      }
      if (selectedOpponent?.id === arthropod.id) {
        setOpponent(null)
        return
      }

      if (phase === '1p') {
        setPlayer(arthropod)
      } else {
        setOpponent(arthropod)
      }
    },
    [phase, selectedPlayer, selectedOpponent, setPlayer, setOpponent],
  )

  function handleStart(): void {
    if (!canStart) return
    navigate('/battle')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      <div className="flex items-center justify-between">
        <PortraitSlot
          side="1p"
          arthropod={selectedPlayer}
          active={phase === '1p'}
        />

        <div className="text-center">
          <h1 className="text-2xl font-black text-amber-400">
            SELECT YOUR FIGHTER
          </h1>
          <p className="mt-1 text-sm font-bold">
            {phase === '1p' ? (
              <span className="text-cyan-400">1P SELECT</span>
            ) : canStart ? (
              <span className="text-amber-400">READY!</span>
            ) : (
              <span className="text-pink-400">2P SELECT</span>
            )}
          </p>
        </div>

        <PortraitSlot
          side="2p"
          arthropod={selectedOpponent}
          active={phase === '2p' && !canStart}
        />
      </div>

      <ArthropodSelect
        selectedPlayer={selectedPlayer}
        selectedOpponent={selectedOpponent}
        onSelect={handleSelect}
      />

      <div className="flex justify-center pt-2">
        <button
          onClick={handleStart}
          disabled={!canStart}
          className={`rounded-xl px-10 py-3 text-lg font-black transition-all ${
            canStart
              ? 'bg-amber-500 text-black hover:bg-amber-400 hover:scale-105'
              : 'cursor-not-allowed bg-gray-700 text-gray-500'
          }`}
        >
          START BATTLE
        </button>
      </div>
    </div>
  )
}

interface PortraitSlotProps {
  side: '1p' | '2p'
  arthropod: Arthropod | null
  active: boolean
}

function PortraitSlot({
  side,
  arthropod,
  active,
}: PortraitSlotProps): React.ReactNode {
  const is1p = side === '1p'
  const borderColor = is1p ? 'border-cyan-500' : 'border-pink-500'
  const textColor = is1p ? 'text-cyan-400' : 'text-pink-400'
  const label = is1p ? '1P' : '2P'

  return (
    <div
      className={`flex w-40 flex-col items-center rounded-xl border-2 bg-gray-900/60 p-4 transition-all ${
        active ? `${borderColor} scale-105` : 'border-gray-700'
      }`}
    >
      <span className={`mb-2 text-xs font-black ${textColor}`}>{label}</span>
      {arthropod ? (
        <>
          <span className="text-lg font-black text-gray-200">
            {arthropod.nameKo}
          </span>
          <span className="text-xs text-gray-500">{arthropod.name}</span>
        </>
      ) : (
        <span className="text-sm text-gray-600">---</span>
      )}
    </div>
  )
}
