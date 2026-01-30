import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { simulateBattle } from '@super-insect-battle/engine'
import type { BattleState, BattleLogEntry } from '@super-insect-battle/engine'
import { BattleScene, useGameStore } from '@super-insect-battle/web-ui'

const LOG_DELAY_MS = 600

export function BattlePage(): React.ReactNode {
  const navigate = useNavigate()
  const selectedPlayer = useGameStore((s) => s.selectedPlayer)
  const selectedOpponent = useGameStore((s) => s.selectedOpponent)

  const [battleState, setBattleState] = useState<BattleState | null>(null)
  const [displayedLogs, setDisplayedLogs] = useState<BattleLogEntry[]>([])
  const [displayedPlayerHp, setDisplayedPlayerHp] = useState(0)
  const [displayedOpponentHp, setDisplayedOpponentHp] = useState(0)
  const [replayDone, setReplayDone] = useState(false)

  const replayAbortRef = useRef(false)

  useEffect(() => {
    if (!selectedPlayer || !selectedOpponent) {
      navigate('/battle/setup')
      return
    }

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

  function handleClose(): void {
    replayAbortRef.current = true
    navigate('/battle/setup')
  }

  if (!selectedPlayer || !selectedOpponent || !battleState) {
    return null
  }

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
        onClose={handleClose}
      />
    </div>
  )
}
