import React, { useMemo } from 'react'

interface WoodFenceProps {
  width?: number
  depth?: number
}

const FENCE_POST_SIZE = 0.15
const FENCE_HEIGHT = 0.8
const FENCE_RAIL_HEIGHT = 0.08
const FENCE_RAIL_DEPTH = 0.05
const WOOD_COLOR = '#8b6b4a'
const WOOD_DARK = '#6b4a2a'

function FencePost({ x, z }: { x: number; z: number }): React.ReactNode {
  return (
    <mesh position={[x, FENCE_HEIGHT / 2, z]} castShadow>
      <boxGeometry args={[FENCE_POST_SIZE, FENCE_HEIGHT, FENCE_POST_SIZE]} />
      <meshStandardMaterial color={WOOD_COLOR} roughness={0.9} />
    </mesh>
  )
}

function FenceRail({
  x,
  z,
  length,
  rotateY = false,
  yOffset = 0,
}: {
  x: number
  z: number
  length: number
  rotateY?: boolean
  yOffset?: number
}): React.ReactNode {
  return (
    <mesh
      position={[x, FENCE_HEIGHT * 0.35 + yOffset, z]}
      rotation={[0, rotateY ? Math.PI / 2 : 0, 0]}
      castShadow
    >
      <boxGeometry args={[length, FENCE_RAIL_HEIGHT, FENCE_RAIL_DEPTH]} />
      <meshStandardMaterial color={WOOD_DARK} roughness={0.85} />
    </mesh>
  )
}

export function GlassBox({
  width = 6,
  depth = 4,
}: WoodFenceProps): React.ReactNode {
  const halfW = width / 2
  const halfD = depth / 2
  const postSpacing = 1

  const posts = useMemo(() => {
    const result: Array<{ x: number; z: number }> = []

    for (let x = -halfW; x <= halfW; x += postSpacing) {
      result.push({ x, z: -halfD })
      result.push({ x, z: halfD })
    }

    for (let z = -halfD + postSpacing; z < halfD; z += postSpacing) {
      result.push({ x: -halfW, z })
      result.push({ x: halfW, z })
    }

    return result
  }, [halfW, halfD, postSpacing])

  const rails = useMemo(() => {
    const result: Array<{
      x: number
      z: number
      length: number
      rotateY: boolean
      yOffset: number
    }> = []

    for (let x = -halfW + postSpacing / 2; x < halfW; x += postSpacing) {
      result.push({ x, z: -halfD, length: postSpacing, rotateY: false, yOffset: 0 })
      result.push({ x, z: -halfD, length: postSpacing, rotateY: false, yOffset: 0.25 })
      result.push({ x, z: halfD, length: postSpacing, rotateY: false, yOffset: 0 })
      result.push({ x, z: halfD, length: postSpacing, rotateY: false, yOffset: 0.25 })
    }

    for (let z = -halfD + postSpacing / 2; z < halfD; z += postSpacing) {
      result.push({ x: -halfW, z, length: postSpacing, rotateY: true, yOffset: 0 })
      result.push({ x: -halfW, z, length: postSpacing, rotateY: true, yOffset: 0.25 })
      result.push({ x: halfW, z, length: postSpacing, rotateY: true, yOffset: 0 })
      result.push({ x: halfW, z, length: postSpacing, rotateY: true, yOffset: 0.25 })
    }

    return result
  }, [halfW, halfD, postSpacing])

  return (
    <group position={[0, 0.25, 0]}>
      {posts.map((post, i) => (
        <FencePost key={`post-${i}`} x={post.x} z={post.z} />
      ))}
      {rails.map((rail, i) => (
        <FenceRail
          key={`rail-${i}`}
          x={rail.x}
          z={rail.z}
          length={rail.length}
          rotateY={rail.rotateY}
          yOffset={rail.yOffset}
        />
      ))}
    </group>
  )
}
