import React from 'react'
import { Link, useLocation } from 'react-router'

import { cn } from '../../lib/utils'

interface NavItem {
  path: string
  label: string
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard' },
  { path: '/battle/setup', label: 'Matchup' },
  { path: '/encyclopedia', label: 'Roster' },
  { path: '/statistics', label: 'Stats' },
  { path: '/replay', label: 'History' },
]

export function NavBar(): React.ReactNode {
  const location = useLocation()

  return (
    <nav className="flex h-13 items-center justify-between gap-4 border-b border-table-border bg-background px-4 sm:h-16">
      <Link
        to="/"
        className="flex items-center font-heading shrink-0 text-foreground no-underline lowercase text-base font-logo font-bold"
      >
        super-insect-battle
      </Link>
      <div className="flex gap-0.5 overflow-x-auto sm:gap-1">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'shrink-0 px-2.5 py-1 text-xs font-medium no-underline transition-colors sm:px-3 sm:py-1.5 sm:text-sm',
                isActive
                  ? 'border-b-2 border-primary text-foreground'
                  : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
