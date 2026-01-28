import React from 'react'

interface HpBarProps {
  current: number
  max: number
  width?: number
}

export function HpBar({
  current,
  max,
  width = 20,
}: HpBarProps): React.ReactNode {
  const ratio = Math.max(0, current / max)
  const filled = Math.round(ratio * width)
  const empty = width - filled

  const color =
    ratio > 0.5
      ? 'var(--tui-green)'
      : ratio > 0.25
        ? 'var(--tui-yellow)'
        : 'var(--tui-red)'

  return (
    <span style={{ display: 'inline-flex' }}>
      <span>[</span>
      <span style={{ color }}>{'█'.repeat(filled)}</span>
      <span style={{ color: 'var(--tui-gray)' }}>{'░'.repeat(empty)}</span>
      <span>
        ] {current}/{max}
      </span>
    </span>
  )
}
