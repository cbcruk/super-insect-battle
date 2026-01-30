import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import type { AIDifficulty, AIPersonality } from '@super-insect-battle/engine'

export interface AIConfig {
  difficulty: AIDifficulty
  personality: AIPersonality
}

interface AIConfigSelectProps {
  onSelect: (config: AIConfig) => void
  onCancel: () => void
}

interface Option<T> {
  value: T
  label: string
  description: string
}

const difficultyOptions: Option<AIDifficulty>[] = [
  { value: 'easy', label: 'Easy', description: 'random action' },
  { value: 'medium', label: 'Normal', description: 'basic strategy' },
  { value: 'hard', label: 'Hard', description: 'optimal strategy' },
]

const personalityOptions: Option<AIPersonality>[] = [
  { value: 'aggressive', label: 'Aggressive', description: 'prefers attack' },
  { value: 'defensive', label: 'Defensive', description: 'prefers defense' },
  { value: 'balanced', label: 'Balanced', description: 'mixed strategy' },
]

type Step = 'difficulty' | 'personality'

export function AIConfigSelect({
  onSelect,
  onCancel,
}: AIConfigSelectProps): React.ReactNode {
  const [step, setStep] = useState<Step>('difficulty')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium')

  const options = step === 'difficulty' ? difficultyOptions : personalityOptions
  const title = step === 'difficulty' ? 'AI Difficulty' : 'AI Personality'

  useInput((_input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1))
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0))
    } else if (key.return) {
      if (step === 'difficulty') {
        setDifficulty(difficultyOptions[selectedIndex].value)
        setStep('personality')
        setSelectedIndex(0)
      } else {
        onSelect({
          difficulty,
          personality: personalityOptions[selectedIndex].value,
        })
      }
    } else if (key.escape) {
      if (step === 'personality') {
        setStep('difficulty')
        setSelectedIndex(0)
      } else {
        onCancel()
      }
    }
  })

  return (
    <Box flexDirection="column">
      <Text color="yellow" bold>
        === {title} ===
      </Text>
      {step === 'personality' && (
        <Text color="gray">Difficulty: {difficulty}</Text>
      )}
      <Box flexDirection="column" marginY={1}>
        {options.map((opt, index) => {
          const isSelected = index === selectedIndex
          return (
            <Box key={opt.value}>
              <Text color={isSelected ? 'yellowBright' : undefined}>
                {isSelected ? '▸ ' : '  '}
              </Text>
              <Text>{opt.label}</Text>
              <Text color="gray"> - {opt.description}</Text>
            </Box>
          )
        })}
      </Box>
      <Text color="gray" dimColor>
        ↑↓ select, Enter confirm, Esc back
      </Text>
    </Box>
  )
}
