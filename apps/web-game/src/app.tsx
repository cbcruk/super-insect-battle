import React from 'react'
import { GameCanvas } from './components/game-canvas'
import { BattleUI } from './components/battle-ui/battle-ui'
import { VillageUI } from './components/village-ui/village-ui'
import { useGameStore } from './store/game-store'

export function App(): React.ReactNode {
  const { currentScene } = useGameStore()

  return (
    <div className="relative w-[800px] h-[600px]">
      <GameCanvas />
      {currentScene === 'village' && <VillageUI />}
      {currentScene === 'battle' && <BattleUI />}
    </div>
  )
}
