import React from 'react'
import type { Move } from '@insect-battle/engine'

interface MoveMenuProps {
  moves: Move[]
  onSelectMove: (move: Move) => void
  disabled: boolean
}

export function MoveMenu({ moves, onSelectMove, disabled }: MoveMenuProps): React.ReactNode {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-800/90 p-4 border-t border-gray-700">
      <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
        {moves.map((move, index) => (
          <button
            key={move.id}
            onClick={() => onSelectMove(move)}
            disabled={disabled}
            className={`
              px-4 py-3 rounded text-left transition-colors
              ${disabled
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500'}
            `}
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">[{index + 1}]</span>
              <span className="font-medium">{move.name}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {move.category !== 'status' && `Power: ${move.power}`}
              {move.category === 'status' && 'Status'}
              {' • '}
              Acc: {move.accuracy}%
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
