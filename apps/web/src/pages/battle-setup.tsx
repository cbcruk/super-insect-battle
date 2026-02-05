import React, { useCallback } from 'react'
import { useNavigate } from 'react-router'
import type { Arthropod } from '@super-insect-battle/engine'
import type { BattleMode } from '../stores/game-store.types.ts'
import { ArthropodSelect } from '../components/arthropod-select/arthropod-select.tsx'
import { ComparisonTable } from '../components/ui/comparison-table.tsx'
import { useGameStore } from '../stores/game-store.ts'
import { Button } from '../components/ui/button.tsx'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs.tsx'
import { STYLE_COLORS } from '../lib/style-colors.ts'
import { cn } from '../lib/utils.ts'

type SelectPhase = '1p' | '2p'

export function BattleSetupPage(): React.ReactNode {
  const navigate = useNavigate()
  const selectedPlayer = useGameStore((s) => s.selectedPlayer)
  const selectedOpponent = useGameStore((s) => s.selectedOpponent)
  const setPlayer = useGameStore((s) => s.setPlayer)
  const setOpponent = useGameStore((s) => s.setOpponent)
  const battleMode = useGameStore((s) => s.battleMode)
  const setBattleMode = useGameStore((s) => s.setBattleMode)

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
          <h1 className="text-xl text-foreground sm:text-2xl">
            Matchup Creator
          </h1>
          <p className="mt-1 text-sm font-bold">
            {phase === '1p' ? (
              <span className="text-cyan-400">1P SELECT</span>
            ) : canStart ? (
              <span className="text-primary">READY!</span>
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

      {selectedPlayer && selectedOpponent && (
        <ComparisonTable
          player={selectedPlayer}
          opponent={selectedOpponent}
        />
      )}

      <div className="flex flex-col items-center gap-3 pt-2">
        <ModeToggle mode={battleMode} onChange={setBattleMode} />
        <Button
          onClick={handleStart}
          disabled={!canStart}
          size="lg"
          className="rounded-xl px-10 py-3 text-lg font-black"
        >
          START BATTLE
        </Button>
      </div>
    </div>
  )
}

interface PortraitSlotProps {
  side: '1p' | '2p'
  arthropod: Arthropod | null
  active: boolean
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: BattleMode
  onChange: (mode: BattleMode) => void
}): React.ReactNode {
  return (
    <Tabs value={mode} onValueChange={(v) => onChange(v as BattleMode)}>
      <TabsList>
        <TabsTrigger value="player-vs-ai">Player vs AI</TabsTrigger>
        <TabsTrigger value="ai-vs-ai">AI vs AI</TabsTrigger>
      </TabsList>
    </Tabs>
  )
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
      className={cn(
        'flex w-40 flex-col items-center rounded-md border bg-table-row-even p-4 transition-colors',
        active ? borderColor : 'border-table-border'
      )}
    >
      <span className={cn('mb-2 text-xs font-semibold', textColor)}>{label}</span>
      {arthropod ? (
        <>
          <span className="text-lg font-semibold text-foreground">
            {arthropod.nameKo}
          </span>
          <span className="text-xs text-muted-foreground">{arthropod.name}</span>
          <span
            className={cn(
              'mt-1 rounded px-1.5 py-0.5 text-[10px] font-bold',
              STYLE_COLORS[arthropod.behavior.style].badge
            )}
          >
            {arthropod.behavior.style}
          </span>
        </>
      ) : (
        <span className="text-sm text-muted-foreground/50">---</span>
      )}
    </div>
  )
}
