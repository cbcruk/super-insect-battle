import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'

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
    { key: '1', label: '배틀 시작', screen: 'battle' },
    { key: '2', label: '도감', screen: 'encyclopedia' },
    { key: '3', label: '통계 시뮬레이션', screen: 'statistics' },
    {
      key: '4',
      label: serverConnected ? '서버 배틀 (SSE)' : '서버 배틀 (연결 안됨)',
      screen: 'server-battle',
      disabled: !serverConnected,
    },
    {
      key: '5',
      label: serverConnected ? '서버 통계' : '서버 통계 (연결 안됨)',
      screen: 'server-stats',
      disabled: !serverConnected,
    },
    { key: '0', label: '종료' },
  ]

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1))
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0))
    } else if (key.return) {
      const item = menuItems[selectedIndex]
      if (item.key === '0') {
        onExit?.()
      } else if (item.screen && !item.disabled) {
        onSelect(item.screen)
      }
    } else if (input >= '0' && input <= '5') {
      const item = menuItems.find((m) => m.key === input)
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
    <Box flexDirection="column">
      {menuItems.map((item, index) => {
        const isSelected = index === selectedIndex
        const color = item.disabled
          ? 'gray'
          : item.key === '0'
            ? 'cyan'
            : 'cyan'

        return (
          <Box key={item.key}>
            <Text color={isSelected ? 'yellowBright' : undefined}>
              {isSelected ? '▸ ' : '  '}
            </Text>
            <Text color={color}>[{item.key}]</Text>
            <Text color={item.disabled ? 'gray' : undefined}>
              {' '}
              {item.label}
            </Text>
          </Box>
        )
      })}
      <Box marginTop={1}>
        <Text color="gray">↑↓ 방향키 또는 숫자키로 선택</Text>
      </Box>
    </Box>
  )
}
