import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BlockParticle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  rotation: THREE.Euler
  rotationSpeed: THREE.Vector3
  scale: number
  color: string
  lifetime: number
}

interface BlockParticlesProps {
  position: [number, number, number]
  count: number
  color?: string
  onComplete: () => void
}

const PARTICLE_LIFETIME = 1.0
const GRAVITY = -9.8

function createParticles(
  position: [number, number, number],
  count: number,
  color: string
): BlockParticle[] {
  const particles: BlockParticle[] = []

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 1.5 + Math.random() * 2
    const upSpeed = 2 + Math.random() * 3

    particles.push({
      position: new THREE.Vector3(
        position[0] + (Math.random() - 0.5) * 0.3,
        position[1] + Math.random() * 0.3,
        position[2] + (Math.random() - 0.5) * 0.3
      ),
      velocity: new THREE.Vector3(
        Math.cos(angle) * speed,
        upSpeed,
        Math.sin(angle) * speed
      ),
      rotation: new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ),
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ),
      scale: 0.05 + Math.random() * 0.08,
      color,
      lifetime: PARTICLE_LIFETIME,
    })
  }

  return particles
}

export function BlockParticles({
  position,
  count,
  color = '#8B4513',
  onComplete,
}: BlockParticlesProps): React.ReactNode {
  const particles = useMemo(
    () => createParticles(position, count, color),
    [position, count, color]
  )
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const startTime = useRef(0)

  useFrame((state, delta) => {
    if (startTime.current === 0) {
      startTime.current = state.clock.elapsedTime
    }

    const elapsed = state.clock.elapsedTime - startTime.current

    if (elapsed >= PARTICLE_LIFETIME) {
      onComplete()
      return
    }

    particles.forEach((particle, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return

      particle.velocity.y += GRAVITY * delta
      particle.position.add(particle.velocity.clone().multiplyScalar(delta))

      particle.rotation.x += particle.rotationSpeed.x * delta
      particle.rotation.y += particle.rotationSpeed.y * delta
      particle.rotation.z += particle.rotationSpeed.z * delta

      mesh.position.copy(particle.position)
      mesh.rotation.copy(particle.rotation)

      const progress = elapsed / PARTICLE_LIFETIME
      const scale = particle.scale * (1 - progress * progress)
      mesh.scale.set(scale, scale, scale)
    })
  })

  return (
    <group>
      {particles.map((particle, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el
          }}
          position={particle.position}
          rotation={particle.rotation}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={particle.color} />
        </mesh>
      ))}
    </group>
  )
}

interface BlockParticleManagerProps {
  effects: Array<{
    id: string
    position: [number, number, number]
    color?: string
    count?: number
  }>
  onEffectComplete: (id: string) => void
}

export function BlockParticleManager({
  effects,
  onEffectComplete,
}: BlockParticleManagerProps): React.ReactNode {
  return (
    <>
      {effects.map((effect) => (
        <BlockParticles
          key={effect.id}
          position={effect.position}
          count={effect.count ?? 8}
          color={effect.color}
          onComplete={() => onEffectComplete(effect.id)}
        />
      ))}
    </>
  )
}
