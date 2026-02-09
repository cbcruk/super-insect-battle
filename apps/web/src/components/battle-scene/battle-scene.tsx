import React from 'react'
import type {
  Arthropod,
  BattleArthropod,
  BattleLogEntry,
  Environment,
} from '@super-insect-battle/engine'
import type {
  CharacterAnimation,
  DamagePopupEffect,
  ActionTextEffect,
  BlockParticleEffect,
} from './battle-field-3d/battle-field-3d.types.ts'
import type { HpEmphasis } from './status-bar/hp-bar.tsx'
import { BattleField } from './battle-field/battle-field.tsx'
import { StatusBar } from './status-bar/status-bar.tsx'
import { BattleLog } from './battle-log/battle-log.tsx'
import { BattleResult } from './battle-result/battle-result.tsx'
import { ScreenEffects } from './battle-field-3d/screen-effects.tsx'

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
  playerAnimation?: CharacterAnimation
  opponentAnimation?: CharacterAnimation
  playerHpEmphasis?: HpEmphasis
  opponentHpEmphasis?: HpEmphasis
  onPlayerHpEmphasisComplete?: () => void
  onOpponentHpEmphasisComplete?: () => void
  damagePopups?: DamagePopupEffect[]
  actionTexts?: ActionTextEffect[]
  blockParticles?: BlockParticleEffect[]
  onDamagePopupComplete?: (id: string) => void
  onActionTextComplete?: (id: string) => void
  onBlockParticleComplete?: (id: string) => void
  screenShake?: boolean
  screenFlash?: 'none' | 'hit' | 'critical'
  onScreenEffectComplete?: () => void
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
  playerAnimation,
  opponentAnimation,
  playerHpEmphasis,
  opponentHpEmphasis,
  onPlayerHpEmphasisComplete,
  onOpponentHpEmphasisComplete,
  damagePopups,
  actionTexts,
  blockParticles,
  onDamagePopupComplete,
  onActionTextComplete,
  onBlockParticleComplete,
  screenShake = false,
  screenFlash = 'none',
  onScreenEffectComplete,
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
        <div className="relative">
          <BattleField
            player={player}
            opponent={opponent}
            environment={environment}
            playerFainted={winner === 'opponent' && finished}
            opponentFainted={winner === 'player' && finished}
            playerAnimation={playerAnimation}
            opponentAnimation={opponentAnimation}
            turnNumber={turnNumber}
            message={message}
            damagePopups={damagePopups}
            actionTexts={actionTexts}
            blockParticles={blockParticles}
            onDamagePopupComplete={onDamagePopupComplete}
            onActionTextComplete={onActionTextComplete}
            onBlockParticleComplete={onBlockParticleComplete}
          />
          <ScreenEffects
            shake={screenShake}
            flash={screenFlash}
            onEffectComplete={onScreenEffectComplete ?? (() => {})}
          />
        </div>

        {opponentBattle && (
          <StatusBar
            arthropod={opponentBattle}
            displayedHp={displayedOpponentHp}
            side="opponent"
            hpEmphasis={opponentHpEmphasis}
            onHpEmphasisComplete={onOpponentHpEmphasisComplete}
          />
        )}

        {playerBattle && (
          <StatusBar
            arthropod={playerBattle}
            displayedHp={displayedPlayerHp}
            side="player"
            hpEmphasis={playerHpEmphasis}
            onHpEmphasisComplete={onPlayerHpEmphasisComplete}
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
