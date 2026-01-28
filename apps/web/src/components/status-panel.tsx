import React from 'react'
import type { BattleArthropod } from '@super-insect-battle/engine'
import { HpBar } from './hp-bar'
import { getStatStageColor, formatStatStage } from '../utils/colors'

interface StatusPanelProps {
  arthropod: BattleArthropod
  currentHp: number
  color: 'cyan' | 'magenta'
}

export function StatusPanel({
  arthropod,
  currentHp,
  color,
}: StatusPanelProps): React.ReactNode {
  const {
    statStages,
    statusCondition,
    bindTurns,
    battleMode,
    modeTurns,
    appliedVenomPotency,
  } = arthropod

  const hasStatChanges =
    statStages.strength !== 0 ||
    statStages.defense !== 0 ||
    statStages.evasion !== 0

  const borderColor =
    color === 'cyan' ? 'var(--tui-cyan)' : 'var(--tui-magenta)'
  const textColor = borderColor

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${borderColor}`,
        padding: '0.25rem 0.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: textColor, fontWeight: 'bold' }}>
          {arthropod.base.nameKo}
        </span>
        {hasStatChanges && (
          <span>
            {statStages.strength !== 0 && (
              <span style={{ color: getStatStageColor(statStages.strength) }}>
                {' '}
                ATK{formatStatStage(statStages.strength)}
              </span>
            )}
            {statStages.defense !== 0 && (
              <span style={{ color: getStatStageColor(statStages.defense) }}>
                {' '}
                DEF{formatStatStage(statStages.defense)}
              </span>
            )}
            {statStages.evasion !== 0 && (
              <span style={{ color: getStatStageColor(statStages.evasion) }}>
                {' '}
                EVA{formatStatStage(statStages.evasion)}
              </span>
            )}
          </span>
        )}
      </div>

      <HpBar current={currentHp} max={arthropod.maxHp} />

      <div>
        {statusCondition === 'poison' && (
          <span style={{ color: 'var(--tui-magenta)' }}>
            [poison{appliedVenomPotency > 0 ? `:${appliedVenomPotency}` : ''}]{' '}
          </span>
        )}
        {statusCondition === 'bind' && (
          <span style={{ color: 'var(--tui-yellow)' }}>
            [bind:{bindTurns}]{' '}
          </span>
        )}
        {battleMode === 'flee' && (
          <span style={{ color: 'var(--tui-blue)' }}>[flee:{modeTurns}] </span>
        )}
        {battleMode === 'brace' && (
          <span style={{ color: 'var(--tui-green)' }}>
            [brace:{modeTurns}]{' '}
          </span>
        )}
        {!statusCondition && !battleMode && (
          <span style={{ color: 'var(--tui-gray)' }}>[normal]</span>
        )}
      </div>
    </div>
  )
}
