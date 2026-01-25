import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import type { BattleState, BattleLogEntry } from '@super-insect-battle/engine'
import {
  formatEnvironment,
  getEnvironmentBonus,
  formatEnvironmentBonus,
} from '@super-insect-battle/engine'
import { StatusPanel } from './status-panel.js'

interface BattleViewProps {
  battleState: BattleState
  onFinish: () => void
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function BattleView({
  battleState,
  onFinish,
}: BattleViewProps): React.ReactNode {
  const [displayedLogs, setDisplayedLogs] = useState<BattleLogEntry[]>([])
  const [isAnimating, setIsAnimating] = useState(true)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const animate = async (): Promise<void> => {
      for (const entry of battleState.log) {
        setDisplayedLogs((prev) => [...prev, entry])
        await sleep(300)
      }
      setIsAnimating(false)
      setFinished(true)
    }

    animate()
  }, [battleState])

  useInput((_input, key) => {
    if (finished && (key.return || key.escape)) {
      onFinish()
    }
  })

  const currentPlayerHp =
    displayedLogs.length > 0
      ? (displayedLogs[displayedLogs.length - 1].remainingHp?.player ??
        battleState.player.currentHp)
      : battleState.player.maxHp

  const currentOpponentHp =
    displayedLogs.length > 0
      ? (displayedLogs[displayedLogs.length - 1].remainingHp?.opponent ??
        battleState.opponent.currentHp)
      : battleState.opponent.maxHp

  const playerEnvBonus = getEnvironmentBonus(
    battleState.player.base,
    battleState.environment
  )
  const opponentEnvBonus = getEnvironmentBonus(
    battleState.opponent.base,
    battleState.environment
  )

  return (
    <Box flexDirection="column">
      <Box
        borderStyle="double"
        borderColor="yellow"
        paddingX={2}
        justifyContent="center"
      >
        <Text color="cyan">{battleState.player.base.nameKo}</Text>
        <Text> vs </Text>
        <Text color="magenta">{battleState.opponent.base.nameKo}</Text>
      </Box>

      <Box marginY={1} justifyContent="center">
        <Text color="gray">
          환경: {formatEnvironment(battleState.environment)}
        </Text>
      </Box>

      <Box justifyContent="space-between" paddingX={2}>
        <Text color={playerEnvBonus >= 1 ? 'green' : 'red'}>
          {battleState.player.base.nameKo}: {formatEnvironmentBonus(playerEnvBonus)}
        </Text>
        <Text color={opponentEnvBonus >= 1 ? 'green' : 'red'}>
          {battleState.opponent.base.nameKo}: {formatEnvironmentBonus(opponentEnvBonus)}
        </Text>
      </Box>

      <Box marginY={1} flexDirection="column" gap={1}>
        <StatusPanel
          arthropod={battleState.player}
          currentHp={currentPlayerHp}
          color="cyan"
        />
        <StatusPanel
          arthropod={battleState.opponent}
          currentHp={currentOpponentHp}
          color="magenta"
        />
      </Box>

      <Box flexDirection="column" marginY={1}>
        {displayedLogs.map((entry, index) => {
          const isPlayer = entry.actor === 'player'
          const color = isPlayer ? 'cyan' : 'magenta'
          const prefix = isPlayer ? '▶' : '◀'

          return (
            <Box key={index} flexDirection="column">
              {index === 0 || displayedLogs[index - 1].turn !== entry.turn ? (
                <Text color="yellow">[턴 {entry.turn}]</Text>
              ) : null}
              <Box>
                <Text color={color}>{prefix} </Text>
                <Text>{entry.action}</Text>
              </Box>
              {entry.damage !== undefined && entry.damage > 0 && (
                <Box flexDirection="column">
                  <Text color="red"> → {entry.damage} 데미지!</Text>
                  {entry.factors && (
                    <Text color="gray">
                      {'   '}
                      {entry.factors.styleMatchup !== 1 && (
                        <Text color={entry.factors.styleMatchup > 1 ? 'green' : 'red'}>
                          [style:{entry.factors.styleMatchup.toFixed(1)}x]{' '}
                        </Text>
                      )}
                      {entry.factors.weightBonus !== 1 && (
                        <Text color={entry.factors.weightBonus > 1 ? 'green' : 'red'}>
                          [weight:{entry.factors.weightBonus.toFixed(2)}x]{' '}
                        </Text>
                      )}
                      {entry.factors.attackerEnvBonus && entry.factors.attackerEnvBonus !== 1 && (
                        <Text color={entry.factors.attackerEnvBonus > 1 ? 'green' : 'red'}>
                          [env:{entry.factors.attackerEnvBonus.toFixed(2)}x]{' '}
                        </Text>
                      )}
                      {entry.factors.critical && (
                        <Text color="yellow">[CRITICAL!]</Text>
                      )}
                    </Text>
                  )}
                </Box>
              )}
            </Box>
          )
        })}
      </Box>

      {finished && (
        <Box flexDirection="column" marginTop={1}>
          <Box
            borderStyle="double"
            borderColor="yellow"
            paddingX={2}
            flexDirection="column"
          >
            {battleState.winner === 'draw' ? (
              <Text color="yellow" bold>
                무승부!
              </Text>
            ) : (
              <Text color="green" bold>
                승자:{' '}
                {battleState.winner === 'player'
                  ? battleState.player.base.nameKo
                  : battleState.opponent.base.nameKo}
                !
              </Text>
            )}
            <Text>총 {battleState.turn}턴 소요</Text>
          </Box>
          <Box marginTop={1}>
            <Text color="gray">Enter를 눌러 계속</Text>
          </Box>
        </Box>
      )}

      {isAnimating && (
        <Box marginTop={1}>
          <Text color="gray">배틀 진행 중...</Text>
        </Box>
      )}
    </Box>
  )
}
