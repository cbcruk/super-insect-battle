import React from 'react'
import { Link, useLocation } from 'react-router'
import { Swords, Bug, BarChart3, History, Trees } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'

interface NavItem {
  path: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { path: '/', label: 'Matchup', icon: Swords },
  { path: '/roguelike', label: 'Roguelike', icon: Trees },
  { path: '/encyclopedia', label: 'Roster', icon: Bug },
  { path: '/statistics', label: 'Stats', icon: BarChart3 },
  { path: '/replay', label: 'History', icon: History },
]

export function NavBar(): React.ReactNode {
  const location = useLocation()

  return (
    <nav className="flex h-13 items-center gap-4 border-b border-table-border bg-background px-2 sm:h-16">
      <div className="flex gap-0.5 overflow-x-auto sm:gap-1">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path)

          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-xs font-medium no-underline transition-colors sm:px-3 sm:py-1.5 sm:text-sm border-b-2 border-transparent text-muted-foreground hover:text-foreground',
                isActive && 'text-foreground'
              )}
            >
              <Icon className="size-3.5 sm:size-4" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
