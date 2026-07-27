import React, { useEffect, useState } from 'react'
import type { RunState } from '@super-insect-battle/roguelike'
import {
  roguelikeApi,
  localScore,
  type Leaderboard,
} from '../../bridge/roguelike-api.ts'
import { Button } from '../ui/button.tsx'

export function RoguelikeResult({
  run,
  dailyDate,
}: {
  run: RunState
  dailyDate: string | null
}): React.ReactNode {
  const outcome = run.status === 'won' ? 'won' : 'dead'
  const seed = run.seed
  const depth = run.level.depth
  const turns = run.turn
  const species = run.player.species.id
  const score = localScore(depth, turns, outcome)

  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [board, setBoard] = useState<Leaderboard | null>(null)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    let alive = true
    void roguelikeApi.getLeaderboard(seed).then((b) => {
      if (!alive) return
      if (b) setBoard(b)
      else setOffline(true)
    })
    return () => {
      alive = false
    }
  }, [seed])

  const submit = async (): Promise<void> => {
    setSubmitting(true)
    const res = await roguelikeApi.submitRun({
      seed,
      dailyDate,
      name,
      species,
      depth,
      turns,
      outcome,
    })
    if (res) {
      setSubmitted(true)
      const b = await roguelikeApi.getLeaderboard(seed)
      if (b) setBoard(b)
    } else {
      setOffline(true)
    }
    setSubmitting(false)
  }

  return (
    <div className="w-72 max-w-full rounded-md border border-white/10 bg-black/60 p-3 text-left">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">점수</span>
        <span className="text-xl font-bold tabular-nums text-amber-400">
          {score.toLocaleString()}
        </span>
      </div>
      <div className="mb-3 text-[11px] text-muted-foreground">
        {depth}층 도달 · {turns}턴 · {outcome === 'won' ? '탈출' : '전멸'}
        {dailyDate && (
          <span className="text-purple-400"> · 데일리 {dailyDate}</span>
        )}
      </div>

      {offline ? (
        <div className="mb-3 rounded bg-amber-500/10 px-2 py-1 text-[11px] text-amber-400">
          리더보드 서버 미연결 (오프라인 플레이)
        </div>
      ) : !submitted ? (
        <div className="mb-3 flex gap-1.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 24))}
            placeholder="이름"
            className="min-w-0 flex-1 rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-xs"
          />
          <Button size="sm" onClick={submit} disabled={submitting}>
            {submitting ? '등록 중' : '순위 등록'}
          </Button>
        </div>
      ) : (
        <div className="mb-3 text-[11px] text-emerald-400">순위 등록 완료!</div>
      )}

      {board && board.runs.length > 0 && (
        <div className="overflow-hidden rounded border border-table-border">
          <div className="bg-table-header px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            {dailyDate ? '데일리 순위' : '이 시드 순위'}
          </div>
          <ol className="divide-y divide-white/5 text-[11px]">
            {board.runs.slice(0, 8).map((r, i) => (
              <li
                key={i}
                className="flex items-center justify-between px-2 py-1"
              >
                <span className="truncate">
                  <span className="mr-1 text-muted-foreground">{i + 1}.</span>
                  {r.name}
                </span>
                <span className="tabular-nums text-amber-400">
                  {r.score.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
