import React from 'react'
import type { BodyPartProps } from './insect-body.types.ts'

export function BodyLeg({
  scale,
  thickness,
  color,
  darkColor,
}: BodyPartProps): React.ReactNode {
  const segmentCount = 5
  const segmentLength = 0.25

  return (
    <group scale={scale}>
      <mesh position={[0, 0.15 * thickness, 0]}>
        <sphereGeometry args={[0.15 * thickness, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.3} metalness={0.4} />
      </mesh>

      {Array.from({ length: segmentCount }).map((_, i) => {
        const xOffset = (i - (segmentCount - 1) / 2) * segmentLength
        return (
          <mesh key={i} position={[xOffset, 0, 0]}>
            <sphereGeometry args={[0.12 * thickness, 12, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.3} metalness={0.4} />
          </mesh>
        )
      })}

      {Array.from({ length: segmentCount }).map((_, i) => {
        const xOffset = (i - (segmentCount - 1) / 2) * segmentLength
        return (
          <React.Fragment key={i}>
            <mesh position={[xOffset, -0.08, 0.12]} rotation={[0.5, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.015, 0.25, 6]} />
              <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.15} roughness={0.4} />
            </mesh>
            <mesh position={[xOffset, -0.08, -0.12]} rotation={[-0.5, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.015, 0.25, 6]} />
              <meshStandardMaterial color={darkColor} emissive={darkColor} emissiveIntensity={0.15} roughness={0.4} />
            </mesh>
          </React.Fragment>
        )
      })}

      <mesh position={[0, -0.2 * thickness, 0]}>
        <sphereGeometry args={[0.1 * thickness, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  )
}
