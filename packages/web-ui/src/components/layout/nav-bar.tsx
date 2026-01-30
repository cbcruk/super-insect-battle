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
]

export function NavBar(): React.ReactNode {
  const location = useLocation()

  return (
    <nav className="flex items-center justify-between border-b border-gray-700 bg-gray-900/80 px-6 py-3 backdrop-blur-sm">
      <Link to="/" className="text-lg font-bold text-amber-400 no-underline">
        슈퍼곤충대전
      </Link>
      <div className="flex gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-md px-3 py-1.5 text-sm font-medium no-underline transition-colors ${
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
