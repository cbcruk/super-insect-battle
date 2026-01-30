import React from 'react'
import type { Arthropod, Environment } from '@super-insect-battle/engine'
import { EnvironmentBg } from './environment-bg.tsx'
import { Sprite } from './sprite.tsx'
import {
  formatEnvironment,
} from '@super-insect-battle/engine'

interface BattleFieldProps {
  player: Arthropod
  opponent: Arthropod
  environment: Environment
  playerFainted?: boolean
  opponentFainted?: boolean
  turnNumber?: number
  message?: string
}

export function BattleField({
  player,
  opponent,
  environment,
  playerFainted = false,
  opponentFainted = false,
  turnNumber,
  message,
}: BattleFieldProps): React.ReactNode {
  return (
    <EnvironmentBg environment={environment}>
      <div className="flex min-h-[320px] flex-col justify-between p-6">
        {turnNumber != null && (
          <div className="absolute left-4 top-4 rounded-md bg-black/50 px-3 py-1 text-sm font-bold text-white">
            Turn {turnNumber}
          </div>
        )}

        <div className="absolute right-4 top-4 rounded-md bg-black/40 px-2 py-1 text-xs text-gray-300">
          {formatEnvironment(environment)}
        </div>

        <div className="flex justify-end pr-8 pt-4">
          <Sprite arthropod={opponent} side="opponent" fainted={opponentFainted} />
        </div>

        <div className="flex justify-start pl-8 pb-4">
          <Sprite arthropod={player} side="player" fainted={playerFainted} />
        </div>

        {message && (
          <div className="absolute inset-x-0 bottom-0 bg-black/70 px-4 py-3 text-sm text-white">
            {message}
          </div>
        )}
      </div>
    </EnvironmentBg>
  )
}
