import React, { useMemo } from 'react'
import * as THREE from 'three'

interface GlassBoxProps {
  width?: number
  height?: number
  depth?: number
}

const GLASS_OPACITY = 0.12
const FRAME_OPACITY = 0.4
const FRAME_THICKNESS = 0.05

export function GlassBox({
  width = 6,
  height = 3,
  depth = 4,
}: GlassBoxProps): React.ReactNode {
  const glassWalls = useMemo(() => [
    { pos: [0, height / 2, depth / 2], rot: [0, 0, 0], size: [width, height] },
    { pos: [0, height / 2, -depth / 2], rot: [0, Math.PI, 0], size: [width, height] },
    { pos: [-width / 2, height / 2, 0], rot: [0, Math.PI / 2, 0], size: [depth, height] },
    { pos: [width / 2, height / 2, 0], rot: [0, -Math.PI / 2, 0], size: [depth, height] },
  ] as const, [width, height, depth])

  const verticalFrames = useMemo(() => [
    [-width / 2, 0, -depth / 2],
    [width / 2, 0, -depth / 2],
    [-width / 2, 0, depth / 2],
    [width / 2, 0, depth / 2],
  ] as const, [width, depth])

  const horizontalWidthFrames = useMemo(() => [
    [0, 0, -depth / 2],
    [0, 0, depth / 2],
    [0, height, -depth / 2],
    [0, height, depth / 2],
  ] as const, [height, depth])

  const horizontalDepthFrames = useMemo(() => [
    [-width / 2, 0, 0],
    [width / 2, 0, 0],
    [-width / 2, height, 0],
    [width / 2, height, 0],
  ] as const, [width, height])

  return (
    <group>
      {glassWalls.map((wall, i) => (
        <mesh
          key={`glass-${i}`}
          position={wall.pos as [number, number, number]}
          rotation={wall.rot as [number, number, number]}
        >
          <planeGeometry args={wall.size as [number, number]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={GLASS_OPACITY}
            roughness={0.05}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {verticalFrames.map((pos, i) => (
        <mesh key={`vertical-${i}`} position={[pos[0], height / 2, pos[2]]}>
          <boxGeometry args={[FRAME_THICKNESS, height, FRAME_THICKNESS]} />
          <meshStandardMaterial
            color="#1a1a1a"
            transparent
            opacity={FRAME_OPACITY}
          />
        </mesh>
      ))}

      {horizontalWidthFrames.map((pos, i) => (
        <mesh key={`horizontal-w-${i}`} position={[pos[0], pos[1], pos[2]]}>
          <boxGeometry args={[width, FRAME_THICKNESS, FRAME_THICKNESS]} />
          <meshStandardMaterial
            color="#1a1a1a"
            transparent
            opacity={FRAME_OPACITY}
          />
        </mesh>
      ))}

      {horizontalDepthFrames.map((pos, i) => (
        <mesh key={`horizontal-d-${i}`} position={[pos[0], pos[1], pos[2]]}>
          <boxGeometry args={[FRAME_THICKNESS, FRAME_THICKNESS, depth]} />
          <meshStandardMaterial
            color="#1a1a1a"
            transparent
            opacity={FRAME_OPACITY}
          />
        </mesh>
      ))}
    </group>
  )
}
