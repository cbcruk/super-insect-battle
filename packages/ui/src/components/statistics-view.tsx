import React from 'react'
import { Box, Text, useInput } from 'ink'

interface StatisticsViewProps {
  name1: string
  name2: string
  stats: {
    playerWins: number
    opponentWins: number
    draws: number
    winRate: number
    avgTurns: number
  }
  count: number
  onFinish: () => void
}

export function StatisticsView({
  name1,
  name2,
  stats,
  count,
  onFinish,
}: StatisticsViewProps): React.ReactNode {
  useInput((_input, key) => {
    if (key.return || key.escape) {
      onFinish()
    }
  })

  const opponentWinRate = 100 - stats.winRate - (stats.draws / count) * 100

  return (
    <Box flexDirection="column">
      <Box
        borderStyle="double"
        borderColor="yellow"
        paddingX={2}
        justifyContent="center"
      >
        <Text color="yellow" bold>
          {count}회 시뮬레이션 결과
        </Text>
      </Box>

      <Box flexDirection="column" marginY={1}>
        <Box>
          <Text color="cyan">{name1}</Text>
          <Text>
            {' '}
            승리: {stats.playerWins}회 ({stats.winRate.toFixed(1)}%)
          </Text>
        </Box>
        <Box>
          <Text color="magenta">{name2}</Text>
          <Text>
            {' '}
            승리: {stats.opponentWins}회 ({opponentWinRate.toFixed(1)}%)
          </Text>
        </Box>
        <Text>무승부: {stats.draws}회</Text>
      </Box>

      <Text>평균 턴: {stats.avgTurns.toFixed(1)}턴</Text>

      <Box marginTop={2}>
        <Text color="gray">Enter를 눌러 계속</Text>
      </Box>
    </Box>
  )
}
