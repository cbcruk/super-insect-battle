import React, { useState, useEffect } from 'react'
import type { BattleState, BattleLogEntry } from '@super-insect-battle/engine'
import {
  formatEnvironment,
  getEnvironmentBonus,
  formatEnvironmentBonus,
} from '@super-insect-battle/engine'
import { useKeyboard } from '../hooks/use-keyboard'
import { StatusPanel } from './status-panel'

interface BattleViewProps {
  battleState: BattleState
  onFinish: () => void
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function BattleView({
  battleState,
  onFinish,
}: BattleViewProps): React.ReactNode {
  const [displayedLogs, setDisplayedLogs] = useState<BattleLogEntry[]>([])
  const [isAnimating, setIsAnimating] = useState(true)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const animate = async (): Promise<void> => {
      for (const entry of battleState.log) {
        setDisplayedLogs((prev) => [...prev, entry])
        await sleep(300)
      }
      setIsAnimating(false)
      setFinished(true)
    }

    animate()
  }, [battleState])

  useKeyboard(
    (e) => {
      if (finished && (e.key === 'Enter' || e.key === 'Escape')) {
        onFinish()
      }
    },
    { isActive: finished }
  )

  const getLastKnownHp = (
    logs: BattleLogEntry[],
    side: 'player' | 'opponent'
  ): number | undefined => {
    for (let i = logs.length - 1; i >= 0; i--) {
      const hp = logs[i].remainingHp?.[side]
      if (hp !== undefined) return hp
    }
    return undefined
  }

  const currentPlayerHp =
    getLastKnownHp(displayedLogs, 'player') ?? battleState.player.maxHp

  const currentOpponentHp =
    getLastKnownHp(displayedLogs, 'opponent') ?? battleState.opponent.maxHp

  const playerEnvBonus = getEnvironmentBonus(
    battleState.player.base,
    battleState.environment
  )
  const opponentEnvBonus = getEnvironmentBonus(
    battleState.opponent.base,
    battleState.environment
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          border: '3px double var(--tui-yellow)',
          padding: '0.25rem 1rem',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: 'var(--tui-cyan)' }}>
          {battleState.player.base.nameKo}
        </span>
        <span> vs </span>
        <span style={{ color: 'var(--tui-magenta)' }}>
          {battleState.opponent.base.nameKo}
        </span>
      </div>

      <div
        style={{
          margin: '0.5rem 0',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: 'var(--tui-gray)' }}>
          Environment: {formatEnvironment(battleState.environment)}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 0.5rem',
        }}
      >
        <span
          style={{
            color: playerEnvBonus >= 1 ? 'var(--tui-green)' : 'var(--tui-red)',
          }}
        >
          {battleState.player.base.nameKo}: {formatEnvironmentBonus(playerEnvBonus)}
        </span>
        <span
          style={{
            color:
              opponentEnvBonus >= 1 ? 'var(--tui-green)' : 'var(--tui-red)',
          }}
        >
          {battleState.opponent.base.nameKo}: {formatEnvironmentBonus(opponentEnvBonus)}
        </span>
      </div>

      <div
        style={{
          margin: '0.5rem 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <StatusPanel
          arthropod={battleState.player}
          currentHp={currentPlayerHp}
          color="cyan"
        />
        <StatusPanel
          arthropod={battleState.opponent}
          currentHp={currentOpponentHp}
          color="magenta"
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          margin: '0.5rem 0',
        }}
      >
        {displayedLogs.map((entry, index) => {
          const isPlayer = entry.actor === 'player'
          const color = isPlayer ? 'var(--tui-cyan)' : 'var(--tui-magenta)'
          const prefix = isPlayer ? '>' : '<'

          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
              {index === 0 || displayedLogs[index - 1].turn !== entry.turn ? (
                <span style={{ color: 'var(--tui-yellow)' }}>
                  [Turn {entry.turn}]
                </span>
              ) : null}
              <div style={{ display: 'flex' }}>
                <span style={{ color }}>{prefix} </span>
                <span>{entry.action}</span>
              </div>
              {entry.damage !== undefined && entry.damage > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--tui-red)' }}>
                    {' '}
                    -&gt; {entry.damage} damage!
                  </span>
                  {entry.factors && (
                    <span style={{ color: 'var(--tui-gray)', marginLeft: '1rem' }}>
                      {entry.factors.styleMatchup !== 1 && (
                        <span
                          style={{
                            color:
                              entry.factors.styleMatchup > 1
                                ? 'var(--tui-green)'
                                : 'var(--tui-red)',
                          }}
                        >
                          [style:{entry.factors.styleMatchup.toFixed(1)}x]{' '}
                        </span>
                      )}
                      {entry.factors.weightBonus !== 1 && (
                        <span
                          style={{
                            color:
                              entry.factors.weightBonus > 1
                                ? 'var(--tui-green)'
                                : 'var(--tui-red)',
                          }}
                        >
                          [weight:{entry.factors.weightBonus.toFixed(2)}x]{' '}
                        </span>
                      )}
                      {entry.factors.attackerEnvBonus &&
                        entry.factors.attackerEnvBonus !== 1 && (
                          <span
                            style={{
                              color:
                                entry.factors.attackerEnvBonus > 1
                                  ? 'var(--tui-green)'
                                  : 'var(--tui-red)',
                            }}
                          >
                            [env:{entry.factors.attackerEnvBonus.toFixed(2)}x]{' '}
                          </span>
                        )}
                      {entry.factors.critical && (
                        <span style={{ color: 'var(--tui-yellow)' }}>
                          [CRITICAL!]
                        </span>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {finished && (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }}>
          <div
            style={{
              border: '3px double var(--tui-yellow)',
              padding: '0.25rem 1rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {battleState.winner === 'draw' ? (
              <span
                style={{ color: 'var(--tui-yellow)', fontWeight: 'bold' }}
              >
                Draw!
              </span>
            ) : (
              <span style={{ color: 'var(--tui-green)', fontWeight: 'bold' }}>
                Winner:{' '}
                {battleState.winner === 'player'
                  ? battleState.player.base.nameKo
                  : battleState.opponent.base.nameKo}
                !
              </span>
            )}
            <span>Total {battleState.turn} turns</span>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{ color: 'var(--tui-gray)' }}>Press Enter to continue</span>
          </div>
        </div>
      )}

      {isAnimating && (
        <div style={{ marginTop: '0.5rem' }}>
          <span style={{ color: 'var(--tui-gray)' }}>Battle in progress...</span>
        </div>
      )}
    </div>
  )
}
