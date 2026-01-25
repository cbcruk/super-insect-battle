import React from 'react'
import { Box, Text } from 'ink'
import type { BattleArthropod } from '@super-insect-battle/engine'
import { HpBar } from './hp-bar.js'

interface StatusPanelProps {
  arthropod: BattleArthropod
  currentHp: number
  color: 'cyan' | 'magenta'
}

function formatStatStage(stage: number): string {
  if (stage === 0) return ''
  return stage > 0 ? `+${stage}` : `${stage}`
}

function getStatStageColor(stage: number): string {
  if (stage > 0) return 'green'
  if (stage < 0) return 'red'
  return 'gray'
}

export function StatusPanel({
  arthropod,
  currentHp,
  color,
}: StatusPanelProps): React.ReactNode {
  const { statStages, statusCondition, bindTurns, battleMode, modeTurns, appliedVenomPotency } =
    arthropod

  const hasStatChanges =
    statStages.strength !== 0 ||
    statStages.defense !== 0 ||
    statStages.evasion !== 0

  return (
    <Box flexDirection="column" borderStyle="single" borderColor={color} paddingX={1}>
      <Box justifyContent="space-between">
        <Text color={color} bold>
          {arthropod.base.nameKo}
        </Text>
        {hasStatChanges && (
          <Box>
            {statStages.strength !== 0 && (
              <Text color={getStatStageColor(statStages.strength)}>
                {' '}ATK{formatStatStage(statStages.strength)}
              </Text>
            )}
            {statStages.defense !== 0 && (
              <Text color={getStatStageColor(statStages.defense)}>
                {' '}DEF{formatStatStage(statStages.defense)}
              </Text>
            )}
            {statStages.evasion !== 0 && (
              <Text color={getStatStageColor(statStages.evasion)}>
                {' '}EVA{formatStatStage(statStages.evasion)}
              </Text>
            )}
          </Box>
        )}
      </Box>

      <HpBar current={currentHp} max={arthropod.maxHp} />

      <Box>
        {statusCondition === 'poison' && (
          <Text color="magenta">
            [poison{appliedVenomPotency > 0 ? `:${appliedVenomPotency}` : ''}]{' '}
          </Text>
        )}
        {statusCondition === 'bind' && (
          <Text color="yellow">[bind:{bindTurns}] </Text>
        )}
        {battleMode === 'flee' && (
          <Text color="blue">[flee:{modeTurns}] </Text>
        )}
        {battleMode === 'brace' && (
          <Text color="green">[brace:{modeTurns}] </Text>
        )}
        {!statusCondition && !battleMode && (
          <Text color="gray">[normal]</Text>
        )}
      </Box>
    </Box>
  )
}
