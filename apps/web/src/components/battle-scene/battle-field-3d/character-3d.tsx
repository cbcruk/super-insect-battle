import React, { useMemo } from 'react'
import { Html } from '@react-three/drei'
import type { Character3DProps } from './battle-field-3d.types.ts'
import { STYLE_COLORS } from '../../../lib/style-colors.ts'
import { getSpriteSize } from '../../../lib/sprite-utils.ts'

export function Character3D({
  arthropod,
  side,
  fainted,
}: Character3DProps): React.ReactNode {
  const isPlayer = side === 'player'
  const position: [number, number, number] = isPlayer ? [0, 0.5, 2.5] : [0, 0.5, -2.5]

  const color = useMemo(
    () => STYLE_COLORS[arthropod.behavior.style]?.hex ?? '#6B7280',
    [arthropod.behavior.style]
  )

  const size = useMemo(
    () => getSpriteSize(arthropod.physical.lengthMm),
    [arthropod.physical.lengthMm]
  )

  const scale = isPlayer ? 1 : 0.85

  return (
    <group position={position}>
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6 * scale, 32]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>

      <Html
        center
        transform
        distanceFactor={5}
        style={{
          transition: 'all 0.3s ease',
          opacity: fainted ? 0 : 1,
          transform: fainted ? 'translateY(20px)' : 'translateY(0)',
        }}
      >
        <div
          className="flex flex-col items-center"
          style={{ transform: `scale(${scale})` }}
        >
          <div
            className="flex items-center justify-center rounded-full border-2 shadow-lg"
            style={{
              width: size,
              height: size,
              backgroundColor: `${color}20`,
              borderColor: `${color}60`,
            }}
          >
            <span
              className="text-center font-bold leading-tight"
              style={{
                color,
                fontSize: Math.max(10, size / 7),
              }}
            >
              {arthropod.nameKo}
            </span>
          </div>
          <span
            className={`mt-1 text-xs font-medium ${
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
