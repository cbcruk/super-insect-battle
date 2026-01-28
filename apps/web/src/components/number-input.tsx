import React, { useState } from 'react'
import { useKeyboard } from '../hooks/use-keyboard'

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

  useKeyboard((e) => {
    if (e.key === 'Enter') {
      const num = parseInt(value, 10) || defaultValue
      onSubmit(num)
    } else if (e.key === 'Escape') {
      onCancel()
    } else if (e.key === 'Backspace') {
      setValue((prev) => prev.slice(0, -1))
    } else if (/^\d$/.test(e.key)) {
      setValue((prev) => prev + e.key)
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex' }}>
        <span>{prompt}: </span>
        <span style={{ color: 'var(--tui-cyan)' }}>{value || defaultValue}</span>
        <span style={{ color: 'var(--tui-gray)' }}>_</span>
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <span style={{ color: 'var(--tui-gray)' }}>
          Enter to confirm, Esc to cancel
        </span>
      </div>
    </div>
  )
}
