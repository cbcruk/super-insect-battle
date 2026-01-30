import React from 'react'
import { Link } from 'react-router'

interface MenuItem {
  path: string
  title: string
  description: string
  color: string
}

const menuItems: MenuItem[] = [
  {
    path: '/battle/setup',
    title: '대전 모드',
    description: 'Player vs AI 인터랙티브 배틀',
    color: 'from-red-600 to-red-800',
  },
  {
    path: '/encyclopedia',
    title: '곤충 도감',
    description: '24종 절지동물 상세 정보',
    color: 'from-emerald-600 to-emerald-800',
  },
  {
    path: '/statistics',
    title: '통계 시뮬레이션',
    description: '대량 시뮬레이션 승률 분석',
    color: 'from-blue-600 to-blue-800',
  },
]

export function MainMenu(): React.ReactNode {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-12 p-8">
      <div className="text-center">
        <h1 className="mb-2 text-5xl font-black text-amber-400">
          Super Insect Battle
        </h1>
        <p className="text-lg text-gray-400">
          실제 절지동물 특성 기반 1:1 배틀 시뮬레이터
        </p>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`group rounded-xl bg-gradient-to-br ${item.color} p-6 no-underline shadow-lg transition-transform hover:scale-105`}
          >
            <h2 className="mb-2 text-xl font-bold text-white">
              {item.title}
            </h2>
            <p className="text-sm text-white/70">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
