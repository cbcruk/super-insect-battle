import React from 'react'
import { useNavigate } from 'react-router'
import { ComparisonTable } from '../components/ui/comparison-table.tsx'
import { useGameStore } from '../stores/game-store.ts'
import { Button } from '../components/ui/button.tsx'
import { FighterPicker } from '../components/battle-setup/fighter-picker.tsx'
import { ModeToggle } from '../components/battle-setup/mode-toggle.tsx'

export function BattleSetupPage(): React.ReactNode {
  const navigate = useNavigate()
  const selectedPlayer = useGameStore((s) => s.selectedPlayer)
  const selectedOpponent = useGameStore((s) => s.selectedOpponent)
  const setPlayer = useGameStore((s) => s.setPlayer)
  const setOpponent = useGameStore((s) => s.setOpponent)
  const battleMode = useGameStore((s) => s.battleMode)
  const setBattleMode = useGameStore((s) => s.setBattleMode)

  const canStart = selectedPlayer != null && selectedOpponent != null

  function handleStart(): void {
    if (!canStart) return
    navigate('/battle')
  }

  return (
    <div className="max-w-2xl space-y-6 p-6">
      <ModeToggle mode={battleMode} onChange={setBattleMode} />

      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        <FighterPicker
          label={battleMode === 'ai-vs-ai' ? '1P' : 'Player'}
          selected={selectedPlayer}
          onSelect={setPlayer}
          color="text-cyan-400"
        />

        <div className="flex items-center justify-center text-2xl font-bold text-muted-foreground/50">
          VS
        </div>

        <FighterPicker
          label={battleMode === 'ai-vs-ai' ? '2P' : 'Opponent'}
          selected={selectedOpponent}
          onSelect={setOpponent}
          color="text-pink-400"
        />
      </div>

      {selectedPlayer && selectedOpponent && (
        <ComparisonTable player={selectedPlayer} opponent={selectedOpponent} />
      )}

      <div className="flex flex-col items-start gap-4 pt-2">
        <Button
          onClick={handleStart}
          disabled={!canStart}
          size="lg"
          className="btn-battle rounded-xl px-10 py-3 text-lg font-black"
        >
          START BATTLE
        </Button>
      </div>
    </div>
  )
}
