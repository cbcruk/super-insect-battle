import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import type { Arthropod, BattleState } from '@super-insect-battle/engine'
import { Header } from './header.js'
import { MainMenu, type MenuScreen } from './main-menu.js'
import { ArthropodSelect } from './arthropod-select.js'
import { BattleView } from './battle-view.js'
import { StatisticsView } from './statistics-view.js'
import { Encyclopedia } from './encyclopedia.js'
import { NumberInput } from './number-input.js'
import { ServerBattleView } from './server-battle-view.js'
import { runBattle, runMultipleBattles } from '../simulation/battle-runner.js'
import { BattleApiClient } from '../api/client.js'

type Screen =
  | 'menu'
  | 'select-player'
  | 'select-opponent'
  | 'battle'
  | 'encyclopedia'
  | 'statistics-select-player'
  | 'statistics-select-opponent'
  | 'statistics-count'
  | 'statistics-result'
  | 'statistics-loading'
  | 'server-battle-select-player'
  | 'server-battle-select-opponent'
  | 'server-battle'
  | 'server-stats-select-player'
  | 'server-stats-select-opponent'
  | 'server-stats-count'
  | 'server-stats-result'
  | 'server-stats-loading'

const apiClient = new BattleApiClient()

interface AppProps {
  onExit?: () => void
}

export function App({ onExit }: AppProps): React.ReactNode {
  const [screen, setScreen] = useState<Screen>('menu')
  const [serverConnected, setServerConnected] = useState(false)

  const [player, setPlayer] = useState<Arthropod | null>(null)
  const [opponent, setOpponent] = useState<Arthropod | null>(null)
  const [battleState, setBattleState] = useState<BattleState | null>(null)

  const [simulationCount, setSimulationCount] = useState(100)
  const [statisticsResult, setStatisticsResult] = useState<{
    playerWins: number
    opponentWins: number
    draws: number
    winRate: number
    avgTurns: number
  } | null>(null)

  useEffect(() => {
    apiClient.checkConnection().then(setServerConnected)
  }, [screen])

  const handleMenuSelect = (menuScreen: MenuScreen): void => {
    switch (menuScreen) {
      case 'battle':
        setScreen('select-player')
        break
      case 'encyclopedia':
        setScreen('encyclopedia')
        break
      case 'statistics':
        setScreen('statistics-select-player')
        break
      case 'server-battle':
        setScreen('server-battle-select-player')
        break
      case 'server-stats':
        setScreen('server-stats-select-player')
        break
    }
  }

  const handlePlayerSelect = (arthropod: Arthropod): void => {
    setPlayer(arthropod)
    if (screen === 'select-player') {
      setScreen('select-opponent')
    } else if (screen === 'statistics-select-player') {
      setScreen('statistics-select-opponent')
    } else if (screen === 'server-battle-select-player') {
      setScreen('server-battle-select-opponent')
    } else if (screen === 'server-stats-select-player') {
      setScreen('server-stats-select-opponent')
    }
  }

  const handleOpponentSelect = (arthropod: Arthropod): void => {
    setOpponent(arthropod)
    if (screen === 'select-opponent' && player) {
      const result = runBattle(player, arthropod)
      setBattleState(result)
      setScreen('battle')
    } else if (screen === 'statistics-select-opponent') {
      setScreen('statistics-count')
    } else if (screen === 'server-battle-select-opponent' && player) {
      setScreen('server-battle')
    } else if (screen === 'server-stats-select-opponent') {
      setScreen('server-stats-count')
    }
  }

  const handleStatisticsCount = (count: number): void => {
    if (player && opponent) {
      setSimulationCount(count)
      setScreen('statistics-loading')
      const result = runMultipleBattles(player, opponent, count)
      setStatisticsResult(result)
      setScreen('statistics-result')
    }
  }

  const handleServerStatsCount = async (count: number): Promise<void> => {
    if (player && opponent) {
      setSimulationCount(count)
      setScreen('server-stats-loading')
      try {
        const result = await apiClient.getStats(player.id, opponent.id, count)
        setStatisticsResult(result.stats)
        setScreen('server-stats-result')
      } catch {
        setScreen('menu')
      }
    }
  }

  const resetAndGoToMenu = (): void => {
    setPlayer(null)
    setOpponent(null)
    setBattleState(null)
    setStatisticsResult(null)
    setScreen('menu')
  }

  const renderScreen = (): React.ReactNode => {
    switch (screen) {
      case 'menu':
        return (
          <MainMenu
            serverConnected={serverConnected}
            onSelect={handleMenuSelect}
            onExit={onExit}
          />
        )

      case 'select-player':
      case 'statistics-select-player':
      case 'server-battle-select-player':
      case 'server-stats-select-player':
        return (
          <ArthropodSelect
            prompt="첫 번째 절지동물을 선택하세요"
            onSelect={handlePlayerSelect}
            onCancel={resetAndGoToMenu}
          />
        )

      case 'select-opponent':
      case 'statistics-select-opponent':
      case 'server-battle-select-opponent':
      case 'server-stats-select-opponent':
        return (
          <ArthropodSelect
            prompt="두 번째 절지동물을 선택하세요"
            onSelect={handleOpponentSelect}
            onCancel={resetAndGoToMenu}
          />
        )

      case 'battle':
        return battleState ? (
          <BattleView battleState={battleState} onFinish={resetAndGoToMenu} />
        ) : (
          <Text>로딩 중...</Text>
        )

      case 'encyclopedia':
        return <Encyclopedia onBack={resetAndGoToMenu} />

      case 'statistics-count':
        return (
          <NumberInput
            prompt="시뮬레이션 횟수 (기본값 100)"
            defaultValue={100}
            onSubmit={handleStatisticsCount}
            onCancel={resetAndGoToMenu}
          />
        )

      case 'statistics-loading':
        return (
          <Box>
            <Text color="cyan">{simulationCount}회 시뮬레이션 중...</Text>
          </Box>
        )

      case 'statistics-result':
        return player && opponent && statisticsResult ? (
          <StatisticsView
            name1={player.nameKo}
            name2={opponent.nameKo}
            stats={statisticsResult}
            count={simulationCount}
            onFinish={resetAndGoToMenu}
          />
        ) : (
          <Text>로딩 중...</Text>
        )

      case 'server-battle':
        return player && opponent ? (
          <ServerBattleView
            playerId={player.id}
            opponentId={opponent.id}
            onFinish={resetAndGoToMenu}
          />
        ) : (
          <Text>로딩 중...</Text>
        )

      case 'server-stats-count':
        return (
          <NumberInput
            prompt="시뮬레이션 횟수 (기본값 100)"
            defaultValue={100}
            onSubmit={(count) => {
              handleServerStatsCount(count)
            }}
            onCancel={resetAndGoToMenu}
          />
        )

      case 'server-stats-loading':
        return (
          <Box>
            <Text color="cyan">
              서버에서 {simulationCount}회 시뮬레이션 중...
            </Text>
          </Box>
        )

      case 'server-stats-result':
        return player && opponent && statisticsResult ? (
          <StatisticsView
            name1={player.nameKo}
            name2={opponent.nameKo}
            stats={statisticsResult}
            count={simulationCount}
            onFinish={resetAndGoToMenu}
          />
        ) : (
          <Text>로딩 중...</Text>
        )

      default:
        return <Text>알 수 없는 화면</Text>
    }
  }

  return (
    <Box flexDirection="column">
      <Header />
      {renderScreen()}
    </Box>
  )
}
