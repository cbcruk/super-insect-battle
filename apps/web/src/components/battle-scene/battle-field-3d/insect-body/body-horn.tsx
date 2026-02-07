import React from 'react'
import type { BodyPartProps } from './insect-body.types.ts'

export function BodyHorn({
  scale,
  thickness,
  color,
  darkColor,
  side,
}: BodyPartProps): React.ReactNode {
  const direction = side === 'player' ? 1 : -1

  return (
    <group scale={scale}>
      <mesh position={[0, 0.3 * thickness, 0]}>
        <sphereGeometry args={[0.4 * thickness, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.3} metalness={0.4} />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5 * thickness, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, -0.1 * thickness, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.5 * thickness, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.3} metalness={0.4} />
      </mesh>

      <mesh
        position={[0.3 * direction, 0.5 * thickness, 0]}
        rotation={[0, 0, direction * -0.5]}
      >
        <coneGeometry args={[0.08, 0.6, 8]} />
        <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.2} roughness={0.2} metalness={0.6} />
      </mesh>

      {[0.2, -0.2].map((z, i) => (
        <React.Fragment key={i}>
          <mesh position={[0.3, -0.2, z]} rotation={[0, 0, 0.8]}>
            <cylinderGeometry args={[0.04, 0.03, 0.4, 8]} />
            <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.15} roughness={0.4} />
          </mesh>
          <mesh position={[-0.3, -0.2, z]} rotation={[0, 0, -0.8]}>
            <cylinderGeometry args={[0.04, 0.03, 0.4, 8]} />
            <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.15} roughness={0.4} />
          </mesh>
          <mesh position={[0.35, -0.15, z * 0.5]} rotation={[0, 0, 0.6]}>
            <cylinderGeometry args={[0.035, 0.025, 0.35, 8]} />
            <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.15} roughness={0.4} />
          </mesh>
          <mesh position={[-0.35, -0.15, z * 0.5]} rotation={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.035, 0.025, 0.35, 8]} />
            <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.15} roughness={0.4} />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  )
}
