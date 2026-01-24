import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'

interface NumberInputProps {
  prompt: string
  defaultValue: number
  onSubmit: (value: number) => void
  onCancel: () => void
}

export function NumberInput({
  prompt,
  defaultValue,
  onSubmit,
  onCancel,
}: NumberInputProps): React.ReactNode {
  const [value, setValue] = useState(String(defaultValue))

  useInput((input, key) => {
    if (key.return) {
      const num = parseInt(value, 10) || defaultValue
      onSubmit(num)
    } else if (key.escape) {
      onCancel()
    } else if (key.backspace || key.delete) {
      setValue((prev) => prev.slice(0, -1))
    } else if (/^\d$/.test(input)) {
      setValue((prev) => prev + input)
    }
  })

  return (
    <Box flexDirection="column">
      <Box>
        <Text>{prompt}: </Text>
        <Text color="cyan">{value || defaultValue}</Text>
        <Text color="gray">█</Text>
      </Box>
      <Box marginTop={1}>
        <Text color="gray">Enter 확인, Esc 취소</Text>
      </Box>
    </Box>
  )
}
