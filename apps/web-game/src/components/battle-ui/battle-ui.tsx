import React from 'react'
import { HpBar } from './hp-bar'
import { MoveMenu } from './move-menu'
import { useBattleStore } from '../../store/battle-store'

export function BattleUI(): React.ReactNode {
  const {
    playerInsect,
    opponentInsect,
    phase,
    selectMove,
    battleResult,
    startNewBattle,
    returnToVillage,
  } = useBattleStore()

  if (!playerInsect || !opponentInsect) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-gray-400">Loading battle...</div>
      </div>
    )
  }

  const isSelectingMove = phase === 'selecting'
  const isBattleEnded = phase === 'ended'

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="pointer-events-auto">
        <HpBar
          name={playerInsect.base.nameKo}
          currentHp={playerInsect.currentHp}
          maxHp={playerInsect.maxHp}
          side="player"
        />
        <HpBar
          name={opponentInsect.base.nameKo}
          currentHp={opponentInsect.currentHp}
          maxHp={opponentInsect.maxHp}
          side="opponent"
        />
      </div>

      {isBattleEnded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 pointer-events-auto">
          <div className="text-3xl font-bold mb-4">
            {battleResult === 'player' && 'Victory!'}
            {battleResult === 'opponent' && 'Defeat...'}
            {battleResult === 'draw' && 'Draw!'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={returnToVillage}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded font-medium"
            >
              Return to Village
            </button>
            <button
              onClick={startNewBattle}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded font-medium"
            >
              New Battle
            </button>
          </div>
        </div>
      )}

      {!isBattleEnded && (
        <div className="pointer-events-auto">
          <MoveMenu
            moves={playerInsect.moves}
            onSelectMove={selectMove}
            disabled={!isSelectingMove}
          />
        </div>
      )}
    </div>
  )
}
