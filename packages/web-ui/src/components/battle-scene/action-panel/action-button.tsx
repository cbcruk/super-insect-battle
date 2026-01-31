import React from 'react'
import type { Action } from '@super-insect-battle/engine'

const categoryStyles: Record<
  string,
  { bg: string; border: string; hoverBg: string }
> = {
  attack: {
    bg: 'bg-red-900/40',
    border: 'border-red-500/50',
    hoverBg: 'hover:bg-red-900/60',
  },
  defense: {
    bg: 'bg-blue-900/40',
    border: 'border-blue-500/50',
    hoverBg: 'hover:bg-blue-900/60',
  },
  special: {
    bg: 'bg-amber-900/40',
    border: 'border-amber-500/50',
    hoverBg: 'hover:bg-amber-900/60',
  },
}

interface ActionButtonProps {
  action: Action
  cooldown: number
  shortcutKey?: number
  onSelect: () => void
}

export function ActionButton({
  action,
  cooldown,
  shortcutKey,
  onSelect,
}: ActionButtonProps): React.ReactNode {
  const style = categoryStyles[action.category] ?? categoryStyles.attack
  const onCooldown = cooldown > 0
  const hasEffect = action.effect != null

  return (
    <button
      onClick={onSelect}
      disabled={onCooldown}
      className={`rounded-lg border p-3 text-left transition-all ${style.bg} ${style.border} ${
        onCooldown
          ? 'cursor-not-allowed opacity-40'
          : `${style.hoverBg} hover:scale-[1.02]`
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-200">
          {action.nameKo}
        </span>
        <div className="flex items-center gap-1.5">
          {shortcutKey != null && (
            <span className="rounded bg-gray-700 px-1 py-0.5 text-[10px] font-bold text-gray-400">
              {shortcutKey}
            </span>
          )}
          <span className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] font-bold text-gray-400">
            {action.category.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-400">
        {action.power > 0 && (
          <span>
            PWR <span className="text-gray-300">{action.power}</span>
          </span>
        )}
        <span>
          ACC <span className="text-gray-300">{action.accuracy}%</span>
        </span>
        {action.cooldown > 0 && (
          <span>
            CD <span className="text-gray-300">{action.cooldown}</span>
          </span>
        )}
        {hasEffect && (
          <span className="text-purple-400">
            {action.effect!.type === 'status'
              ? action.effect!.condition?.toUpperCase()
              : action.effect!.type.toUpperCase()}
          </span>
        )}
      </div>
      {onCooldown && (
        <div className="mt-1 text-[10px] font-bold text-gray-500">
          Cooldown: {cooldown} turn{cooldown > 1 ? 's' : ''}
        </div>
      )}
    </button>
  )
}
