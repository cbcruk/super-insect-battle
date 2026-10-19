import React, { useEffect, useRef } from 'react'
import type { CommentaryItem } from './grid-commentary.types.ts'
import { commentaryLineClass } from '../battle-commentary/battle-commentary.utils.ts'

/** 격자 매치업 중계 패널. 항상 최신 줄이 보이도록 스크롤한다. */
export function GridCommentary({
  lines,
}: {
  lines: CommentaryItem[]
}): React.ReactNode {
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastId = lines.at(-1)?.id

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lastId])

  return (
    <div
      ref={scrollRef}
      className="max-h-80 flex-1 space-y-0.5 overflow-y-auto rounded-md border border-table-border bg-table-row-even p-2 text-xs leading-relaxed"
    >
      {lines.map(({ id, line }) => (
        <p key={id} className={commentaryLineClass(line)}>
          {line.text}
        </p>
      ))}
    </div>
  )
}
