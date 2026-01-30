import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import type { Action, BattleArthropod } from '@super-insect-battle/engine'
import {
  getActionsByIds,
  getCooldownRemaining,
} from '@super-insect-battle/engine'

interface ActionSelectorProps {
  arthropod: BattleArthropod
  availableActions: Action[]
  onSelect: (action: Action) => void
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'attack':
      return 'ATK'
    case 'defense':
      return 'DEF'
    case 'special':
      return 'SPE'
    default:
      return '???'
  }
}

function getCategoryColor(
  category: string
): 'red' | 'blue' | 'yellow' | 'white' {
  switch (category) {
    case 'attack':
      return 'red'
    case 'defense':
      return 'blue'
    case 'special':
      return 'yellow'
    default:
      return 'white'
  }
}

interface DisplayAction {
  action: Action
  onCooldown: boolean
  cooldownRemaining: number
}

function buildDisplayActions(
  arthropod: BattleArthropod,
  availableActions: Action[]
): DisplayAction[] {
  const allActions = getActionsByIds(arthropod.actions)
  const availableIds = new Set(availableActions.map((a) => a.id))

  return allActions.map((action) => {
    const remaining = getCooldownRemaining(arthropod, action.id)
    return {
      action,
      onCooldown: !availableIds.has(action.id),
      cooldownRemaining: remaining,
    }
  })
}

function getSelectableIndices(displayActions: DisplayAction[]): number[] {
  return displayActions
    .map((da, i) => (da.onCooldown ? -1 : i))
    .filter((i) => i >= 0)
}

export function ActionSelector({
  arthropod,
  availableActions,
  onSelect,
}: ActionSelectorProps): React.ReactNode {
  const displayActions = buildDisplayActions(arthropod, availableActions)
  const selectableIndices = getSelectableIndices(displayActions)
  const [cursorPos, setCursorPos] = useState(0)

  const selectedIndex = selectableIndices[cursorPos] ?? 0

  useInput((_input, key) => {
    if (key.upArrow) {
      setCursorPos((prev) =>
        prev > 0 ? prev - 1 : selectableIndices.length - 1
      )
    } else if (key.downArrow) {
      setCursorPos((prev) =>
        prev < selectableIndices.length - 1 ? prev + 1 : 0
      )
    } else if (key.return) {
      const da = displayActions[selectedIndex]
      if (da && !da.onCooldown) {
        onSelect(da.action)
      }
    }
  })

  return (
    <Box flexDirection="column">
      <Text color="yellow" bold>
        === 행동 선택 ===
      </Text>
      <Box flexDirection="column" marginTop={1}>
        {displayActions.map((da, index) => {
          const isSelected = index === selectedIndex
          const { action, onCooldown, cooldownRemaining } = da

          if (onCooldown) {
            return (
              <Box key={action.id}>
                <Text color="gray">
                  {'  '}[{getCategoryLabel(action.category)}] {action.nameKo}
                  {'  '}
                  (cooldown: {cooldownRemaining}T)
                </Text>
              </Box>
            )
          }

          const catColor = getCategoryColor(action.category)

          return (
            <Box key={action.id}>
              <Text color={isSelected ? 'yellowBright' : undefined}>
                {isSelected ? '▸ ' : '  '}
              </Text>
              <Text color={catColor}>
                [{getCategoryLabel(action.category)}]
              </Text>
              <Text> {action.nameKo}</Text>
              {action.power > 0 && <Text color="white"> P:{action.power}</Text>}
              <Text color="gray"> A:{action.accuracy}</Text>
              {action.cooldown > 0 && (
                <Text color="gray"> CD:{action.cooldown}</Text>
              )}
            </Box>
          )
        })}
      </Box>
      <Text color="gray" dimColor>
        ↑↓ select, Enter confirm
      </Text>
    </Box>
  )
}
