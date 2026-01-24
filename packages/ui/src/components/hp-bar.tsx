import React from 'react'
import { Box, Text } from 'ink'

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

  const color = ratio > 0.5 ? 'green' : ratio > 0.25 ? 'yellow' : 'red'

  return (
    <Box>
      <Text>[</Text>
      <Text color={color}>{'█'.repeat(filled)}</Text>
      <Text color="gray">{'░'.repeat(empty)}</Text>
      <Text>
        ] {current}/{max}
      </Text>
    </Box>
  )
}
