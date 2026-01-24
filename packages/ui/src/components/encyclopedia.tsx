import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import type { Arthropod } from '@super-insect-battle/engine'
import { arthropodList } from '@super-insect-battle/engine'
import { ArthropodDetails } from './arthropod-details.js'

interface EncyclopediaProps {
  onBack: () => void
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

export function Encyclopedia({ onBack }: EncyclopediaProps): React.ReactNode {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [viewingArthropod, setViewingArthropod] = useState<Arthropod | null>(
    null
  )

  useInput(
    (input, key) => {
      if (key.upArrow) {
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : arthropodList.length - 1
        )
      } else if (key.downArrow) {
        setSelectedIndex((prev) =>
          prev < arthropodList.length - 1 ? prev + 1 : 0
        )
      } else if (key.return) {
        setViewingArthropod(arthropodList[selectedIndex])
      } else if (key.escape || input === 'q') {
        onBack()
      }
    },
    { isActive: !viewingArthropod }
  )

  if (viewingArthropod) {
    return (
      <ArthropodDetails
        arthropod={viewingArthropod}
        onBack={() => setViewingArthropod(null)}
      />
    )
  }

  return (
    <Box flexDirection="column">
      <Text color="yellow" bold>
        === 절지동물 도감 ===
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

      <Text color="gray">↑↓ 탐색, Enter 상세보기, Esc 돌아가기</Text>
    </Box>
  )
}
