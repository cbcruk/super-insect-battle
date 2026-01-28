import React, { useState, useEffect, useRef } from 'react'
import type { Arthropod, BattleState } from '@super-insect-battle/engine'
import { Header } from './header'
import { MainMenu, type MenuScreen } from './main-menu'
import { ArthropodSelect } from './arthropod-select'
import { BattleView } from './battle-view'
import { StatisticsView } from './statistics-view'
import { Encyclopedia } from './encyclopedia'
import { NumberInput } from './number-input'
import { ServerBattleView } from './server-battle-view'
import { runBattle, runMultipleBattles } from '../simulation/battle-runner'
import { BattleApiClient } from '../api/client'

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

export function GameApp(): React.ReactNode {
  const containerRef = useRef<HTMLDivElement>(null)
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
    containerRef.current?.focus()
  }, [])

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
          />
        )

      case 'select-player':
      case 'statistics-select-player':
      case 'server-battle-select-player':
      case 'server-stats-select-player':
        return (
          <ArthropodSelect
            prompt="Select First Arthropod"
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
            prompt="Select Second Arthropod"
            onSelect={handleOpponentSelect}
            onCancel={resetAndGoToMenu}
          />
        )

      case 'battle':
        return battleState ? (
          <BattleView battleState={battleState} onFinish={resetAndGoToMenu} />
        ) : (
          <span>Loading...</span>
        )

      case 'encyclopedia':
        return <Encyclopedia onBack={resetAndGoToMenu} />

      case 'statistics-count':
        return (
          <NumberInput
            prompt="Simulation Count (default 100)"
            defaultValue={100}
            onSubmit={handleStatisticsCount}
            onCancel={resetAndGoToMenu}
          />
        )

      case 'statistics-loading':
        return (
          <div>
            <span style={{ color: 'var(--tui-cyan)' }}>
              Running {simulationCount} simulations...
            </span>
          </div>
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
          <span>Loading...</span>
        )

      case 'server-battle':
        return player && opponent ? (
          <ServerBattleView
            playerId={player.id}
            opponentId={opponent.id}
            onFinish={resetAndGoToMenu}
          />
        ) : (
          <span>Loading...</span>
        )

      case 'server-stats-count':
        return (
          <NumberInput
            prompt="Simulation Count (default 100)"
            defaultValue={100}
            onSubmit={(count) => {
              handleServerStatsCount(count)
            }}
            onCancel={resetAndGoToMenu}
          />
        )

      case 'server-stats-loading':
        return (
          <div>
            <span style={{ color: 'var(--tui-cyan)' }}>
              Running {simulationCount} simulations on server...
            </span>
          </div>
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
          <span>Loading...</span>
        )

      default:
        return <span>Unknown screen</span>
    }
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="tui-container"
      style={{ outline: 'none' }}
    >
      <Header />
      {renderScreen()}
    </div>
  )
}
