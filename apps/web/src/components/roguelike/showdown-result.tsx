import React from 'react'
import {
  showdownPlacement,
  showdownWinner,
  type RunState,
} from '@super-insect-battle/roguelike'

/** 끝난 쇼다운의 순위·처치·큐브·버틴 턴과, 가려졌다면 우승 곤충을 보여준다. */
export function ShowdownResult({ run }: { run: RunState }): React.ReactNode {
  const { stats } = run
  const winner = showdownWinner(run)
  const rows: [string, string][] = [
    ['처치', `${stats.kills}`],
    ['모은 큐브', `${stats.cubesCollected}`],
    ['버틴 턴', `${stats.endTurn ?? run.turn}`],
  ]

  return (
    <div className="w-60 max-w-full rounded-md border border-white/10 bg-black/60 p-3 text-left">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">순위</span>
        <span className="text-2xl font-bold tabular-nums text-amber-400">
          {showdownPlacement(run)}위
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-y-1 text-[11px]">
        {rows.map(([label, value]) => (
          <React.Fragment key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right tabular-nums">{value}</dd>
          </React.Fragment>
        ))}
      </dl>
      {winner && (
        <div className="mt-2 border-t border-white/10 pt-2 text-[11px] text-muted-foreground">
          우승: <span className="text-foreground">{winner.species.nameKo}</span>
        </div>
      )}
    </div>
  )
}
