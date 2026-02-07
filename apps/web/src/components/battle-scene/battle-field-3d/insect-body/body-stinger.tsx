import React from 'react'
import type { BodyPartProps } from './insect-body.types.ts'

export function BodyStinger({
  scale,
  thickness,
  color,
  darkColor,
  side,
}: BodyPartProps): React.ReactNode {
  const direction = side === 'player' ? 1 : -1

  return (
    <group scale={scale}>
      <mesh position={[0.15 * direction, 0.2 * thickness, 0]}>
        <sphereGeometry args={[0.25 * thickness, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.3} metalness={0.4} />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.35 * thickness, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.3} metalness={0.4} />
      </mesh>

      <mesh
        position={[-0.35 * direction, 0.15 * thickness, 0]}
        rotation={[0, 0, direction * 0.3]}
      >
        <cylinderGeometry args={[0.12 * thickness, 0.08 * thickness, 0.4, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh
        position={[-0.55 * direction, 0.25 * thickness, 0]}
        rotation={[0, 0, direction * 0.6]}
      >
        <cylinderGeometry args={[0.08 * thickness, 0.06 * thickness, 0.3, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh
        position={[-0.7 * direction, 0.4 * thickness, 0]}
        rotation={[0, 0, direction * 1.0]}
      >
        <coneGeometry args={[0.06, 0.2, 8]} />
        <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.2} roughness={0.1} metalness={0.7} />
      </mesh>

      {[-0.15, 0.15].map((z, i) => (
        <React.Fragment key={i}>
          <mesh position={[0.25, -0.15, z]} rotation={[0, 0, 0.6]}>
            <cylinderGeometry args={[0.035, 0.025, 0.35, 8]} />
            <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.15} roughness={0.4} />
          </mesh>
          <mesh position={[-0.2, -0.2, z]} rotation={[0, 0, -0.8]}>
            <cylinderGeometry args={[0.035, 0.025, 0.35, 8]} />
            <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.15} roughness={0.4} />
          </mesh>
          <mesh position={[0.35, -0.1, z * 0.7]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.03, 0.02, 0.3, 8]} />
            <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.15} roughness={0.4} />
          </mesh>
          <mesh position={[-0.25, -0.15, z * 0.7]} rotation={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.03, 0.02, 0.3, 8]} />
            <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.15} roughness={0.4} />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  )
}
