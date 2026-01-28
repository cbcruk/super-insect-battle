import React, { useState } from 'react'
import type { Arthropod } from '@super-insect-battle/engine'
import { arthropodList } from '@super-insect-battle/engine'
import { useKeyboard } from '../hooks/use-keyboard'
import { getStyleColor } from '../utils/colors'
import { ArthropodDetails } from './arthropod-details'

interface EncyclopediaProps {
  onBack: () => void
}

export function Encyclopedia({ onBack }: EncyclopediaProps): React.ReactNode {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [viewingArthropod, setViewingArthropod] = useState<Arthropod | null>(
    null
  )

  useKeyboard(
    (e) => {
      if (e.key === 'ArrowUp') {
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : arthropodList.length - 1
        )
      } else if (e.key === 'ArrowDown') {
        setSelectedIndex((prev) =>
          prev < arthropodList.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === 'Enter') {
        setViewingArthropod(arthropodList[selectedIndex])
      } else if (e.key === 'Escape' || e.key === 'q') {
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ color: 'var(--tui-yellow)', fontWeight: 'bold' }}>
        === Arthropod Encyclopedia ===
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
        Arrow keys to browse, Enter for details, Esc to go back
      </span>
    </div>
  )
}
