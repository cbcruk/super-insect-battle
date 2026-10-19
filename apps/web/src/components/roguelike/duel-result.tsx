import React from 'react'
import type { RunState } from '@super-insect-battle/roguelike'
import { duelWinner } from '../../lib/duel-winner.ts'

/** 끝난 격자 매치업의 승패·걸린 턴·남은 HP를 보여준다. */
export function DuelResult({ run }: { run: RunState }): React.ReactNode {
  const winner = duelWinner(run)
  const rows: [string, string][] = [
    ['걸린 턴', `${run.stats.endTurn ?? run.turn}`],
  ]
  if (winner) {
    rows.push([
      '남은 HP',
      `${winner.combat.currentHp} / ${winner.combat.maxHp}`,
    ])
  }

  return (
    <div className="w-60 max-w-full rounded-md border border-white/10 bg-black/60 p-3 text-left">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">승자</span>
        <span className="text-lg font-bold text-amber-400">
          {winner?.species.nameKo ?? '무승부'}
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
    </div>
  )
}
