import React from 'react'
import { Outlet } from 'react-router'
import { NavBar } from './nav-bar.tsx'

export function AppLayout(): React.ReactNode {
  return (
    <div className="flex h-screen flex-col bg-gray-950 text-gray-100">
      <NavBar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
