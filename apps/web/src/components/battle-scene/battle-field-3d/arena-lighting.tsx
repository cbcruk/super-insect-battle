import React from 'react'
import type { ArenaLightingProps } from './battle-field-3d.types.ts'

export function ArenaLighting({
  timeOfDay,
  weather,
}: ArenaLightingProps): React.ReactNode {
  const isNight = timeOfDay === 'night'
  const isRaining = weather === 'rain'

  const ambientIntensity = isNight ? 0.2 : isRaining ? 0.4 : 0.5
  const directionalIntensity = isNight ? 0.3 : isRaining ? 0.5 : 1.0
  const directionalColor = isNight ? '#4f46e5' : isRaining ? '#94a3b8' : '#ffffff'

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={directionalIntensity}
        color={directionalColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <hemisphereLight
        color={isNight ? '#1e1b4b' : '#87ceeb'}
        groundColor={isNight ? '#1f2937' : '#4b5563'}
        intensity={0.3}
      />
    </>
  )
}
