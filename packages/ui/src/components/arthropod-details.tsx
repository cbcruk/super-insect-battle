import React from 'react'
import { Box, Text, useInput } from 'ink'
import type { Arthropod } from '@super-insect-battle/engine'

interface ArthropodDetailsProps {
  arthropod: Arthropod
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

export function ArthropodDetails({
  arthropod,
  onBack,
}: ArthropodDetailsProps): React.ReactNode {
  useInput((input, key) => {
    if (key.escape || key.return || input === 'q') {
      onBack()
    }
  })

  const styleColor = getStyleColor(arthropod.behavior.style)

  return (
    <Box flexDirection="column">
      <Text color="yellow" bold>
        === {arthropod.nameKo} ===
      </Text>
      <Text color="gray">{arthropod.name}</Text>
      <Box marginY={1}>
        <Text>{arthropod.description}</Text>
      </Box>

      <Text color="cyan" bold>
        물리적 특성:
      </Text>
      <Text> 체중: {arthropod.physical.weightG}g</Text>
      <Text> 체장: {arthropod.physical.lengthMm}mm</Text>
      <Text> 힘 지수: {arthropod.physical.strengthIndex}</Text>

      <Box marginTop={1}>
        <Text color="cyan" bold>
          무기:
        </Text>
      </Box>
      <Text> 타입: {arthropod.weapon.type}</Text>
      <Text> 위력: {arthropod.weapon.power}</Text>
      <Text> 독: {arthropod.weapon.venomous ? '있음' : '없음'}</Text>
      {arthropod.weapon.venomPotency && (
        <Text> 독 강도: {arthropod.weapon.venomPotency}</Text>
      )}

      <Box marginTop={1}>
        <Text color="cyan" bold>
          행동:
        </Text>
      </Box>
      <Text> 공격성: {arthropod.behavior.aggression}</Text>
      <Box>
        <Text> 스타일: </Text>
        <Text color={styleColor}>{arthropod.behavior.style}</Text>
      </Box>

      <Box marginTop={1}>
        <Text color="cyan" bold>
          방어:
        </Text>
      </Box>
      <Text> 갑각 강도: {arthropod.defense.armorRating}</Text>
      <Text> 회피력: {arthropod.defense.evasion}</Text>

      <Box marginTop={2}>
        <Text color="gray">Enter 또는 Esc로 돌아가기</Text>
      </Box>
    </Box>
  )
}
