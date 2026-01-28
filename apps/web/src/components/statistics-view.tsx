import React from 'react'
import { useKeyboard } from '../hooks/use-keyboard'

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
  useKeyboard((e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      onFinish()
    }
  })

  const opponentWinRate = 100 - stats.winRate - (stats.draws / count) * 100

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
        <span style={{ color: 'var(--tui-yellow)', fontWeight: 'bold' }}>
          {count} Simulation Results
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          margin: '0.5rem 0',
        }}
      >
        <div style={{ display: 'flex' }}>
          <span style={{ color: 'var(--tui-cyan)' }}>{name1}</span>
          <span>
            {' '}
            Wins: {stats.playerWins} ({stats.winRate.toFixed(1)}%)
          </span>
        </div>
        <div style={{ display: 'flex' }}>
          <span style={{ color: 'var(--tui-magenta)' }}>{name2}</span>
          <span>
            {' '}
            Wins: {stats.opponentWins} ({opponentWinRate.toFixed(1)}%)
          </span>
        </div>
        <span>Draws: {stats.draws}</span>
      </div>

      <span>Average Turns: {stats.avgTurns.toFixed(1)}</span>

      <div style={{ marginTop: '1rem' }}>
        <span style={{ color: 'var(--tui-gray)' }}>Press Enter to continue</span>
      </div>
    </div>
  )
}
