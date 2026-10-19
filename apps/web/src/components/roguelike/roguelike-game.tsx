import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  assessThreat,
  visibleEnemies,
  type Direction,
  type ThreatLevel,
} from '@super-insect-battle/roguelike'
import {
  getActionsByIds,
  getActionTargeting,
  getActionRange,
  getCooldownRemaining,
} from '@super-insect-battle/engine'
import type { RoguelikeController } from '../../hooks/use-roguelike.ts'
import { CELL_SIZE } from '../../lib/roguelike-cell.ts'
import { RoguelikeStage } from '../../lib/roguelike-stage.ts'
import { Button } from '../ui/button.tsx'
import { cn } from '../../lib/utils.ts'
import { replayAnimation } from '../../lib/replay-animation.ts'
import { EnemyPanel, type SightedEnemy } from './enemy-panel.tsx'
import { CombatEffects } from './combat-effects.tsx'
import { CombatFeed } from './combat-feed.tsx'
import { PlayerHp } from './player-hp.tsx'
import { outcomeTitle, progressLabel } from './roguelike-game.utils.ts'

const SPECTATE_STEP_MS = 450

const KEY_DIR: Record<string, Direction> = {
  ArrowUp: 'n',
  ArrowDown: 's',
  ArrowLeft: 'w',
  ArrowRight: 'e',
  k: 'n',
  j: 's',
  h: 'w',
  l: 'e',
  y: 'nw',
  u: 'ne',
  b: 'sw',
  n: 'se',
}

export function RoguelikeGame({
  controller,
  onExit,
  exitLabel = '새 런',
  resultSlot,
  feedSlot,
}: {
  controller: RoguelikeController
  onExit: () => void
  /** 결과 화면 버튼 문구. */
  exitLabel?: string
  resultSlot?: React.ReactNode
  /** 전투 로그 자리에 대신 놓을 내용. 없으면 기본 전투 로그. */
  feedSlot?: React.ReactNode
}): React.ReactNode {
  const {
    run,
    version,
    notice,
    feed,
    effects,
    motions,
    falls,
    facings,
    hurt,
    dispatch,
    useAbility,
    spectating,
    spectate,
    skipSpectate,
    autoplaying,
    autoStep,
  } = controller
  const stageHostRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState<RoguelikeStage | null>(null)
  const lastEffectId = useRef(-1)
  const lastMotionId = useRef(-1)
  const lastFallId = useRef(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hurt.key === 0) return
    replayAnimation(
      mapRef.current,
      hurt.heavy ? 'animate-screen-shake-heavy' : 'animate-screen-shake'
    )
  }, [hurt])

  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!spectating) return
    const timer = window.setTimeout(spectate, SPECTATE_STEP_MS)
    return () => window.clearTimeout(timer)
  }, [spectating, spectate, version])

  useEffect(() => {
    if (!autoplaying) return
    const timer = window.setTimeout(autoStep, SPECTATE_STEP_MS)
    return () => window.clearTimeout(timer)
  }, [autoplaying, autoStep, version])

  const sighted = useMemo<SightedEnemy[]>(() => {
    if (!run || run.status !== 'playing') return []
    return visibleEnemies(run).map((actor) => ({
      actor,
      threat: assessThreat(run.player, actor, run.level.environment),
    }))
  }, [run, version])

  const threatLevels = useMemo(
    () =>
      new Map<string, ThreatLevel>(
        sighted.map(({ actor, threat }) => [actor.id, threat.level])
      ),
    [sighted]
  )

  useEffect(() => {
    const host = stageHostRef.current
    if (!host) return
    let cancelled = false
    let created: RoguelikeStage | null = null
    void RoguelikeStage.create(host, CELL_SIZE).then((s) => {
      if (cancelled) {
        s.destroy()
        return
      }
      created = s
      setStage(s)
    })
    return () => {
      cancelled = true
      created?.destroy()
      setStage(null)
    }
  }, [])

  useEffect(() => {
    if (stage && run) stage.draw(run, threatLevels, facings)
  }, [stage, run, version, threatLevels, facings])

  useEffect(() => {
    for (const effect of effects) {
      if (effect.id <= lastEffectId.current) continue
      lastEffectId.current = effect.id
      stage?.playHit(effect)
    }
  }, [stage, effects])

  useEffect(() => {
    for (const motion of motions) {
      if (motion.id <= lastMotionId.current) continue
      lastMotionId.current = motion.id
      stage?.playMotion(motion)
    }
  }, [stage, motions])

  useEffect(() => {
    for (const fall of falls) {
      if (fall.id <= lastFallId.current) continue
      lastFallId.current = fall.id
      stage?.playFall(fall)
    }
  }, [stage, falls])

  if (!run) return null

  const player = run.player
  const abilities = getActionsByIds(player.combat.actions)
  const lowHp = player.combat.currentHp / player.combat.maxHp <= 0.25

  const handleKey = (e: React.KeyboardEvent): void => {
    if (spectating && e.key === 'f') {
      e.preventDefault()
      skipSpectate()
      return
    }
    if (run.status !== 'playing' || autoplaying) return
    const key = e.key
    if (KEY_DIR[key]) {
      e.preventDefault()
      dispatch({ type: 'move', dir: KEY_DIR[key] })
    } else if (key === '.' || key === ' ') {
      e.preventDefault()
      dispatch({ type: 'wait' })
    } else if (/^[1-9]$/.test(key)) {
      e.preventDefault()
      useAbility(Number(key) - 1)
    }
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKey}
      className="flex max-w-6xl flex-col gap-4 p-4 outline-none lg:flex-row"
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            {progressLabel(run)} · 턴 {run.turn}
          </span>
          {autoplaying ? (
            <span>AI 대 AI 관전 중</span>
          ) : (
            <span className="hidden sm:inline">
              이동 방향키·hjkl · 스킬 숫자 · 대기 .
            </span>
          )}
        </div>
        <div
          ref={mapRef}
          className="relative overflow-auto rounded-md border border-table-border bg-[#070809]"
        >
          <div className="relative w-fit">
            <div ref={stageHostRef} />
            <CombatEffects effects={effects} cell={CELL_SIZE} />
          </div>
          {lowHp && run.status === 'playing' && (
            <div className="pointer-events-none absolute inset-0 animate-pulse shadow-[inset_0_0_48px_rgba(239,68,68,0.45)]" />
          )}
          {hurt.key > 0 && (
            <div
              key={hurt.key}
              className="pointer-events-none absolute inset-0 animate-hurt-vignette shadow-[inset_0_0_64px_rgba(239,68,68,0.7)]"
            />
          )}
          {spectating && (
            <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-black/70 px-3 py-2 text-xs">
              <span className="text-red-400">
                {outcomeTitle(run)} · 관전 중
              </span>
              <Button size="sm" variant="secondary" onClick={skipSpectate}>
                끝까지 건너뛰기 (f)
              </Button>
            </div>
          )}
          {run.status !== 'playing' && !spectating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-auto bg-black/80 p-4">
              <div
                className={cn(
                  'text-2xl font-bold',
                  run.status === 'won' ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {outcomeTitle(run)}
              </div>
              {resultSlot}
              <Button onClick={onExit}>{exitLabel}</Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 lg:w-72">
        <PlayerHp
          name={player.species.nameKo}
          hp={player.combat.currentHp}
          maxHp={player.combat.maxHp}
          hurt={hurt}
        />

        <div className="grid grid-cols-2 gap-1.5">
          {abilities.map((action, i) => {
            const targeting = getActionTargeting(action)
            const tag =
              targeting === 'self'
                ? '자신'
                : targeting === 'ranged'
                  ? `원${getActionRange(action)}`
                  : '근접'
            const cd = getCooldownRemaining(player.combat, action.id)
            return (
              <button
                key={action.id}
                onClick={() => useAbility(i)}
                disabled={cd > 0 || run.status !== 'playing'}
                className="flex flex-col items-start rounded border border-white/10 bg-white/[0.02] px-2 py-1 text-left text-[11px] transition-colors hover:bg-white/[0.06] disabled:opacity-40"
              >
                <span className="font-medium">
                  <span className="text-purple-400">{i + 1}</span>{' '}
                  {action.nameKo}
                </span>
                <span className="text-muted-foreground">
                  {tag}
                  {cd > 0 ? ` · CD${cd}` : ''}
                </span>
              </button>
            )
          })}
        </div>

        <EnemyPanel enemies={sighted} />

        {notice && (
          <div className="rounded bg-amber-500/10 px-2 py-1 text-[11px] text-amber-400">
            {notice}
          </div>
        )}

        {feedSlot ?? <CombatFeed lines={feed} />}
      </div>
    </div>
  )
}
