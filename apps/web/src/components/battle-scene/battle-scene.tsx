import React from 'react'
import type {
  Arthropod,
  BattleArthropod,
  BattleLogEntry,
  Environment,
} from '@super-insect-battle/engine'
import { BattleField } from './battle-field/battle-field.tsx'
import { StatusBar } from './status-bar/status-bar.tsx'
import { BattleLog } from './battle-log/battle-log.tsx'
import { BattleResult } from './battle-result/battle-result.tsx'

interface BattleSceneProps {
  player: Arthropod
  opponent: Arthropod
  playerBattle: BattleArthropod | null
  opponentBattle: BattleArthropod | null
  environment: Environment
  displayedPlayerHp: number
  displayedOpponentHp: number
  displayedLogs: BattleLogEntry[]
  turnNumber: number
  message?: string
  winner: 'player' | 'opponent' | 'draw' | null
  finished: boolean
  onClose: () => void
  onSaveReplay?: () => void
  onDownloadReplay?: () => void
  replaySaved?: boolean
}

export function BattleScene({
  player,
  opponent,
  playerBattle,
  opponentBattle,
  environment,
  displayedPlayerHp,
  displayedOpponentHp,
  displayedLogs,
  turnNumber,
  message,
  winner,
  finished,
  onClose,
  onSaveReplay,
  onDownloadReplay,
  replaySaved,
}: BattleSceneProps): React.ReactNode {
  return (
    <div className="relative flex h-full flex-col gap-4 p-3 lg:flex-row lg:p-4">
      <div className="flex flex-1 flex-col gap-3">
        <BattleField
          player={player}
          opponent={opponent}
          environment={environment}
          playerFainted={winner === 'opponent' && finished}
          opponentFainted={winner === 'player' && finished}
          turnNumber={turnNumber}
          message={message}
        />

        {opponentBattle && (
          <StatusBar
            arthropod={opponentBattle}
            displayedHp={displayedOpponentHp}
            side="opponent"
          />
        )}

        {playerBattle && (
          <StatusBar
            arthropod={playerBattle}
            displayedHp={displayedPlayerHp}
            side="player"
          />
        )}
      </div>

      <div className="max-h-48 lg:max-h-none lg:w-80">
        <BattleLog
          entries={displayedLogs}
          playerName={player.nameKo}
          opponentName={opponent.nameKo}
        />
      </div>

      {finished && (
        <BattleResult
          winner={winner}
          player={player}
          opponent={opponent}
          totalTurns={turnNumber}
          onClose={onClose}
          onSaveReplay={onSaveReplay}
          onDownloadReplay={onDownloadReplay}
          replaySaved={replaySaved}
        />
      )}
    </div>
  )
}
