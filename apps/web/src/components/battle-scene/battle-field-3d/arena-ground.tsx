import React, { useMemo } from 'react'
import type { Terrain } from '@super-insect-battle/engine'
import type { ArenaGroundProps } from './battle-field-3d.types.ts'

const TERRAIN_COLORS: Record<
  Terrain,
  { grass: string; dirt: string; stone: string; sand: string }
> = {
  forest: { grass: '#5d8c3d', dirt: '#8b6b4a', stone: '#7a7a7a', sand: '#c4a35a' },
  desert: { grass: '#9ca35a', dirt: '#c4a35a', stone: '#a08040', sand: '#d4b36a' },
  wetland: { grass: '#3d6b4a', dirt: '#4a5a4a', stone: '#556b6b', sand: '#6a7a6a' },
  cave: { grass: '#3d4a3d', dirt: '#4a4a4a', stone: '#5a5a5a', sand: '#6a6a6a' },
}

const BLOCK_SIZE = 0.5
const GRID_WIDTH = 12
const GRID_DEPTH = 8

function pseudoRandom(seed: number, x: number, z: number): number {
  const n = Math.sin(seed * 12.9898 + x * 78.233 + z * 45.164) * 43758.5453
  return n - Math.floor(n)
}

function getBlockHeight(seed: number, x: number, z: number, gridW: number, gridD: number): number {
  const centerX = gridW / 2
  const centerZ = gridD / 2
  const distFromCenter = Math.sqrt(
    Math.pow((x - centerX) / centerX, 2) + Math.pow((z - centerZ) / centerZ, 2)
  )

  const rand = pseudoRandom(seed, x, z)
  const edgeLower = distFromCenter > 0.7 ? -1 : 0
  const baseHeight = rand < 0.15 ? 1 : rand < 0.3 ? -1 : 0

  return Math.max(-1, baseHeight + edgeLower)
}

interface BlockProps {
  x: number
  y: number
  z: number
  size: number
  topColor: string
  sideColor: string
}

function VoxelBlock({ x, y, z, size, topColor, sideColor }: BlockProps): React.ReactNode {
  return (
    <group position={[x * size, y * size, z * size]}>
      <mesh position={[0, size / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.98, size, size * 0.98]} />
        <meshStandardMaterial color={sideColor} roughness={0.9} />
      </mesh>
      <mesh position={[0, size + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size * 0.98, size * 0.98]} />
        <meshStandardMaterial color={topColor} roughness={0.85} />
      </mesh>
    </group>
  )
}

export function ArenaGround({ terrain }: ArenaGroundProps): React.ReactNode {
  const colors = useMemo(
    () => TERRAIN_COLORS[terrain] ?? TERRAIN_COLORS.forest,
    [terrain]
  )

  const blocks = useMemo(() => {
    const seed = terrain.charCodeAt(0)
    const result: Array<{
      x: number
      y: number
      z: number
      topColor: string
      sideColor: string
    }> = []

    const offsetX = -GRID_WIDTH / 2
    const offsetZ = -GRID_DEPTH / 2

    for (let gx = 0; gx < GRID_WIDTH; gx++) {
      for (let gz = 0; gz < GRID_DEPTH; gz++) {
        const height = getBlockHeight(seed, gx, gz, GRID_WIDTH, GRID_DEPTH)
        const x = gx + offsetX + 0.5
        const z = gz + offsetZ + 0.5

        const rand = pseudoRandom(seed, gx * 7, gz * 13)
        let topColor = colors.grass
        let sideColor = colors.dirt

        if (terrain === 'desert') {
          topColor = rand < 0.3 ? colors.stone : colors.sand
          sideColor = colors.sand
        } else if (terrain === 'cave') {
          topColor = rand < 0.5 ? colors.stone : colors.dirt
          sideColor = colors.stone
        } else if (terrain === 'wetland') {
          topColor = rand < 0.2 ? colors.dirt : colors.grass
          sideColor = colors.dirt
        }

        result.push({ x, y: height, z, topColor, sideColor })

        for (let dy = height - 1; dy >= -2; dy--) {
          result.push({
            x,
            y: dy,
            z,
            topColor: dy === height - 1 ? colors.dirt : colors.stone,
            sideColor: dy > -2 ? colors.dirt : colors.stone,
          })
        }
      }
    }

    return result
  }, [terrain, colors])

  return (
    <group>
      {blocks.map((block, i) => (
        <VoxelBlock
          key={i}
          x={block.x}
          y={block.y}
          z={block.z}
          size={BLOCK_SIZE}
          topColor={block.topColor}
          sideColor={block.sideColor}
        />
      ))}
    </group>
  )
}
