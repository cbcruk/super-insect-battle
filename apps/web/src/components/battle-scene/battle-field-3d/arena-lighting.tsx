import React from 'react'
import type { ArenaLightingProps } from './battle-field-3d.types.ts'

export function ArenaLighting({
  timeOfDay,
  weather,
}: ArenaLightingProps): React.ReactNode {
  const isNight = timeOfDay === 'night'
  const isRaining = weather === 'rain'

  const ambientIntensity = isNight ? 0.4 : isRaining ? 0.5 : 0.6
  const mainLightIntensity = isNight ? 0.8 : isRaining ? 1.0 : 1.2
  const mainLightColor = isNight ? '#e0e7ff' : isRaining ? '#cbd5e1' : '#fff9e6'

  return (
    <>
      <ambientLight intensity={ambientIntensity} color="#f5f5f5" />

      <directionalLight
        position={[0, 10, 3]}
        intensity={mainLightIntensity}
        color={mainLightColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={15}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />

      <pointLight
        position={[0, 4, 5]}
        intensity={0.4}
        color="#ffffff"
        distance={10}
      />

      <pointLight
        position={[-2, 2, -2]}
        intensity={0.2}
        color="#fef3c7"
        distance={6}
      />
      <pointLight
        position={[2, 2, -2]}
        intensity={0.2}
        color="#fef3c7"
        distance={6}
      />
    </>
  )
}
