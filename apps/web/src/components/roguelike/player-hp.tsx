import React, { useEffect, useRef } from 'react'
import type { HurtPulse } from '../../hooks/use-roguelike.ts'
import { cn } from '../../lib/utils.ts'
import { replayAnimation } from '../../lib/replay-animation.ts'

/**
 * 플레이어 HP 바. 줄어든 양을 잔상으로 잠시 남기고, 남은 비율에 따라 색이 바뀐다.
 *
 * 피격 신호(`hurt.key`)가 바뀔 때마다 바를 흔들고 직전 피해량을 띄운다.
 */
export function PlayerHp({
  name,
  hp,
  maxHp,
  hurt,
}: {
  name: string
  hp: number
  maxHp: number
  hurt: HurtPulse
}): React.ReactNode {
  const rootRef = useRef<HTMLDivElement>(null)
  const pct = Math.max(0, Math.round((hp / maxHp) * 100))

  useEffect(() => {
    if (hurt.key === 0) return
    replayAnimation(rootRef.current, 'animate-hp-shake')
  }, [hurt.key])

  return (
    <div ref={rootRef}>
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-medium text-cyan-400">{name}</span>
        <span className="flex items-center gap-1.5 tabular-nums">
          {hurt.key > 0 && (
            <span
              key={hurt.key}
              className="animate-hurt-vignette font-bold text-red-400"
              style={{ animationDuration: '1.2s' }}
            >
              -{hurt.damage}
            </span>
          )}
          <span
            className={cn(pct <= 25 ? 'text-red-400' : 'text-muted-foreground')}
          >
            {hp}/{maxHp}
          </span>
        </span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-table-row-even">
        <div
          className="absolute inset-y-0 left-0 bg-red-300/70 transition-[width] delay-300 duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
        <div
          className={cn(
            'absolute inset-y-0 left-0 transition-[width,background-color] duration-150',
            pct > 50
              ? 'bg-emerald-500'
              : pct > 25
                ? 'bg-amber-400'
                : 'bg-red-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
