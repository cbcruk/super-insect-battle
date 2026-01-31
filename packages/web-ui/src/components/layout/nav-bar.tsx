import React from 'react'
import { Link, useLocation } from 'react-router'

interface NavItem {
  path: string
  label: string
}

const navItems: NavItem[] = [
  { path: '/', label: '홈' },
  { path: '/battle/setup', label: '대전' },
  { path: '/encyclopedia', label: '도감' },
  { path: '/statistics', label: '통계' },
  { path: '/replay', label: '리플레이' },
]

export function NavBar(): React.ReactNode {
  const location = useLocation()

  return (
    <nav className="flex items-center justify-between gap-2 border-b border-gray-700 bg-gray-900/80 px-3 py-2 backdrop-blur-sm sm:px-6 sm:py-3">
      <Link to="/" className="shrink-0 text-base font-bold text-amber-400 no-underline sm:text-lg">
        슈퍼곤충대전
      </Link>
      <div className="flex gap-0.5 overflow-x-auto sm:gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium no-underline transition-colors sm:px-3 sm:py-1.5 sm:text-sm ${
                isActive
                  ? 'bg-amber-400/20 text-amber-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
