import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Character3DProps, CharacterAnimation } from './battle-field-3d.types.ts'
import { STYLE_COLORS } from '../../../lib/style-colors.ts'
import { InsectBody } from './insect-body/insect-body.tsx'

const ANIMATION_CONFIG = {
  idle: {
    swaySpeed: 1.2,
    swayAmount: 0.15,
    tiltAmount: 0.04,
    breatheSpeed: 1.5,
    breatheAmount: 0.03,
  },
  attack: {
    duration: 0.5,
    lungeDistance: 1.2,
    rotationAmount: 0.25,
  },
  defense: {
    duration: 0.4,
    scaleY: 0.6,
    scaleXZ: 1.15,
  },
  hit: {
    duration: 0.4,
    shakeAmount: 0.25,
    shakeSpeed: 25,
  },
}

export function Character3D({
  arthropod,
  side,
  fainted,
  animation = 'idle',
}: Character3DProps): React.ReactNode {
  const isPlayer = side === 'player'
  const basePosition: [number, number, number] = isPlayer
    ? [-1.5, 0.8, 0]
    : [1.5, 0.8, 0]

  const color = useMemo(
    () => STYLE_COLORS[arthropod.behavior.style]?.hex ?? '#6B7280',
    [arthropod.behavior.style]
  )

  const bodyGroupRef = useRef<THREE.Group>(null)
  const animationStartTime = useRef(0)
  const prevAnimation = useRef<CharacterAnimation>('idle')

  useFrame((state) => {
    if (!bodyGroupRef.current || fainted) return

    const time = state.clock.elapsedTime
    const group = bodyGroupRef.current
    const direction = isPlayer ? 1 : -1

    if (animation !== prevAnimation.current) {
      animationStartTime.current = time
      prevAnimation.current = animation
    }

    const animTime = time - animationStartTime.current

    switch (animation) {
      case 'idle': {
        const { swaySpeed, swayAmount, tiltAmount, breatheSpeed, breatheAmount } =
          ANIMATION_CONFIG.idle
        group.position.z = Math.sin(time * swaySpeed) * swayAmount * direction
        group.position.x = 0
        group.position.y = 0
        group.rotation.x = Math.sin(time * swaySpeed) * tiltAmount * direction
        group.rotation.z = 0

        const breathe = 1 + Math.sin(time * breatheSpeed) * breatheAmount
        group.scale.set(breathe, 1, breathe)
        break
      }

      case 'attack': {
        const { duration, lungeDistance, rotationAmount } = ANIMATION_CONFIG.attack
        const progress = Math.min(animTime / duration, 1)
        const easeOutBack = 1 - Math.pow(1 - progress, 3) * (1 + 2.5 * (1 - progress))
        const returnProgress = progress > 0.5 ? (progress - 0.5) * 2 : 0

        const lunge = easeOutBack * lungeDistance * (1 - returnProgress * 0.8)
        group.position.z = lunge * direction
        group.position.y = 0
        group.position.x = 0
        group.rotation.x = -rotationAmount * (1 - returnProgress) * direction
        group.rotation.z = 0
        group.scale.set(1, 1, 1)
        break
      }

      case 'defense': {
        const { duration, scaleY, scaleXZ } = ANIMATION_CONFIG.defense
        const progress = Math.min(animTime / duration, 1)
        const ease = 1 - Math.pow(1 - progress, 2)

        group.scale.y = 1 - (1 - scaleY) * ease
        group.scale.x = 1 + (scaleXZ - 1) * ease
        group.scale.z = 1 + (scaleXZ - 1) * ease
        group.position.y = -0.1 * ease
        group.position.x = 0
        group.position.z = 0
        group.rotation.set(0, 0, 0)
        break
      }

      case 'hit': {
        const { duration, shakeAmount, shakeSpeed } = ANIMATION_CONFIG.hit
        const progress = Math.min(animTime / duration, 1)
        const decay = 1 - progress

        group.position.x = Math.sin(animTime * shakeSpeed) * shakeAmount * decay
        group.position.z = -0.2 * decay * direction
        group.position.y = 0
        group.rotation.z = Math.sin(animTime * shakeSpeed * 1.3) * 0.1 * decay
        group.rotation.x = 0
        group.scale.set(1, 1, 1)
        break
      }
    }
  })

  return (
    <group position={basePosition}>
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial color="#000000" opacity={0.4} transparent />
      </mesh>

      <group
        ref={bodyGroupRef}
        scale={fainted ? [1, 0.3, 1] : [1, 1, 1]}
      >
        <InsectBody
          weaponType={arthropod.weapon.type}
          lengthMm={arthropod.physical.lengthMm}
          weightG={arthropod.physical.weightG}
          color={color}
          side={side}
        />
      </group>

      <Html
        position={[0, 1.2, 0]}
        center
        distanceFactor={6}
        style={{
          transition: 'opacity 0.3s ease',
          opacity: fainted ? 0.5 : 1,
          pointerEvents: 'none',
        }}
      >
        <div className="flex flex-col items-center whitespace-nowrap">
          <span
            className="rounded-md bg-black/60 px-2 py-0.5 text-sm font-bold"
            style={{ color }}
          >
            {arthropod.nameKo}
          </span>
          <span
            className={`mt-0.5 text-xs font-medium ${
              isPlayer ? 'text-cyan-300' : 'text-pink-300'
            }`}
          >
            {arthropod.name}
          </span>
        </div>
      </Html>
    </group>
  )
}
