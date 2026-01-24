import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { HpBar } from './hp-bar.js'
import {
  BattleApiClient,
  type BattleStartEvent,
  type BattleTurnEvent,
  type BattleEndEvent,
} from '../api/client.js'

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

  useInput((_input, key) => {
    if (
      (status === 'finished' || status === 'error') &&
      (key.return || key.escape)
    ) {
      onFinish()
    }
  })

  if (status === 'connecting') {
    return (
      <Box>
        <Text color="cyan">서버에 연결 중...</Text>
      </Box>
    )
  }

  if (status === 'error') {
    return (
      <Box flexDirection="column">
        <Text color="red">오류: {error}</Text>
        <Box marginTop={1}>
          <Text color="gray">Enter를 눌러 돌아가기</Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Box
        borderStyle="double"
        borderColor="yellow"
        paddingX={2}
        justifyContent="center"
      >
        <Text color="cyan">{playerName}</Text>
        <Text> vs </Text>
        <Text color="magenta">{opponentName}</Text>
      </Box>

      <Box marginY={1} flexDirection="column">
        <Box>
          <Text color="cyan">{playerName}: </Text>
          <HpBar current={playerHp} max={playerMaxHp} />
        </Box>
        <Box>
          <Text color="magenta">{opponentName}: </Text>
          <HpBar current={opponentHp} max={opponentMaxHp} />
        </Box>
      </Box>

      <Box flexDirection="column" marginY={1}>
        {logs.map((entry, index) => {
          const isPlayer = entry.actor === 'player'
          const color = isPlayer ? 'cyan' : 'magenta'
          const prefix = isPlayer ? '▶' : '◀'

          return (
            <Box key={index} flexDirection="column">
              {index === 0 || logs[index - 1].turn !== entry.turn ? (
                <Text color="yellow">[턴 {entry.turn}]</Text>
              ) : null}
              <Box>
                <Text color={color}>{prefix} </Text>
                <Text>{entry.action}</Text>
              </Box>
              {entry.damage !== undefined && entry.damage > 0 && (
                <Text color="red"> → {entry.damage} 데미지!</Text>
              )}
            </Box>
          )
        })}
      </Box>

      {status === 'finished' && (
        <Box flexDirection="column" marginTop={1}>
          <Box
            borderStyle="double"
            borderColor="yellow"
            paddingX={2}
            flexDirection="column"
          >
            {winner === 'draw' ? (
              <Text color="yellow" bold>
                무승부!
              </Text>
            ) : (
              <Text color="green" bold>
                승자: {winner === 'player' ? playerName : opponentName}!
              </Text>
            )}
            <Text>총 {totalTurns}턴 소요</Text>
          </Box>
          <Box marginTop={1}>
            <Text color="gray">Enter를 눌러 계속</Text>
          </Box>
        </Box>
      )}

      {status === 'playing' && (
        <Box marginTop={1}>
          <Text color="gray">배틀 진행 중...</Text>
        </Box>
      )}
    </Box>
  )
}
