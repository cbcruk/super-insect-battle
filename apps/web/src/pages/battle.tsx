import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { simulateBattle, serializeReplay, getArthropodById } from '@super-insect-battle/engine'
import type { BattleState, BattleLogEntry, Action, Arthropod, AIDifficulty, AIPersonality } from '@super-insect-battle/engine'
import { BattleScene } from '../components/battle-scene/battle-scene.tsx'
import { ActionPanel } from '../components/battle-scene/action-panel/action-panel.tsx'
import { useGameStore } from '../stores/game-store.ts'
import { useBattleStore } from '../stores/battle-store.ts'
import { useBattleEffects } from '../hooks/use-battle-effects.ts'
import type { BattleMode } from '../stores/game-store.types.ts'

const LOG_DELAY_MS = 800
const REPLAY_STORAGE_KEY = 'sib-replays'

interface BattleParams {
  player: Arthropod | null
  opponent: Arthropod | null
  mode: BattleMode
  difficulty: AIDifficulty
  personality: AIPersonality
  error: string | null
}

function useBattleParams(): BattleParams {
  const [searchParams] = useSearchParams()
  const storePlayer = useGameStore((s) => s.selectedPlayer)
  const storeOpponent = useGameStore((s) => s.selectedOpponent)
  const storeMode = useGameStore((s) => s.battleMode)
  const storeAiConfig = useGameStore((s) => s.aiConfig)

  return useMemo(() => {
    const playerParam = searchParams.get('player')
    const opponentParam = searchParams.get('opponent')
    const modeParam = searchParams.get('mode')
    const difficultyParam = searchParams.get('difficulty')
    const personalityParam = searchParams.get('personality')

    const errors: string[] = []

    let player: Arthropod | null = storePlayer
    if (playerParam) {
      player = getArthropodById(playerParam) ?? null
      if (!player) {
        errors.push(`Invalid player ID: "${playerParam}"`)
      }
    }

    let opponent: Arthropod | null = storeOpponent
    if (opponentParam) {
      opponent = getArthropodById(opponentParam) ?? null
      if (!opponent) {
        errors.push(`Invalid opponent ID: "${opponentParam}"`)
      }
    }

    const validModes: BattleMode[] = ['ai-vs-ai', 'player-vs-ai']
    const mode = modeParam && validModes.includes(modeParam as BattleMode)
      ? (modeParam as BattleMode)
      : storeMode

    const validDifficulties: AIDifficulty[] = ['easy', 'medium', 'hard']
    const difficulty = difficultyParam && validDifficulties.includes(difficultyParam as AIDifficulty)
      ? (difficultyParam as AIDifficulty)
      : storeAiConfig.difficulty

    const validPersonalities: AIPersonality[] = ['aggressive', 'defensive', 'balanced']
    const personality = personalityParam && validPersonalities.includes(personalityParam as AIPersonality)
      ? (personalityParam as AIPersonality)
      : storeAiConfig.personality

    return {
      player,
      opponent,
      mode,
      difficulty,
      personality,
      error: errors.length > 0 ? errors.join(', ') : null,
    }
  }, [searchParams, storePlayer, storeOpponent, storeMode, storeAiConfig])
}

export function BattlePage(): React.ReactNode {
  const navigate = useNavigate()
  const { player, opponent, mode, difficulty, personality, error } = useBattleParams()

  useEffect(() => {
    if (!error && !player && !opponent) {
      navigate('/')
    }
  }, [player, opponent, error, navigate])

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <div className="text-destructive text-lg font-semibold">Error</div>
        <div className="text-muted-foreground text-center">{error}</div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 rounded-lg bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Go to Setup
        </button>
      </div>
    )
  }

  if (!player || !opponent) return null

  if (mode === 'ai-vs-ai') {
    return (
      <AiVsAiBattle
        player={player}
        opponent={opponent}
        onClose={() => navigate('/')}
      />
    )
  }

  return (
    <InteractiveBattle
      player={player}
      opponent={opponent}
      aiDifficulty={difficulty}
      aiPersonality={personality}
      onClose={() => navigate('/')}
    />
  )
}

function AiVsAiBattle({
  player,
  opponent,
  onClose,
}: {
  player: Arthropod
  opponent: Arthropod
  onClose: () => void
}): React.ReactNode {

  const [battleState, setBattleState] = useState<BattleState | null>(null)
  const [displayedLogs, setDisplayedLogs] = useState<BattleLogEntry[]>([])
  const [displayedPlayerHp, setDisplayedPlayerHp] = useState(0)
  const [displayedOpponentHp, setDisplayedOpponentHp] = useState(0)
  const [replayDone, setReplayDone] = useState(false)
  const replayAbortRef = useRef(false)

  const effects = useBattleEffects()

  useEffect(() => {
    const result = simulateBattle(player, opponent)
    setBattleState(result)
    setDisplayedPlayerHp(result.player.maxHp)
    setDisplayedOpponentHp(result.opponent.maxHp)
    setDisplayedLogs([])
    setReplayDone(false)
    replayAbortRef.current = false
    effects.reset()

    replayLogs(result)

    return (): void => {
      replayAbortRef.current = true
    }
  }, [player, opponent])

  const replayLogs = useCallback(async (result: BattleState): Promise<void> => {
    for (let i = 0; i < result.log.length; i++) {
      if (replayAbortRef.current) return
      await new Promise<void>((resolve) => setTimeout(resolve, LOG_DELAY_MS))
      if (replayAbortRef.current) return

      const entry = result.log[i]
      effects.triggerEffectsFromLog(entry)
      setDisplayedLogs((prev) => [...prev, entry])

      if (entry.remainingHp) {
        setDisplayedPlayerHp(entry.remainingHp.player)
        setDisplayedOpponentHp(entry.remainingHp.opponent)
      }
    }
    setReplayDone(true)
  }, [effects])

  if (!battleState) return null

  const lastLog = displayedLogs[displayedLogs.length - 1]
  const currentTurn = lastLog?.turn ?? 1
  const winner = replayDone ? battleState.winner : null

  return (
    <div className="h-full">
      <BattleScene
        player={player}
        opponent={opponent}
        playerBattle={battleState.player}
        opponentBattle={battleState.opponent}
        environment={battleState.environment}
        displayedPlayerHp={displayedPlayerHp}
        displayedOpponentHp={displayedOpponentHp}
        displayedLogs={displayedLogs}
        turnNumber={currentTurn}
        winner={winner}
        finished={replayDone}
        onClose={onClose}
        damagePopups={effects.damagePopups}
        actionTexts={effects.actionTexts}
        blockParticles={effects.blockParticles}
        onDamagePopupComplete={effects.removeDamagePopup}
        onActionTextComplete={effects.removeActionText}
        onBlockParticleComplete={effects.removeBlockParticle}
        playerHpEmphasis={effects.playerHpEmphasis}
        opponentHpEmphasis={effects.opponentHpEmphasis}
        onPlayerHpEmphasisComplete={effects.clearPlayerHpEmphasis}
        onOpponentHpEmphasisComplete={effects.clearOpponentHpEmphasis}
        screenShake={effects.screenShake}
        screenFlash={effects.screenFlash}
        onScreenEffectComplete={effects.clearScreenEffects}
      />
    </div>
  )
}

function InteractiveBattle({
  player,
  opponent,
  aiDifficulty,
  aiPersonality,
  onClose,
}: {
  player: Arthropod
  opponent: Arthropod
  aiDifficulty: AIDifficulty
  aiPersonality: AIPersonality
  onClose: () => void
}): React.ReactNode {

  const phase = useBattleStore((s) => s.phase)
  const battleState = useBattleStore((s) => s.battleState)
  const battleContext = useBattleStore((s) => s.battleContext)
  const startInteractiveBattle = useBattleStore((s) => s.startInteractiveBattle)
  const selectAction = useBattleStore((s) => s.selectAction)
  const reset = useBattleStore((s) => s.reset)

  const finalReplay = useBattleStore((s) => s.finalReplay)

  const [displayedLogs, setDisplayedLogs] = useState<BattleLogEntry[]>([])
  const [displayedPlayerHp, setDisplayedPlayerHp] = useState(0)
  const [displayedOpponentHp, setDisplayedOpponentHp] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [replaySaved, setReplaySaved] = useState(false)

  const prevLogLenRef = useRef(0)
  const hpInitializedRef = useRef(false)

  const effects = useBattleEffects()

  useEffect(() => {
    reset()
    effects.reset()
    hpInitializedRef.current = false
    prevLogLenRef.current = 0
    setDisplayedLogs([])
    setDisplayedPlayerHp(0)
    setDisplayedOpponentHp(0)

    startInteractiveBattle({
      player,
      opponent,
      aiDifficulty,
      aiPersonality,
    })

    return (): void => {
      reset()
    }
  }, [player, opponent, aiDifficulty, aiPersonality])

  useEffect(() => {
    if (!battleState) return
    if (!hpInitializedRef.current) {
      hpInitializedRef.current = true
      setDisplayedPlayerHp(battleState.player.maxHp)
      setDisplayedOpponentHp(battleState.opponent.maxHp)
    }
  }, [battleState])

  const logLen = battleState?.log.length ?? 0

  useEffect(() => {
    if (!battleState) return
    const newLogs = battleState.log.slice(prevLogLenRef.current)
    if (newLogs.length === 0) return

    prevLogLenRef.current = battleState.log.length
    setAnimating(true)

    let cancelled = false
    ;(async (): Promise<void> => {
      for (const entry of newLogs) {
        if (cancelled) return
        await new Promise<void>((r) => setTimeout(r, LOG_DELAY_MS))
        if (cancelled) return

        effects.triggerEffectsFromLog(entry)
        setDisplayedLogs((prev) => [...prev, entry])
        if (entry.remainingHp) {
          setDisplayedPlayerHp(entry.remainingHp.player)
          setDisplayedOpponentHp(entry.remainingHp.opponent)
        }
      }
      if (!cancelled) setAnimating(false)
    })()

    return (): void => {
      cancelled = true
    }
  }, [logLen, effects])

  function handleSelectAction(action: Action): void {
    selectAction(action)
  }

  function handleClose(): void {
    reset()
    onClose()
  }

  function handleSaveReplay(): void {
    if (!finalReplay) return
    try {
      const raw = localStorage.getItem(REPLAY_STORAGE_KEY)
      const existing = raw ? (JSON.parse(raw) as unknown[]) : []
      const entry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        playerName: player.nameKo,
        opponentName: opponent.nameKo,
        winner: finalReplay.winner,
        totalTurns: finalReplay.turns.length,
        data: serializeReplay(finalReplay),
      }
      localStorage.setItem(REPLAY_STORAGE_KEY, JSON.stringify([entry, ...existing]))
      setReplaySaved(true)
    } catch {
      // storage full or unavailable
    }
  }

  function handleDownloadReplay(): void {
    if (!finalReplay) return
    const data = serializeReplay(finalReplay)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `replay-${player.id}-vs-${opponent.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isSelecting = phase === 'selecting' && !animating

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (!isSelecting || !battleContext) return
      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= battleContext.availableActions.length) {
        const action = battleContext.availableActions[num - 1]
        const cd = battleState?.player.actionCooldowns[action.id] ?? 0
        if (cd <= 0) {
          handleSelectAction(action)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSelecting, battleContext, battleState])

  const turnNumber = battleState?.turn ?? 1
  const winner = phase === 'finished' ? (battleState?.winner ?? null) : null

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <BattleScene
          player={player}
          opponent={opponent}
          playerBattle={battleState?.player ?? null}
          opponentBattle={battleState?.opponent ?? null}
          environment={battleState?.environment ?? { terrain: 'forest', weather: 'clear', timeOfDay: 'day' }}
          displayedPlayerHp={displayedPlayerHp}
          displayedOpponentHp={displayedOpponentHp}
          displayedLogs={displayedLogs}
          turnNumber={turnNumber}
          winner={winner}
          finished={phase === 'finished'}
          onClose={handleClose}
          onSaveReplay={finalReplay ? handleSaveReplay : undefined}
          onDownloadReplay={finalReplay ? handleDownloadReplay : undefined}
          replaySaved={replaySaved}
          damagePopups={effects.damagePopups}
          actionTexts={effects.actionTexts}
          blockParticles={effects.blockParticles}
          onDamagePopupComplete={effects.removeDamagePopup}
          onActionTextComplete={effects.removeActionText}
          onBlockParticleComplete={effects.removeBlockParticle}
          playerHpEmphasis={effects.playerHpEmphasis}
          opponentHpEmphasis={effects.opponentHpEmphasis}
          onPlayerHpEmphasisComplete={effects.clearPlayerHpEmphasis}
          onOpponentHpEmphasisComplete={effects.clearOpponentHpEmphasis}
          screenShake={effects.screenShake}
          screenFlash={effects.screenFlash}
          onScreenEffectComplete={effects.clearScreenEffects}
        />
      </div>

      {battleContext && battleState && (
        <div className="p-4">
          <ActionPanel
            actions={battleContext.availableActions}
            player={battleState.player}
            onSelectAction={handleSelectAction}
            disabled={!isSelecting}
          />
        </div>
      )}
    </div>
  )
}
