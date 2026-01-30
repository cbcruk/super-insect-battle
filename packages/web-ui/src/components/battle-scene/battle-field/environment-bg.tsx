import React from 'react'
import type { Environment } from '@super-insect-battle/engine'

const terrainGradients: Record<string, string> = {
  forest: 'from-green-900 via-green-800 to-emerald-900',
  desert: 'from-amber-700 via-yellow-600 to-orange-800',
  wetland: 'from-teal-900 via-cyan-800 to-blue-900',
  cave: 'from-gray-900 via-stone-800 to-neutral-900',
}

const weatherOverlays: Record<string, string> = {
  rain: 'bg-blue-400/10',
  sunny: 'bg-yellow-400/10',
  sandstorm: 'bg-amber-400/10',
  clear: '',
}

interface EnvironmentBgProps {
  environment: Environment
  children: React.ReactNode
}

export function EnvironmentBg({
  environment,
  children,
}: EnvironmentBgProps): React.ReactNode {
  const gradient = terrainGradients[environment.terrain] ?? terrainGradients.forest
  const weather = weatherOverlays[environment.weather] ?? ''
  const isNight = environment.timeOfDay === 'night'

  return (
    <div className={`relative overflow-hidden rounded-lg bg-gradient-to-b ${gradient}`}>
      {weather && <div className={`pointer-events-none absolute inset-0 ${weather}`} />}
      {isNight && (
        <div className="pointer-events-none absolute inset-0 bg-indigo-950/40" />
      )}
      {children}
    </div>
  )
}
