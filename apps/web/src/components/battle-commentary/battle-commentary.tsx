import React, { useEffect, useMemo, useRef } from 'react'
import { formatEnvironment } from '@super-insect-battle/engine'
import {
  narrateLog,
  type CommentaryLine,
  type Emphasis,
} from '@super-insect-battle/commentary'
import { Button } from '../ui/button.tsx'
import { cn } from '../../lib/utils.ts'
import type { BattleCommentaryProps } from './battle-commentary.types.ts'

export const PLAYBACK_SPEEDS = [
  { label: '느리게', mult: 1.8 },
  { label: '보통', mult: 1 },
  { label: '빠르게', mult: 0.5 },
]

function hpColor(ratio: number): string {
  if (ratio > 0.5) return 'bg-green-500'
  if (ratio > 0.25) return 'bg-yellow-500'
  return 'bg-red-500'
}

function lineClass(line: CommentaryLine): string {
  const actorColor =
    line.actor === 'player'
      ? 'text-cyan-300'
      : line.actor === 'opponent'
        ? 'text-fuchsia-300'
        : 'text-foreground'
  const byEmphasis: Record<Emphasis, string> = {
    header: 'text-yellow-400 font-bold',
    critical: 'text-red-400 font-bold',
    strong: cn(actorColor, 'font-semibold'),
    system: 'text-muted-foreground',
    normal: actorColor,
  }
  return byEmphasis[line.emphasis]
}

function HpRow({
  name,
  hp,
  maxHp,
  align,
  color,
}: {
  name: string
  hp: number
  maxHp: number
  align: 'left' | 'right'
  color: string
}): React.ReactNode {
  const ratio = maxHp > 0 ? Math.max(0, hp / maxHp) : 0
  return (
    <div className={cn('flex-1', align === 'right' && 'text-right')}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className={cn('font-bold', color)}>{name}</span>
        <span className="text-muted-foreground text-sm tabular-nums">
          {Math.max(0, Math.round(hp))}/{maxHp}
        </span>
      </div>
      <div className="bg-muted h-3 w-full overflow-hidden rounded">
        <div
          className={cn('h-full transition-all duration-500', hpColor(ratio))}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  )
}

export function BattleCommentary({
  player,
  opponent,
  playerBattle,
  opponentBattle,
  environment,
  displayedPlayerHp,
  displayedOpponentHp,
  displayedLogs,
  winner,
  finished,
  onClose,
  onSaveReplay,
  onDownloadReplay,
  replaySaved,
  controls,
}: BattleCommentaryProps): React.ReactNode {
  const scrollRef = useRef<HTMLDivElement>(null)

  const lines = useMemo<CommentaryLine[]>(() => {
    if (!playerBattle || !opponentBattle) return []
    return narrateLog(displayedLogs, {
      player: playerBattle,
      opponent: opponentBattle,
      environment,
      winner: finished ? winner : null,
    })
  }, [displayedLogs, playerBattle, opponentBattle, environment, finished, winner])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines.length])

  const playerName = playerBattle?.base.nameKo ?? player.nameKo
  const opponentName = opponentBattle?.base.nameKo ?? opponent.nameKo
  const playerMax = playerBattle?.maxHp ?? Math.max(displayedPlayerHp, 1)
  const opponentMax = opponentBattle?.maxHp ?? Math.max(displayedOpponentHp, 1)

  const winnerName =
    winner === 'player'
      ? playerName
      : winner === 'opponent'
        ? opponentName
        : null

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-3 p-4">
      <div className="rounded-lg border p-3">
        <div className="text-muted-foreground mb-2 text-center text-sm">
          {formatEnvironment(environment)}
        </div>
        <div className="flex items-start gap-4">
          <HpRow
            name={playerName}
            hp={displayedPlayerHp}
            maxHp={playerMax}
            align="left"
            color="text-cyan-300"
          />
          <span className="text-muted-foreground pt-5 text-sm">vs</span>
          <HpRow
            name={opponentName}
            hp={displayedOpponentHp}
            maxHp={opponentMax}
            align="right"
            color="text-fuchsia-300"
          />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="bg-card flex-1 space-y-1 overflow-y-auto rounded-lg border p-4 font-mono text-sm leading-relaxed"
      >
        {lines.map((line, index) => (
          <p key={index} className={lineClass(line)}>
            {line.text}
          </p>
        ))}
      </div>

      {finished ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
          <div className="text-lg font-bold">
            {winnerName ? `${winnerName} 승리!` : '무승부!'}
          </div>
          <div className="flex gap-2">
            {onSaveReplay && (
              <Button variant="outline" onClick={onSaveReplay} disabled={replaySaved}>
                {replaySaved ? '저장됨' : '리플레이 저장'}
              </Button>
            )}
            {onDownloadReplay && (
              <Button variant="outline" onClick={onDownloadReplay}>
                다운로드
              </Button>
            )}
            <Button onClick={onClose}>돌아가기</Button>
          </div>
        </div>
      ) : controls ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
          <Button variant="outline" size="sm" onClick={controls.onTogglePause}>
            {controls.paused ? '▶ 재생' : '⏸ 일시정지'}
          </Button>
          <Button variant="outline" size="sm" onClick={controls.onCycleSpeed}>
            속도: {PLAYBACK_SPEEDS[controls.speedIndex].label}
          </Button>
          <Button variant="outline" size="sm" onClick={controls.onSkip}>
            ⏭ 빨리감기
          </Button>
          <span className="text-muted-foreground ml-auto text-xs">
            [Space] 정지 · [1/2/3] 속도 · [F] 빨리감기
          </span>
        </div>
      ) : null}
    </div>
  )
}
