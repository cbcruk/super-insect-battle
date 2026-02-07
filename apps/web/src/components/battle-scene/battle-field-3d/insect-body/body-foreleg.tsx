import React from 'react'
import type { BodyPartProps } from './insect-body.types.ts'

export function BodyForeleg({
  scale,
  thickness,
  color,
  darkColor,
  side,
}: BodyPartProps): React.ReactNode {
  const direction = side === 'player' ? 1 : -1

  return (
    <group scale={scale}>
      <mesh position={[0, 0.4 * thickness, 0]} rotation={[0.2, 0, 0]}>
        <sphereGeometry args={[0.15 * thickness, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.3} metalness={0.4} />
      </mesh>

      <mesh position={[0, 0.15 * thickness, 0]}>
        <cylinderGeometry args={[0.12 * thickness, 0.18 * thickness, 0.4, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.3} metalness={0.4} />
      </mesh>

      <mesh position={[0, -0.15 * thickness, 0]}>
        <sphereGeometry args={[0.25 * thickness, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.3} metalness={0.4} />
      </mesh>

      <group position={[0.2 * direction, 0.3 * thickness, 0.1]} rotation={[0, direction * 0.3, direction * -0.5]}>
        <mesh position={[0.15 * direction, 0, 0]} rotation={[0, 0, direction * -0.3]}>
          <cylinderGeometry args={[0.035, 0.04, 0.35, 8]} />
          <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.2} roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0.35 * direction, -0.1, 0]} rotation={[0, 0, direction * 0.5]}>
          <cylinderGeometry args={[0.025, 0.035, 0.3, 8]} />
          <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.2} roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0.45 * direction, -0.25, 0]} rotation={[0, 0, direction * -0.3]}>
          <coneGeometry args={[0.02, 0.15, 6]} />
          <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.2} roughness={0.1} metalness={0.6} />
        </mesh>
      </group>

      <group position={[0.2 * direction, 0.3 * thickness, -0.1]} rotation={[0, direction * -0.3, direction * -0.5]}>
        <mesh position={[0.15 * direction, 0, 0]} rotation={[0, 0, direction * -0.3]}>
          <cylinderGeometry args={[0.035, 0.04, 0.35, 8]} />
          <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.2} roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0.35 * direction, -0.1, 0]} rotation={[0, 0, direction * 0.5]}>
          <cylinderGeometry args={[0.025, 0.035, 0.3, 8]} />
          <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.2} roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0.45 * direction, -0.25, 0]} rotation={[0, 0, direction * -0.3]}>
          <coneGeometry args={[0.02, 0.15, 6]} />
          <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.2} roughness={0.1} metalness={0.6} />
        </mesh>
      </group>

      {[0.15, -0.15].map((z, i) => (
        <React.Fragment key={i}>
          <mesh position={[0.2, -0.25, z]} rotation={[0, 0, 0.7]}>
            <cylinderGeometry args={[0.025, 0.02, 0.3, 8]} />
            <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.15} roughness={0.4} />
          </mesh>
          <mesh position={[-0.2, -0.25, z]} rotation={[0, 0, -0.7]}>
            <cylinderGeometry args={[0.025, 0.02, 0.3, 8]} />
            <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.15} roughness={0.4} />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  )
}
