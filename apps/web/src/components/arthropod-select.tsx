import React, { useState } from 'react'
import type { Arthropod } from '@super-insect-battle/engine'
import { arthropodList } from '@super-insect-battle/engine'
import { useKeyboard } from '../hooks/use-keyboard'
import { getStyleColor } from '../utils/colors'

interface ArthropodSelectProps {
  prompt: string
  onSelect: (arthropod: Arthropod) => void
  onCancel: () => void
}

export function ArthropodSelect({
  prompt,
  onSelect,
  onCancel,
}: ArthropodSelectProps): React.ReactNode {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useKeyboard((e) => {
    if (e.key === 'ArrowUp') {
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : arthropodList.length - 1
      )
    } else if (e.key === 'ArrowDown') {
      setSelectedIndex((prev) =>
        prev < arthropodList.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'Enter') {
      onSelect(arthropodList[selectedIndex])
    } else if (e.key === 'Escape' || e.key === 'q') {
      onCancel()
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ color: 'var(--tui-yellow)', fontWeight: 'bold' }}>
        === {prompt} ===
      </span>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          margin: '0.5rem 0',
        }}
      >
        {arthropodList.map((arthropod: Arthropod, index: number) => {
          const isSelected = index === selectedIndex
          const styleColor = getStyleColor(arthropod.behavior.style)

          return (
            <div key={arthropod.id} style={{ display: 'flex' }}>
              <span
                style={{
                  color: isSelected ? 'var(--tui-yellow-bright)' : 'inherit',
                }}
              >
                {isSelected ? '> ' : '  '}
              </span>
              <span style={{ color: 'var(--tui-cyan)' }}>[{index + 1}]</span>
              <span>
                {' '}
                {arthropod.nameKo} ({arthropod.name}) -{' '}
              </span>
              <span style={{ color: styleColor }}>
                {arthropod.behavior.style}
              </span>
            </div>
          )
        })}
      </div>
      <span style={{ color: 'var(--tui-gray)' }}>
        Arrow keys to select, Enter to confirm, Esc to cancel
      </span>
    </div>
  )
}
