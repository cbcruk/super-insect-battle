import type { CommentaryLine, Emphasis } from '@super-insect-battle/commentary'
import { cn } from '../../lib/utils.ts'

/** 중계 한 줄의 글자색·굵기. 플레이어는 청록, 상대는 자홍. */
export function commentaryLineClass(line: CommentaryLine): string {
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
