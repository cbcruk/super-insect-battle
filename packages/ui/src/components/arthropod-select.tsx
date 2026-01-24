import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import type { Arthropod } from '@super-insect-battle/engine'
import { arthropodList } from '@super-insect-battle/engine'

interface ArthropodSelectProps {
  prompt: string
  onSelect: (arthropod: Arthropod) => void
  onCancel: () => void
}

function getStyleColor(
  style: string
): 'red' | 'green' | 'magenta' | 'blue' | 'white' {
  switch (style) {
    case 'grappler':
      return 'red'
    case 'striker':
      return 'green'
    case 'venomous':
      return 'magenta'
    case 'defensive':
      return 'blue'
    default:
      return 'white'
  }
}

export function ArthropodSelect({
  prompt,
  onSelect,
  onCancel,
}: ArthropodSelectProps): React.ReactNode {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : arthropodList.length - 1
      )
    } else if (key.downArrow) {
      setSelectedIndex((prev) =>
        prev < arthropodList.length - 1 ? prev + 1 : 0
      )
    } else if (key.return) {
      onSelect(arthropodList[selectedIndex])
    } else if (key.escape || input === 'q') {
      onCancel()
    }
  })

  return (
    <Box flexDirection="column">
      <Text color="yellow" bold>
        === {prompt} ===
      </Text>
      <Box flexDirection="column" marginY={1}>
        {arthropodList.map((arthropod: Arthropod, index: number) => {
          const isSelected = index === selectedIndex
          const styleColor = getStyleColor(arthropod.behavior.style)

          return (
            <Box key={arthropod.id}>
              <Text color={isSelected ? 'yellowBright' : undefined}>
                {isSelected ? '▸ ' : '  '}
              </Text>
              <Text color="cyan">[{index + 1}]</Text>
              <Text>
                {' '}
                {arthropod.nameKo} ({arthropod.name}) -{' '}
              </Text>
              <Text color={styleColor}>{arthropod.behavior.style}</Text>
            </Box>
          )
        })}
      </Box>
      <Text color="gray">↑↓ 선택, Enter 확인, Esc 취소</Text>
    </Box>
  )
}
