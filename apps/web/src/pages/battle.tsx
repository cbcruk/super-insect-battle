import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { simulateBattle } from '@super-insect-battle/engine'
import type { BattleState, BattleLogEntry, Action } from '@super-insect-battle/engine'
import {
  BattleScene,
  ActionPanel,
  useGameStore,
  useBattleStore,
} from '@super-insect-battle/web-ui'

const LOG_DELAY_MS = 600

export function BattlePage(): React.ReactNode {
  const navigate = useNavigate()
  const selectedPlayer = useGameStore((s) => s.selectedPlayer)
  const selectedOpponent = useGameStore((s) => s.selectedOpponent)
  const battleMode = useGameStore((s) => s.battleMode)
  const aiConfig = useGameStore((s) => s.aiConfig)

  useEffect(() => {
    if (!selectedPlayer || !selectedOpponent) {
      navigate('/battle/setup')
    }
  }, [selectedPlayer, selectedOpponent, navigate])

  if (!selectedPlayer || !selectedOpponent) return null

  if (battleMode === 'ai-vs-ai') {
    return (
      <AiVsAiBattle
        onClose={() => navigate('/battle/setup')}
      />
    )
  }

  return (
    <InteractiveBattle
      aiDifficulty={aiConfig.difficulty}
      aiPersonality={aiConfig.personality}
      onClose={() => navigate('/battle/setup')}
    />
  )
}

function AiVsAiBattle({
  onClose,
}: {
  onClose: () => void
}): React.ReactNode {
  const selectedPlayer = useGameStore((s) => s.selectedPlayer)!
  const selectedOpponent = useGameStore((s) => s.selectedOpponent)!

  const [battleState, setBattleState] = useState<BattleState | null>(null)
  const [displayedLogs, setDisplayedLogs] = useState<BattleLogEntry[]>([])
  const [displayedPlayerHp, setDisplayedPlayerHp] = useState(0)
  const [displayedOpponentHp, setDisplayedOpponentHp] = useState(0)
  const [replayDone, setReplayDone] = useState(false)
  const replayAbortRef = useRef(false)

  useEffect(() => {
    const result = simulateBattle(selectedPlayer, selectedOpponent)
    setBattleState(result)
    setDisplayedPlayerHp(result.player.maxHp)
    setDisplayedOpponentHp(result.opponent.maxHp)
    setDisplayedLogs([])
    setReplayDone(false)
    replayAbortRef.current = false

    replayLogs(result)

    return (): void => {
      replayAbortRef.current = true
    }
  }, [selectedPlayer, selectedOpponent])

  const replayLogs = useCallback(async (result: BattleState): Promise<void> => {
    for (let i = 0; i < result.log.length; i++) {
      if (replayAbortRef.current) return
      await new Promise<void>((resolve) => setTimeout(resolve, LOG_DELAY_MS))
      if (replayAbortRef.current) return

      const entry = result.log[i]
      setDisplayedLogs((prev) => [...prev, entry])

      if (entry.remainingHp) {
        setDisplayedPlayerHp(entry.remainingHp.player)
        setDisplayedOpponentHp(entry.remainingHp.opponent)
      }
    }
    setReplayDone(true)
  }, [])

  if (!battleState) return null

  const lastLog = displayedLogs[displayedLogs.length - 1]
  const currentTurn = lastLog?.turn ?? 1
  const winner = replayDone ? battleState.winner : null

  return (
    <div className="h-full">
      <BattleScene
        player={selectedPlayer}
        opponent={selectedOpponent}
        playerBattle={battleState.player}
        opponentBattle={battleState.opponent}
        environment={battleState.environment}
        displayedPlayerHp={displayedPlayerHp}
        displayedOpponentHp={displayedOpponentHp}
        displayedLogs={displayedLogs}
        turnNumber={currentTurn}
        winner={winner}
        finished={replayDone}
        onClose={onClose}
      />
    </div>
  )
}

function InteractiveBattle({
  aiDifficulty,
  aiPersonality,
  onClose,
}: {
  aiDifficulty: string
  aiPersonality: string
  onClose: () => void
}): React.ReactNode {
  const selectedPlayer = useGameStore((s) => s.selectedPlayer)!
  const selectedOpponent = useGameStore((s) => s.selectedOpponent)!

  const phase = useBattleStore((s) => s.phase)
  const battleState = useBattleStore((s) => s.battleState)
  const battleContext = useBattleStore((s) => s.battleContext)
  const startInteractiveBattle = useBattleStore((s) => s.startInteractiveBattle)
  const selectAction = useBattleStore((s) => s.selectAction)
  const reset = useBattleStore((s) => s.reset)

  const [displayedLogs, setDisplayedLogs] = useState<BattleLogEntry[]>([])
  const [displayedPlayerHp, setDisplayedPlayerHp] = useState(0)
  const [displayedOpponentHp, setDisplayedOpponentHp] = useState(0)
  const [animating, setAnimating] = useState(false)

  const prevLogLenRef = useRef(0)
  const hpInitializedRef = useRef(false)

  useEffect(() => {
    reset()
    hpInitializedRef.current = false
    prevLogLenRef.current = 0
    setDisplayedLogs([])
    setDisplayedPlayerHp(0)
    setDisplayedOpponentHp(0)

    startInteractiveBattle({
      player: selectedPlayer,
      opponent: selectedOpponent,
      aiDifficulty: aiDifficulty as 'easy' | 'medium' | 'hard',
      aiPersonality: aiPersonality as 'aggressive' | 'defensive' | 'balanced',
    })

    return (): void => {
      reset()
    }
  }, [selectedPlayer, selectedOpponent])

  useEffect(() => {
    if (!battleState) return
    if (!hpInitializedRef.current) {
      hpInitializedRef.current = true
      setDisplayedPlayerHp(battleState.player.maxHp)
      setDisplayedOpponentHp(battleState.opponent.maxHp)
    }
  }, [battleState])

  const logLen = battleState?.log.length ?? 0

  useEffect(() => {
    if (!battleState) return
    const newLogs = battleState.log.slice(prevLogLenRef.current)
    if (newLogs.length === 0) return

    prevLogLenRef.current = battleState.log.length
    setAnimating(true)

    let cancelled = false
    ;(async (): Promise<void> => {
      for (const entry of newLogs) {
        if (cancelled) return
        await new Promise<void>((r) => setTimeout(r, 400))
        if (cancelled) return

        setDisplayedLogs((prev) => [...prev, entry])
        if (entry.remainingHp) {
          setDisplayedPlayerHp(entry.remainingHp.player)
          setDisplayedOpponentHp(entry.remainingHp.opponent)
        }
      }
      if (!cancelled) setAnimating(false)
    })()

    return (): void => {
      cancelled = true
    }
  }, [logLen])

  function handleSelectAction(action: Action): void {
    selectAction(action)
  }

  function handleClose(): void {
    reset()
    onClose()
  }

  const turnNumber = battleState?.turn ?? 1
  const winner = phase === 'finished' ? (battleState?.winner ?? null) : null
  const isSelecting = phase === 'selecting' && !animating

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <BattleScene
          player={selectedPlayer}
          opponent={selectedOpponent}
          playerBattle={battleState?.player ?? null}
          opponentBattle={battleState?.opponent ?? null}
          environment={battleState?.environment ?? { terrain: 'forest', weather: 'clear', timeOfDay: 'day' }}
          displayedPlayerHp={displayedPlayerHp}
          displayedOpponentHp={displayedOpponentHp}
          displayedLogs={displayedLogs}
          turnNumber={turnNumber}
          winner={winner}
          finished={phase === 'finished'}
          onClose={handleClose}
        />
      </div>

      {battleContext && battleState && (
        <div className="p-4">
          <ActionPanel
            actions={battleContext.availableActions}
            player={battleState.player}
            onSelectAction={handleSelectAction}
            disabled={!isSelecting}
          />
        </div>
      )}
    </div>
  )
}
