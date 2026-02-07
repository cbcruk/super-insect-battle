import React, { useMemo } from 'react'
import { Html } from '@react-three/drei'
import type { Character3DProps } from './battle-field-3d.types.ts'
import { STYLE_COLORS } from '../../../lib/style-colors.ts'
import { InsectBody } from './insect-body/insect-body.tsx'

export function Character3D({
  arthropod,
  side,
  fainted,
}: Character3DProps): React.ReactNode {
  const isPlayer = side === 'player'
  const position: [number, number, number] = isPlayer
    ? [-1.5, 0.3, 0]
    : [1.5, 0.3, 0]

  const color = useMemo(
    () => STYLE_COLORS[arthropod.behavior.style]?.hex ?? '#6B7280',
    [arthropod.behavior.style]
  )

  return (
    <group position={position}>
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial color="#000000" opacity={0.4} transparent />
      </mesh>

      <group position={[0, 0, 0]} scale={fainted ? [1, 0.3, 1] : [1, 1, 1]}>
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
