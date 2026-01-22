import React from 'react'
import { useVillageStore } from '../../store/village-store'
import type { NpcAction } from '@insect-battle/cli-core'

export function DialogueBox(): React.ReactNode {
  const { currentNpc, dialogueIndex, showActions, executeAction, closeUI } =
    useVillageStore()

  if (!currentNpc) return null

  const currentDialogue = currentNpc.dialogue[dialogueIndex]

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <div className="bg-gray-900/95 border-2 border-gray-600 rounded-lg p-4">
        <div className="text-yellow-400 font-bold mb-2">{currentNpc.name}</div>
        <div className="text-white mb-4 min-h-[48px]">{currentDialogue?.text}</div>

        {showActions && currentNpc.actions && currentNpc.actions.length > 0 ? (
          <div className="flex gap-2">
            {currentNpc.actions.map((action: NpcAction) => (
              <button
                key={action.id}
                onClick={() => executeAction(action.type)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-medium"
              >
                {action.label}
              </button>
            ))}
            <button
              onClick={closeUI}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white font-medium"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="text-gray-400 text-sm animate-pulse">
            Press Space to continue...
          </div>
        )}
      </div>
    </div>
  )
}
