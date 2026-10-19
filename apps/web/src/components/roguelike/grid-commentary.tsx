import React, { useEffect, useRef } from 'react'
import type { CommentaryLine } from '@super-insect-battle/commentary'
import { commentaryLineClass } from '../battle-commentary/battle-commentary.utils.ts'

/** 격자 매치업 중계 패널. 항상 최신 줄이 보이도록 스크롤한다. */
export function GridCommentary({
  lines,
}: {
  lines: CommentaryLine[]
}): React.ReactNode {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  return (
    <div
      ref={scrollRef}
      className="max-h-80 flex-1 space-y-0.5 overflow-y-auto rounded-md border border-table-border bg-table-row-even p-2 text-xs leading-relaxed"
    >
      {lines.map((line, index) => (
        <p key={index} className={commentaryLineClass(line)}>
          {line.text}
        </p>
      ))}
    </div>
  )
}
