import React, { useEffect, useRef } from 'react'
import type { Direction } from '@super-insect-battle/roguelike'
import {
  getActionsByIds,
  getActionTargeting,
  getActionRange,
  getCooldownRemaining,
} from '@super-insect-battle/engine'
import type { RoguelikeController } from '../../hooks/use-roguelike.ts'
import { drawRoguelike, CELL_SIZE } from '../../lib/roguelike-render.ts'
import { Button } from '../ui/button.tsx'
import { cn } from '../../lib/utils.ts'

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
  resultSlot,
}: {
  controller: RoguelikeController
  onExit: () => void
  resultSlot?: React.ReactNode
}): React.ReactNode {
  const { run, version, notice, dispatch, useAbility } = controller
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !run) return
    const cell = CELL_SIZE
    const w = run.level.map.width * cell
    const h = run.level.map.height * cell
    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawRoguelike(ctx, run, cell)
  }, [run, version])

  if (!run) return null

  const player = run.player
  const abilities = getActionsByIds(player.combat.actions)
  const hpPct = Math.round(
    (player.combat.currentHp / player.combat.maxHp) * 100
  )

  const handleKey = (e: React.KeyboardEvent): void => {
    if (run.status !== 'playing') return
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
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            밀림 {run.level.depth}층 / {run.maxDepth} · 턴 {run.turn}
          </span>
          <span className="hidden sm:inline">
            이동 방향키·hjkl · 스킬 숫자 · 대기 .
          </span>
        </div>
        <div className="relative overflow-auto rounded-md border border-table-border bg-[#070809]">
          <canvas ref={canvasRef} className="block" />
          {run.status !== 'playing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-auto bg-black/80 p-4">
              <div
                className={cn(
                  'text-2xl font-bold',
                  run.status === 'won' ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {run.status === 'won' ? '밀림 탈출 성공!' : '쓰러졌다...'}
              </div>
              {resultSlot}
              <Button onClick={onExit}>새 런</Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 lg:w-72">
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium text-cyan-400">
              {player.species.nameKo}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {player.combat.currentHp}/{player.combat.maxHp}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-table-row-even">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${hpPct}%` }}
            />
          </div>
        </div>

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

        {notice && (
          <div className="rounded bg-amber-500/10 px-2 py-1 text-[11px] text-amber-400">
            {notice}
          </div>
        )}

        <div className="max-h-64 flex-1 overflow-y-auto rounded-md border border-table-border bg-table-row-even p-2 text-[11px] leading-relaxed text-muted-foreground">
          {run.log.slice(-14).map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
