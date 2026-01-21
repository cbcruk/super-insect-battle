import React from 'react'
import { GameCanvas } from './components/game-canvas'
import { BattleUI } from './components/battle-ui/battle-ui'

export function App(): React.ReactNode {
  return (
    <div className="relative w-[800px] h-[600px]">
      <GameCanvas />
      <BattleUI />
    </div>
  )
}
