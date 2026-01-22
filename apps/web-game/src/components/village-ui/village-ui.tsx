import React from 'react'
import { DialogueBox } from './dialogue-box'
import { ShopMenu } from './shop-menu'
import { useVillageStore } from '../../store/village-store'
import { useGameStore } from '../../store/game-store'
import { getRoomMap } from '../../game/tilemaps/village-map'

export function VillageUI(): React.ReactNode {
  const { uiMode } = useVillageStore()
  const { currentRoom } = useGameStore()

  const roomMap = getRoomMap(currentRoom)
  const roomName = roomMap?.name ?? currentRoom

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-2 left-2 bg-gray-900/80 px-3 py-1 rounded text-white text-sm">
        {roomName}
      </div>

      <div className="absolute top-2 right-2 bg-gray-900/80 px-3 py-1 rounded text-gray-400 text-xs">
        WASD: Move | Space: Interact
      </div>

      {uiMode === 'dialogue' && (
        <div className="pointer-events-auto">
          <DialogueBox />
        </div>
      )}

      {uiMode === 'shop' && (
        <div className="pointer-events-auto">
          <ShopMenu />
        </div>
      )}
    </div>
  )
}
