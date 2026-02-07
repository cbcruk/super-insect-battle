import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import type { Points as PointsType } from 'three'
import * as THREE from 'three'
import type { Terrain } from '@super-insect-battle/engine'
import type { AmbientParticlesProps } from './battle-field-3d.types.ts'

const PARTICLE_CONFIG: Record<
  Terrain,
  { count: number; color: string; size: number; speed: number }
> = {
  forest: { count: 50, color: '#22c55e', size: 0.03, speed: 0.2 },
  desert: { count: 80, color: '#f59e0b', size: 0.02, speed: 0.5 },
  wetland: { count: 60, color: '#06b6d4', size: 0.025, speed: 0.15 },
  cave: { count: 30, color: '#9ca3af', size: 0.02, speed: 0.1 },
}

export function AmbientParticles({
  terrain,
  weather,
}: AmbientParticlesProps): React.ReactNode {
  const pointsRef = useRef<PointsType>(null)

  const config = useMemo(
    () => PARTICLE_CONFIG[terrain] ?? PARTICLE_CONFIG.forest,
    [terrain]
  )

  const isRaining = weather === 'rain'
  const particleCount = isRaining ? config.count * 2 : config.count

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12
      pos[i * 3 + 1] = Math.random() * 6
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12
    }
    return pos
  }, [particleCount])

  useFrame((_, delta) => {
    if (!pointsRef.current) return

    const positionArray = pointsRef.current.geometry.attributes.position
      .array as Float32Array
    const speed = isRaining ? config.speed * 3 : config.speed

    for (let i = 0; i < particleCount; i++) {
      positionArray[i * 3 + 1] -= speed * delta

      if (isRaining) {
        if (positionArray[i * 3 + 1] < 0) {
          positionArray[i * 3 + 1] = 6
          positionArray[i * 3] = (Math.random() - 0.5) * 12
          positionArray[i * 3 + 2] = (Math.random() - 0.5) * 12
        }
      } else {
        positionArray[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.002
        positionArray[i * 3 + 2] += Math.cos(Date.now() * 0.001 + i) * 0.002

        if (positionArray[i * 3 + 1] < 0) {
          positionArray[i * 3 + 1] = 6
        }
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  const particleColor = isRaining ? '#94a3b8' : config.color
  const particleSize = isRaining ? 0.015 : config.size

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={particleColor}
        size={particleSize}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}
