import React from 'react'
import { Terminal } from './components/terminal/terminal'

export default function App(): React.ReactNode {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-900 p-4">
      <div className="h-full w-full max-w-4xl overflow-hidden rounded-lg border border-gray-700 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-gray-700 bg-gray-800 px-4 py-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="ml-2 text-sm text-gray-400">Super Insect Battle</span>
        </div>
        <Terminal />
      </div>
    </div>
  )
}
