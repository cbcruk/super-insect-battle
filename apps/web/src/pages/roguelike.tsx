import React, { useState } from 'react'
import { arthropodList } from '@super-insect-battle/engine'
import { useRoguelike } from '../hooks/use-roguelike.ts'
import { RoguelikeGame } from '../components/roguelike/roguelike-game.tsx'
import { Button } from '../components/ui/button.tsx'

export function RoguelikePage(): React.ReactNode {
  const controller = useRoguelike()
  const [speciesId, setSpeciesId] = useState('mantis')
  const [seedText, setSeedText] = useState('')

  if (controller.run) {
    return <RoguelikeGame controller={controller} onExit={controller.reset} />
  }

  const start = (): void => {
    const trimmed = seedText.trim()
    const seed =
      trimmed === ''
        ? Math.floor(Math.random() * 1_000_000_000)
        : Number(trimmed)
    controller.newRun({ speciesId, seed: Number.isFinite(seed) ? seed : 0 })
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

      <label className="mb-1 block text-xs text-muted-foreground">
        시드 (비우면 랜덤)
      </label>
      <input
        value={seedText}
        onChange={(e) => setSeedText(e.target.value.replace(/[^0-9]/g, ''))}
        placeholder="예: 12345"
        inputMode="numeric"
        className="mb-6 w-full rounded-md border border-table-border bg-table-row-even px-3 py-2 text-sm"
      />

      <Button onClick={start} className="w-full">
        런 시작
      </Button>

      <p className="mt-4 text-[11px] text-muted-foreground">
        조작: 이동 방향키·hjkl(대각 yubn) · 스킬 숫자키 · 대기 <kbd>.</kbd>
      </p>
    </div>
  )
}
