import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Text, useInput } from 'ink'
import type {
  Arthropod,
  AIDifficulty,
  AIPersonality,
  BattleState,
  BattleLogEntry,
  BattleReplay,
  BattleContext,
  Action,
} from '@super-insect-battle/engine'
import {
  formatEnvironment,
  getEnvironmentBonus,
  formatEnvironmentBonus,
} from '@super-insect-battle/engine'
import { StatusPanel } from './status-panel.js'
import { ActionSelector } from './action-selector.js'
import { ReplaySavePrompt } from './replay-save-prompt.js'
import {
  createInteractiveBattle,
  type ActionResolver,
} from '../simulation/interactive-battle-runner.js'

interface InteractiveBattleViewProps {
  arthropod1: Arthropod
  arthropod2: Arthropod
  aiDifficulty: AIDifficulty
  aiPersonality: AIPersonality
  onFinish: () => void
  onSaveReplay?: (replay: BattleReplay) => void
}

type Phase = 'starting' | 'selecting' | 'animating' | 'finished' | 'replay-prompt'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function InteractiveBattleView({
  arthropod1,
  arthropod2,
  aiDifficulty,
  aiPersonality,
  onFinish,
  onSaveReplay,
}: InteractiveBattleViewProps): React.ReactNode {
  const [phase, setPhase] = useState<Phase>('starting')
  const [battleState, setBattleState] = useState<BattleState | null>(null)
  const [battleContext, setBattleContext] = useState<BattleContext | null>(null)
  const [displayedLogs, setDisplayedLogs] = useState<BattleLogEntry[]>([])
  const [finalReplay, setFinalReplay] = useState<BattleReplay | null>(null)

  const resolverRef = useRef<{ current: ActionResolver | null }>({ current: null })
  const pendingContextRef = useRef<BattleContext | null>(null)
  const animatingRef = useRef(false)
  const logQueueRef = useRef<{ entries: BattleLogEntry[]; finished: boolean }[]>([])
  const displayedCountRef = useRef(0)

  const processQueue = useCallback(async () => {
    if (animatingRef.current) return
    const next = logQueueRef.current.shift()
    if (!next) {
      if (pendingContextRef.current) {
        const ctx = pendingContextRef.current
        pendingContextRef.current = null
        setBattleContext(ctx)
        setPhase('selecting')
      }
      return
    }

    animatingRef.current = true
    setPhase('animating')

    for (const entry of next.entries) {
      setDisplayedLogs((prev) => [...prev, entry])
      await sleep(300)
    }

    animatingRef.current = false

    if (next.finished) {
      setPhase('finished')
      return
    }

    processQueue()
  }, [])

  useEffect(() => {
    const handle = createInteractiveBattle({
      arthropod1,
      arthropod2,
      aiDifficulty,
      aiPersonality,
      callbacks: {
        onTurnStart(state) {
          setBattleState((prev) => prev ?? { ...state })
        },
        onWaitingForAction(context) {
          if (animatingRef.current || logQueueRef.current.length > 0) {
            pendingContextRef.current = context
          } else {
            setBattleContext(context)
            setPhase('selecting')
          }
        },
        onTurnEnd(state) {
          const newEntries = state.log.slice(displayedCountRef.current)
          displayedCountRef.current = state.log.length
          setBattleState({ ...state })

          if (newEntries.length > 0) {
            logQueueRef.current.push({
              entries: newEntries,
              finished: state.status === 'finished',
            })
            processQueue()
          }
        },
        onBattleEnd(state, replay) {
          setBattleState({ ...state })
          setFinalReplay(replay)

          const newEntries = state.log.slice(displayedCountRef.current)
          displayedCountRef.current = state.log.length

          if (newEntries.length > 0) {
            logQueueRef.current.push({
              entries: newEntries,
              finished: true,
            })
            processQueue()
          } else {
            setPhase('finished')
          }
        },
      },
    })
    resolverRef.current = handle.resolverRef
    handle.start()
  }, [arthropod1, arthropod2, aiDifficulty, aiPersonality, processQueue])

  const handleActionSelect = useCallback((action: Action) => {
    if (resolverRef.current.current) {
      resolverRef.current.current(action)
      setBattleContext(null)
    }
  }, [])

  const handleReplaySave = useCallback(
    (replay: BattleReplay) => {
      onSaveReplay?.(replay)
    },
    [onSaveReplay]
  )

  useInput((_input, key) => {
    if (phase === 'finished' && (key.return || key.escape)) {
      if (onSaveReplay && finalReplay) {
        setPhase('replay-prompt')
      } else {
        onFinish()
      }
    }
  })

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

  if (!battleState) {
    return (
      <Box>
        <Text color="yellow">Battle starting...</Text>
      </Box>
    )
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

  if (phase === 'replay-prompt' && finalReplay) {
    return (
      <ReplaySavePrompt
        replay={finalReplay}
        onSave={handleReplaySave}
        onDone={onFinish}
      />
    )
  }

  return (
    <Box flexDirection="column">
      <Box
        borderStyle="double"
        borderColor="yellow"
        paddingX={2}
        justifyContent="center"
      >
        <Text color="cyan">{battleState.player.base.nameKo}</Text>
        <Text> vs </Text>
        <Text color="magenta">{battleState.opponent.base.nameKo}</Text>
        <Text color="gray"> (Turn {battleState.turn})</Text>
      </Box>

      <Box marginY={1} justifyContent="center">
        <Text color="gray">
          환경: {formatEnvironment(battleState.environment)}
        </Text>
      </Box>

      <Box justifyContent="space-between" paddingX={2}>
        <Text color={playerEnvBonus >= 1 ? 'green' : 'red'}>
          {battleState.player.base.nameKo}: {formatEnvironmentBonus(playerEnvBonus)}
        </Text>
        <Text color={opponentEnvBonus >= 1 ? 'green' : 'red'}>
          {battleState.opponent.base.nameKo}: {formatEnvironmentBonus(opponentEnvBonus)}
        </Text>
      </Box>

      <Box marginY={1} flexDirection="column" gap={1}>
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
      </Box>

      <Box flexDirection="column" marginY={1}>
        {displayedLogs.map((entry, index) => {
          const isPlayer = entry.actor === 'player'
          const color = isPlayer ? 'cyan' : 'magenta'
          const prefix = isPlayer ? '▶' : '◀'

          return (
            <Box key={index} flexDirection="column">
              {index === 0 ||
              displayedLogs[index - 1].turn !== entry.turn ? (
                <Text color="yellow">[턴 {entry.turn}]</Text>
              ) : null}
              <Box>
                <Text color={color}>{prefix} </Text>
                <Text>{entry.action}</Text>
              </Box>
              {entry.damage !== undefined && entry.damage > 0 && (
                <Box flexDirection="column">
                  <Text color="red"> → {entry.damage} 데미지!</Text>
                  {entry.factors && (
                    <Text color="gray">
                      {'   '}
                      {entry.factors.styleMatchup !== 1 && (
                        <Text
                          color={
                            entry.factors.styleMatchup > 1 ? 'green' : 'red'
                          }
                        >
                          [style:{entry.factors.styleMatchup.toFixed(1)}x]{' '}
                        </Text>
                      )}
                      {entry.factors.weightBonus !== 1 && (
                        <Text
                          color={
                            entry.factors.weightBonus > 1 ? 'green' : 'red'
                          }
                        >
                          [weight:{entry.factors.weightBonus.toFixed(2)}x]{' '}
                        </Text>
                      )}
                      {entry.factors.attackerEnvBonus &&
                        entry.factors.attackerEnvBonus !== 1 && (
                          <Text
                            color={
                              entry.factors.attackerEnvBonus > 1
                                ? 'green'
                                : 'red'
                            }
                          >
                            [env:{entry.factors.attackerEnvBonus.toFixed(2)}x]{' '}
                          </Text>
                        )}
                      {entry.factors.critical && (
                        <Text color="yellow">[CRITICAL!]</Text>
                      )}
                    </Text>
                  )}
                </Box>
              )}
            </Box>
          )
        })}
      </Box>

      {phase === 'selecting' && battleContext && (
        <ActionSelector
          arthropod={battleContext.self}
          availableActions={battleContext.availableActions}
          onSelect={handleActionSelect}
        />
      )}

      {phase === 'animating' && (
        <Box marginTop={1}>
          <Text color="gray">...</Text>
        </Box>
      )}

      {phase === 'finished' && (
        <Box flexDirection="column" marginTop={1}>
          <Box
            borderStyle="double"
            borderColor="yellow"
            paddingX={2}
            flexDirection="column"
          >
            {battleState.winner === 'draw' ? (
              <Text color="yellow" bold>
                Draw!
              </Text>
            ) : (
              <Text color="green" bold>
                Winner:{' '}
                {battleState.winner === 'player'
                  ? battleState.player.base.nameKo
                  : battleState.opponent.base.nameKo}
                !
              </Text>
            )}
            <Text>{battleState.turn} turns</Text>
          </Box>
          <Box marginTop={1}>
            <Text color="gray">Press Enter to continue</Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}
