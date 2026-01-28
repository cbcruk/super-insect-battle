import React, { useState, useEffect } from 'react'
import { useKeyboard } from '../hooks/use-keyboard'
import { HpBar } from './hp-bar'
import {
  BattleApiClient,
  type BattleStartEvent,
  type BattleTurnEvent,
  type BattleEndEvent,
} from '../api/client'

interface ServerBattleViewProps {
  playerId: string
  opponentId: string
  onFinish: () => void
}

interface LogEntry {
  turn: number
  actor: 'player' | 'opponent'
  action: string
  damage?: number
}

const apiClient = new BattleApiClient()

export function ServerBattleView({
  playerId,
  opponentId,
  onFinish,
}: ServerBattleViewProps): React.ReactNode {
  const [status, setStatus] = useState<
    'connecting' | 'playing' | 'finished' | 'error'
  >('connecting')
  const [error, setError] = useState<string | null>(null)

  const [playerName, setPlayerName] = useState('')
  const [opponentName, setOpponentName] = useState('')
  const [playerHp, setPlayerHp] = useState(0)
  const [opponentHp, setOpponentHp] = useState(0)
  const [playerMaxHp, setPlayerMaxHp] = useState(0)
  const [opponentMaxHp, setOpponentMaxHp] = useState(0)

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [winner, setWinner] = useState<'player' | 'opponent' | 'draw' | null>(
    null
  )
  const [totalTurns, setTotalTurns] = useState(0)

  useEffect(() => {
    const runBattle = async (): Promise<void> => {
      try {
        await apiClient.streamBattle(playerId, opponentId, {
          onStart: (data: BattleStartEvent) => {
            setPlayerName(data.player)
            setOpponentName(data.opponent)
            setPlayerHp(data.playerHp)
            setOpponentHp(data.opponentHp)
            setPlayerMaxHp(data.playerHp)
            setOpponentMaxHp(data.opponentHp)
            setStatus('playing')
          },
          onTurn: async (data: BattleTurnEvent) => {
            setLogs((prev) => [
              ...prev,
              {
                turn: data.turn,
                actor: data.actor,
                action: data.action,
                damage: data.damage,
              },
            ])
            if (data.remainingHp) {
              setPlayerHp(data.remainingHp.player)
              setOpponentHp(data.remainingHp.opponent)
            }
            await new Promise((resolve) => setTimeout(resolve, 300))
          },
          onEnd: (data: BattleEndEvent) => {
            setWinner(data.winner)
            setTotalTurns(data.totalTurns)
            setPlayerHp(data.playerHp)
            setOpponentHp(data.opponentHp)
            setStatus('finished')
          },
          onError: (err: Error) => {
            setError(err.message)
            setStatus('error')
          },
        })
      } catch (err) {
        setError((err as Error).message)
        setStatus('error')
      }
    }

    runBattle()
  }, [playerId, opponentId])

  useKeyboard(
    (e) => {
      if (
        (status === 'finished' || status === 'error') &&
        (e.key === 'Enter' || e.key === 'Escape')
      ) {
        onFinish()
      }
    },
    { isActive: status === 'finished' || status === 'error' }
  )

  if (status === 'connecting') {
    return (
      <div>
        <span style={{ color: 'var(--tui-cyan)' }}>Connecting to server...</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ color: 'var(--tui-red)' }}>Error: {error}</span>
        <div style={{ marginTop: '0.5rem' }}>
          <span style={{ color: 'var(--tui-gray)' }}>Press Enter to go back</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          border: '3px double var(--tui-yellow)',
          padding: '0.25rem 1rem',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: 'var(--tui-cyan)' }}>{playerName}</span>
        <span> vs </span>
        <span style={{ color: 'var(--tui-magenta)' }}>{opponentName}</span>
      </div>

      <div
        style={{
          margin: '0.5rem 0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex' }}>
          <span style={{ color: 'var(--tui-cyan)' }}>{playerName}: </span>
          <HpBar current={playerHp} max={playerMaxHp} />
        </div>
        <div style={{ display: 'flex' }}>
          <span style={{ color: 'var(--tui-magenta)' }}>{opponentName}: </span>
          <HpBar current={opponentHp} max={opponentMaxHp} />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          margin: '0.5rem 0',
        }}
      >
        {logs.map((entry, index) => {
          const isPlayer = entry.actor === 'player'
          const color = isPlayer ? 'var(--tui-cyan)' : 'var(--tui-magenta)'
          const prefix = isPlayer ? '>' : '<'

          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
              {index === 0 || logs[index - 1].turn !== entry.turn ? (
                <span style={{ color: 'var(--tui-yellow)' }}>
                  [Turn {entry.turn}]
                </span>
              ) : null}
              <div style={{ display: 'flex' }}>
                <span style={{ color }}>{prefix} </span>
                <span>{entry.action}</span>
              </div>
              {entry.damage !== undefined && entry.damage > 0 && (
                <span style={{ color: 'var(--tui-red)' }}>
                  {' '}
                  -&gt; {entry.damage} damage!
                </span>
              )}
            </div>
          )
        })}
      </div>

      {status === 'finished' && (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }}>
          <div
            style={{
              border: '3px double var(--tui-yellow)',
              padding: '0.25rem 1rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {winner === 'draw' ? (
              <span style={{ color: 'var(--tui-yellow)', fontWeight: 'bold' }}>
                Draw!
              </span>
            ) : (
              <span style={{ color: 'var(--tui-green)', fontWeight: 'bold' }}>
                Winner: {winner === 'player' ? playerName : opponentName}!
              </span>
            )}
            <span>Total {totalTurns} turns</span>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{ color: 'var(--tui-gray)' }}>Press Enter to continue</span>
          </div>
        </div>
      )}

      {status === 'playing' && (
        <div style={{ marginTop: '0.5rem' }}>
          <span style={{ color: 'var(--tui-gray)' }}>Battle in progress...</span>
        </div>
      )}
    </div>
  )
}
