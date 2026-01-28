import React, { useState } from 'react'
import { useKeyboard } from '../hooks/use-keyboard'

export type MenuScreen =
  | 'battle'
  | 'encyclopedia'
  | 'statistics'
  | 'server-battle'
  | 'server-stats'

interface MainMenuProps {
  serverConnected: boolean
  onSelect: (screen: MenuScreen) => void
  onExit?: () => void
}

interface MenuItem {
  key: string
  label: string
  screen?: MenuScreen
  disabled?: boolean
}

export function MainMenu({
  serverConnected,
  onSelect,
  onExit,
}: MainMenuProps): React.ReactNode {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const menuItems: MenuItem[] = [
    { key: '1', label: 'Start Battle', screen: 'battle' },
    { key: '2', label: 'Encyclopedia', screen: 'encyclopedia' },
    { key: '3', label: 'Statistics Simulation', screen: 'statistics' },
    {
      key: '4',
      label: serverConnected
        ? 'Server Battle (SSE)'
        : 'Server Battle (Not Connected)',
      screen: 'server-battle',
      disabled: !serverConnected,
    },
    {
      key: '5',
      label: serverConnected
        ? 'Server Statistics'
        : 'Server Statistics (Not Connected)',
      screen: 'server-stats',
      disabled: !serverConnected,
    },
    { key: '0', label: 'Exit' },
  ]

  useKeyboard((e) => {
    if (e.key === 'ArrowUp') {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1))
    } else if (e.key === 'ArrowDown') {
      setSelectedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'Enter') {
      const item = menuItems[selectedIndex]
      if (item.key === '0') {
        onExit?.()
      } else if (item.screen && !item.disabled) {
        onSelect(item.screen)
      }
    } else if (e.key >= '0' && e.key <= '5') {
      const item = menuItems.find((m) => m.key === e.key)
      if (item) {
        if (item.key === '0') {
          onExit?.()
        } else if (item.screen && !item.disabled) {
          onSelect(item.screen)
        }
      }
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {menuItems.map((item, index) => {
        const isSelected = index === selectedIndex
        const color = item.disabled ? 'var(--tui-gray)' : 'var(--tui-cyan)'

        return (
          <div key={item.key} style={{ display: 'flex' }}>
            <span
              style={{
                color: isSelected ? 'var(--tui-yellow-bright)' : 'inherit',
              }}
            >
              {isSelected ? '> ' : '  '}
            </span>
            <span style={{ color }}>[{item.key}]</span>
            <span
              style={{ color: item.disabled ? 'var(--tui-gray)' : 'inherit' }}
            >
              {' '}
              {item.label}
            </span>
          </div>
        )
      })}
      <div style={{ marginTop: '0.5rem' }}>
        <span style={{ color: 'var(--tui-gray)' }}>
          Arrow keys or number keys to select
        </span>
      </div>
    </div>
  )
}
