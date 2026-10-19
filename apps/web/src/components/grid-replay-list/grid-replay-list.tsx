import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../ui/button.tsx'
import { deleteGridReplay, loadGridReplays } from '../../lib/grid-replays.ts'
import type { SavedGridReplay } from '../../lib/grid-replays.types.ts'

/** 저장된 격자 매치업 리플레이 목록. 재생하면 아레나 화면으로 넘어간다. */
export function GridReplayList(): React.ReactNode {
  const navigate = useNavigate()
  const [replays, setReplays] = useState<SavedGridReplay[]>(() =>
    loadGridReplays(localStorage)
  )

  function handleDelete(id: string): void {
    try {
      deleteGridReplay(localStorage, id)
    } catch {
      return
    }
    setReplays(loadGridReplays(localStorage))
  }

  return (
    <section className="mt-8">
      <h2 className="mb-2 text-sm font-semibold">격자 매치업</h2>
      {replays.length === 0 ? (
        <p className="rounded-md border border-table-border bg-table-row-even px-4 py-6 text-center text-xs text-muted-foreground">
          격자 아레나 결과 화면에서 &quot;리플레이 저장&quot;을 누르면 여기에
          쌓입니다.
        </p>
      ) : (
        <ul className="divide-y divide-table-border rounded-md border border-table-border bg-table-row-even text-sm">
          {replays.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-4 py-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {new Date(r.timestamp).toLocaleString()}
              </span>
              <span className="flex-1">
                <span className="text-cyan-400">{r.playerName}</span>
                <span className="mx-1.5 text-muted-foreground">vs</span>
                <span className="text-pink-400">{r.opponentName}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {r.replay.autopilot ? 'AI 대 AI' : '직접 조종'} ·{' '}
                  {r.totalTurns}턴 · {r.winnerName} 승
                </span>
              </span>
              <Button
                size="sm"
                onClick={() =>
                  navigate(`/arena?replay=${encodeURIComponent(r.id)}`)
                }
              >
                Play
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(r.id)}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
