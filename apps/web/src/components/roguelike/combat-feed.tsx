import React, { useEffect, useRef } from 'react'
import type { FeedLine, FeedTone } from '../../lib/combat-feedback.types.ts'
import { cn } from '../../lib/utils.ts'

const TONE_CLASS: Record<FeedTone, string> = {
  dealt: 'text-cyan-300',
  taken: 'text-red-400',
  evaded: 'text-slate-400',
  missed: 'text-slate-500',
  kill: 'text-emerald-400 font-semibold',
  status: 'text-purple-300',
  pickup: 'text-fuchsia-300',
  info: 'text-muted-foreground',
}

/** 전투 로그. 색으로 공격·피격·상태를 구분하고 항상 최신 줄이 보이도록 스크롤한다. */
export function CombatFeed({ lines }: { lines: FeedLine[] }): React.ReactNode {
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastId = lines.at(-1)?.id

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lastId])

  return (
    <div
      ref={scrollRef}
      className="max-h-64 flex-1 overflow-y-auto rounded-md border border-table-border bg-table-row-even p-2 text-[11px] leading-relaxed"
    >
      {lines.map((line) => (
        <div
          key={line.id}
          className={cn(TONE_CLASS[line.tone], line.critical && 'font-bold')}
        >
          {line.tone === 'taken' && '▼ '}
          {line.tone === 'dealt' && '▲ '}
          {line.text}
        </div>
      ))}
    </div>
  )
}
