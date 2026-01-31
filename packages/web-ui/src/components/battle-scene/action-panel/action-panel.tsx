import React from 'react'
import type { Action, BattleArthropod } from '@super-insect-battle/engine'
import { ActionButton } from './action-button.tsx'

interface ActionPanelProps {
  actions: Action[]
  player: BattleArthropod
  onSelectAction: (action: Action) => void
  disabled?: boolean
}

export function ActionPanel({
  actions,
  player,
  onSelectAction,
  disabled = false,
}: ActionPanelProps): React.ReactNode {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900/80 p-3 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-cyan-400">Select Action</h3>
        {disabled && (
          <span className="text-xs text-gray-500">Waiting...</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {actions.map((action, index) => (
          <ActionButton
            key={action.id}
            action={action}
            cooldown={player.actionCooldowns[action.id] ?? 0}
            shortcutKey={index + 1}
            onSelect={() => {
              if (!disabled) onSelectAction(action)
            }}
          />
        ))}
      </div>
    </div>
  )
}
