import React, { useState, useEffect, useRef } from 'react'
import { Box, Text, useInput } from 'ink'
import type { BattleState } from '@super-insect-battle/engine'
import {
  buildFeed,
  type CommentaryLine,
  type Emphasis,
  type MatchFeed,
} from '@super-insect-battle/commentary'
import { HpBar } from './hp-bar.js'

interface BattleViewProps {
  battleState: BattleState
  onFinish: () => void
}

const WINDOW = 14

const DELAY: Record<Emphasis, number> = {
  header: 650,
  critical: 850,
  strong: 520,
  normal: 360,
  system: 280,
}

const SPEEDS = [
  { label: '느리게', mult: 1.8 },
  { label: '보통', mult: 1 },
  { label: '빠르게', mult: 0.5 },
]
const DEFAULT_SPEED = 1

function lineColor(line: CommentaryLine): { color?: string; bold?: boolean } {
  const actorColor =
    line.actor === 'player'
      ? 'cyan'
      : line.actor === 'opponent'
        ? 'magenta'
        : 'white'
  switch (line.emphasis) {
    case 'header':
      return { color: 'yellow', bold: true }
    case 'critical':
      return { color: 'red', bold: true }
    case 'strong':
      return { color: actorColor, bold: true }
    case 'system':
      return { color: 'gray' }
    default:
      return { color: actorColor }
  }
}

export function BattleView({
  battleState,
  onFinish,
}: BattleViewProps): React.ReactNode {
  const feedRef = useRef<MatchFeed | null>(null)
  if (feedRef.current === null) {
    feedRef.current = buildFeed(battleState)
  }
  const feed = feedRef.current

  const [cursor, setCursor] = useState(1)
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(DEFAULT_SPEED)

  const finished = cursor >= feed.items.length

  useEffect(() => {
    if (finished || paused) return
    const current = feed.items[cursor - 1]
    const delay = DELAY[current.line.emphasis] * SPEEDS[speed].mult
    const timer = setTimeout(() => setCursor((c) => c + 1), delay)
    return () => clearTimeout(timer)
  }, [cursor, paused, finished, speed, feed])

  useInput((input, key) => {
    if (finished) {
      if (key.return || key.escape) onFinish()
      return
    }
    if (input === 'f' || input === 'F') {
      setCursor(feed.items.length)
    } else if (input === ' ') {
      setPaused((p) => !p)
    } else if (input === '1' || input === '2' || input === '3') {
      setSpeed(Number(input) - 1)
    }
  })

  const revealed = feed.items.slice(0, cursor)
  const current = revealed[revealed.length - 1]
  const hp = current?.hp ?? feed.maxHp
  const window = revealed.slice(-WINDOW)

  return (
    <Box flexDirection="column">
      <Box
        borderStyle="double"
        borderColor="yellow"
        paddingX={2}
        justifyContent="center"
      >
        <Text color="cyan" bold>
          {feed.player}
        </Text>
        <Text> vs </Text>
        <Text color="magenta" bold>
          {feed.opponent}
        </Text>
        <Text color="gray"> · {feed.environment}</Text>
      </Box>

      <Box justifyContent="space-between" paddingX={1} marginTop={1}>
        <Box>
          <Text color="cyan">{feed.player} </Text>
          <HpBar current={hp.player} max={feed.maxHp.player} width={16} />
        </Box>
        <Box>
          <HpBar current={hp.opponent} max={feed.maxHp.opponent} width={16} />
          <Text color="magenta"> {feed.opponent}</Text>
        </Box>
      </Box>

      <Box
        flexDirection="column"
        marginTop={1}
        paddingX={1}
        borderStyle="round"
        borderColor="gray"
        minHeight={WINDOW + 2}
      >
        {window.map((item, index) => {
          const style = lineColor(item.line)
          return (
            <Text key={cursor - window.length + index} {...style}>
              {item.line.text}
            </Text>
          )
        })}
      </Box>

      <Box marginTop={1} paddingX={1}>
        {finished ? (
          <Text color="gray">Enter를 눌러 계속</Text>
        ) : (
          <Text color="gray">
            {paused ? '⏸ 일시정지  ' : '▶ 중계 중  '}
            <Text color="white">[Space]</Text> {paused ? '재생' : '정지'}{' '}
            <Text color="white">[1/2/3]</Text> 속도(
            <Text color="cyan">{SPEEDS[speed].label}</Text>){' '}
            <Text color="white">[F]</Text> 빨리감기
          </Text>
        )}
      </Box>
    </Box>
  )
}
