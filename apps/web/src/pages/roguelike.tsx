import React, { useEffect, useState } from 'react'
import { arthropodList } from '@super-insect-battle/engine'
import { useRoguelike } from '../hooks/use-roguelike.ts'
import { RoguelikeGame } from '../components/roguelike/roguelike-game.tsx'
import { RoguelikeResult } from '../components/roguelike/roguelike-result.tsx'
import {
  roguelikeApi,
  type DailyInfo,
  type Leaderboard,
} from '../bridge/roguelike-api.ts'
import { Button } from '../components/ui/button.tsx'

export function RoguelikePage(): React.ReactNode {
  const controller = useRoguelike()
  const [speciesId, setSpeciesId] = useState('mantis')
  const [seedText, setSeedText] = useState('')
  const [daily, setDaily] = useState<DailyInfo | null>(null)
  const [dailyBoard, setDailyBoard] = useState<Leaderboard | null>(null)

  useEffect(() => {
    if (controller.run) return
    let alive = true
    void roguelikeApi.getDaily().then((d) => alive && setDaily(d))
    void roguelikeApi
      .getDailyLeaderboard()
      .then((b) => alive && setDailyBoard(b))
    return () => {
      alive = false
    }
  }, [controller.run])

  if (controller.run) {
    return (
      <RoguelikeGame
        controller={controller}
        onExit={controller.reset}
        resultSlot={
          <RoguelikeResult
            run={controller.run}
            dailyDate={controller.dailyDate}
          />
        }
      />
    )
  }

  const startCustom = (): void => {
    const trimmed = seedText.trim()
    const seed =
      trimmed === ''
        ? Math.floor(Math.random() * 1_000_000_000)
        : Number(trimmed)
    controller.newRun({ speciesId, seed: Number.isFinite(seed) ? seed : 0 })
  }

  const startDaily = (): void => {
    if (!daily) return
    controller.newRun({
      speciesId,
      seed: daily.seed,
      dailyDate: daily.date,
    })
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-1 text-lg font-bold">밀림 로그라이크</h1>
      <p className="mb-6 text-xs leading-relaxed text-muted-foreground">
        절차적으로 생성된 밀림을 탐험하며 곤충들과 싸우고 더 깊이 내려가세요.
        같은 시드는 항상 같은 밀림이 됩니다.
      </p>

      <label className="mb-1 block text-xs text-muted-foreground">
        시작 곤충
      </label>
      <select
        value={speciesId}
        onChange={(e) => setSpeciesId(e.target.value)}
        className="mb-4 w-full rounded-md border border-table-border bg-table-row-even px-3 py-2 text-sm"
      >
        {arthropodList.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nameKo} ({a.name})
          </option>
        ))}
      </select>

      <div className="mb-6 rounded-md border border-purple-500/30 bg-purple-500/[0.06] p-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-purple-300">
            오늘의 도전
          </span>
          {daily && (
            <span className="text-[11px] text-muted-foreground">
              {daily.date}
            </span>
          )}
        </div>
        <p className="mb-2 text-[11px] text-muted-foreground">
          모두가 같은 시드로 경쟁하는 데일리 챌린지. 결과가 리더보드에 오릅니다.
        </p>
        <Button
          onClick={startDaily}
          disabled={!daily}
          variant="secondary"
          className="w-full"
        >
          {daily ? '데일리 도전 시작' : '서버 미연결'}
        </Button>

        {dailyBoard && dailyBoard.runs.length > 0 && (
          <ol className="mt-3 divide-y divide-white/5 text-[11px]">
            {dailyBoard.runs.slice(0, 5).map((r, i) => (
              <li key={i} className="flex justify-between py-1">
                <span className="truncate">
                  <span className="mr-1 text-muted-foreground">{i + 1}.</span>
                  {r.name} · {r.depth}층
                </span>
                <span className="tabular-nums text-amber-400">
                  {r.score.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <label className="mb-1 block text-xs text-muted-foreground">
        자유 시드 (비우면 랜덤)
      </label>
      <input
        value={seedText}
        onChange={(e) => setSeedText(e.target.value.replace(/[^0-9]/g, ''))}
        placeholder="예: 12345"
        inputMode="numeric"
        className="mb-3 w-full rounded-md border border-table-border bg-table-row-even px-3 py-2 text-sm"
      />
      <Button onClick={startCustom} className="w-full">
        런 시작
      </Button>

      <p className="mt-4 text-[11px] text-muted-foreground">
        조작: 이동 방향키·hjkl(대각 yubn) · 스킬 숫자키 · 대기 <kbd>.</kbd>
      </p>
    </div>
  )
}
