import React, { useMemo } from 'react'
import type { Environment } from '@super-insect-battle/engine'

interface ArenaSkyProps {
  timeOfDay: Environment['timeOfDay']
  weather: Environment['weather']
}

export function ArenaSky({ timeOfDay, weather }: ArenaSkyProps): React.ReactNode {
  const isNight = timeOfDay === 'night'
  const isRaining = weather === 'rain'

  const backgroundColor = useMemo(() => {
    if (isNight) return '#1a1a2e'
    if (isRaining) return '#4a5568'
    return '#2d3748'
  }, [isNight, isRaining])

  return (
    <color attach="background" args={[backgroundColor]} />
  )
}
