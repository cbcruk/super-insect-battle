import React from 'react'
import type { BodyPartProps } from './insect-body.types.ts'

export function BodyFang({
  scale,
  thickness,
  color,
  darkColor,
  side,
}: BodyPartProps): React.ReactNode {
  const direction = side === 'player' ? 1 : -1

  return (
    <group scale={scale}>
      <mesh position={[0.15 * direction, 0.15 * thickness, 0]}>
        <sphereGeometry args={[0.2 * thickness, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.5} metalness={0.2} />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.4 * thickness, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.5} metalness={0.2} />
      </mesh>

      <mesh
        position={[0.25 * direction, 0.05 * thickness, 0.08]}
        rotation={[0.3, 0, direction * -0.8]}
      >
        <coneGeometry args={[0.03, 0.15, 6]} />
        <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.2} roughness={0.1} metalness={0.5} />
      </mesh>
      <mesh
        position={[0.25 * direction, 0.05 * thickness, -0.08]}
        rotation={[-0.3, 0, direction * -0.8]}
      >
        <coneGeometry args={[0.03, 0.15, 6]} />
        <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.2} roughness={0.1} metalness={0.5} />
      </mesh>

      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI - Math.PI / 4
        const x = Math.cos(angle) * 0.35
        const z = Math.sin(angle) * 0.35
        return (
          <React.Fragment key={i}>
            <mesh
              position={[x, -0.1, z]}
              rotation={[z * 0.8, 0, x > 0 ? 0.7 : -0.7]}
            >
              <cylinderGeometry args={[0.03, 0.02, 0.4, 8]} />
              <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.15} roughness={0.4} />
            </mesh>
            <mesh
              position={[-x, -0.1, z]}
              rotation={[z * 0.8, 0, -x > 0 ? 0.7 : -0.7]}
            >
              <cylinderGeometry args={[0.03, 0.02, 0.4, 8]} />
              <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.15} roughness={0.4} />
            </mesh>
          </React.Fragment>
        )
      })}
    </group>
  )
}
