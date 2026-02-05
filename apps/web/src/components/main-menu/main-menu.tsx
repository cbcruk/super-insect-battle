import React from 'react'
import { Link } from 'react-router'

interface MenuItem {
  path: string
  title: string
  description: string
  span?: 'wide' | 'normal'
}

const menuItems: MenuItem[] = [
  {
    path: '/battle/setup',
    title: 'Battle Mode',
    description: 'Player vs AI interactive battle with real arthropod characteristics',
    span: 'wide',
  },
  {
    path: '/encyclopedia',
    title: 'Encyclopedia',
    description: '24 arthropod species with detailed combat data',
  },
  {
    path: '/statistics',
    title: 'Statistics',
    description: 'Mass simulation win rate analysis',
  },
]

export function MainMenu(): React.ReactNode {
  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col justify-center gap-12 px-6 py-12 sm:px-8">
      <div>
        <h1 className="text-4xl text-foreground sm:text-5xl lg:text-6xl">
          Super Insect Battle
        </h1>
        <p className="mt-3 text-base text-gray-400 sm:text-lg" style={{ opacity: 0.7 }}>
          실제 절지동물 특성 기반 1:1 배틀 시뮬레이터
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`group rounded-lg border border-white/8 bg-card p-6 no-underline transition-colors hover:border-white/15 ${
              item.span === 'wide' ? 'sm:col-span-2' : ''
            }`}
          >
            <h2 className="text-lg tracking-tight text-gray-100 sm:text-xl">
              {item.title}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
