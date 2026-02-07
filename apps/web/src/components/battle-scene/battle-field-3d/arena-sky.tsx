import React, { useMemo } from 'react'
import { Sky } from '@react-three/drei'
import type { Environment } from '@super-insect-battle/engine'

interface ArenaSkyProps {
  timeOfDay: Environment['timeOfDay']
  weather: Environment['weather']
}

export function ArenaSky({ timeOfDay, weather }: ArenaSkyProps): React.ReactNode {
  const isNight = timeOfDay === 'night'
  const isRaining = weather === 'rain'

  const sunPosition = useMemo((): [number, number, number] => {
    if (isNight) return [0, -1, 0]
    if (isRaining) return [1, 0.5, 1]
    return [1, 2, 1]
  }, [isNight, isRaining])

  const turbidity = isRaining ? 20 : isNight ? 0.1 : 8
  const rayleigh = isNight ? 0.1 : isRaining ? 4 : 2

  return (
    <Sky
      distance={450000}
      sunPosition={sunPosition}
      inclination={isNight ? 0 : 0.5}
      azimuth={0.25}
      turbidity={turbidity}
      rayleigh={rayleigh}
    />
  )
}
