import React, { useMemo } from 'react'
import type { Terrain } from '@super-insect-battle/engine'

interface BlockDecorationsProps {
  terrain: Terrain
}

const BLOCK_SIZE = 0.5

const TERRAIN_PALETTE: Record<
  Terrain,
  { leaf: string; trunk: string; flower1: string; flower2: string; mushroom: string }
> = {
  forest: {
    leaf: '#2d6b1e',
    trunk: '#6b4a2a',
    flower1: '#e74c3c',
    flower2: '#f1c40f',
    mushroom: '#c0392b',
  },
  desert: {
    leaf: '#7a9a3d',
    trunk: '#8b7355',
    flower1: '#e67e22',
    flower2: '#f39c12',
    mushroom: '#d35400',
  },
  wetland: {
    leaf: '#1a5a3a',
    trunk: '#4a5a4a',
    flower1: '#9b59b6',
    flower2: '#3498db',
    mushroom: '#8e44ad',
  },
  cave: {
    leaf: '#3d5a3d',
    trunk: '#5a5a5a',
    flower1: '#1abc9c',
    flower2: '#16a085',
    mushroom: '#e74c3c',
  },
}

function pseudoRandom(seed: number, index: number): number {
  const n = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453
  return n - Math.floor(n)
}

function BlockTree({
  x,
  z,
  leafColor,
  trunkColor,
}: {
  x: number
  z: number
  leafColor: string
  trunkColor: string
}): React.ReactNode {
  const trunkHeight = 2
  const leafSize = 1.5

  return (
    <group position={[x, 0.25, z]}>
      {[0, 1].map((i) => (
        <mesh key={`trunk-${i}`} position={[0, BLOCK_SIZE * (i + 0.5), 0]} castShadow>
          <boxGeometry args={[BLOCK_SIZE * 0.6, BLOCK_SIZE, BLOCK_SIZE * 0.6]} />
          <meshStandardMaterial color={trunkColor} roughness={0.9} />
        </mesh>
      ))}

      {[-0.5, 0, 0.5].map((dx) =>
        [-0.5, 0, 0.5].map((dz) => (
          <mesh
            key={`leaf-${dx}-${dz}`}
            position={[dx * BLOCK_SIZE, BLOCK_SIZE * trunkHeight, dz * BLOCK_SIZE]}
            castShadow
          >
            <boxGeometry args={[BLOCK_SIZE * 0.95, BLOCK_SIZE, BLOCK_SIZE * 0.95]} />
            <meshStandardMaterial color={leafColor} roughness={0.8} />
          </mesh>
        ))
      )}

      {[-0.5, 0.5].map((dx) =>
        [-0.5, 0.5].map((dz) => (
          <mesh
            key={`leaf-top-${dx}-${dz}`}
            position={[dx * BLOCK_SIZE * 0.5, BLOCK_SIZE * (trunkHeight + 1), dz * BLOCK_SIZE * 0.5]}
            castShadow
          >
            <boxGeometry args={[BLOCK_SIZE * 0.95, BLOCK_SIZE, BLOCK_SIZE * 0.95]} />
            <meshStandardMaterial color={leafColor} roughness={0.8} />
          </mesh>
        ))
      )}

      <mesh position={[0, BLOCK_SIZE * (trunkHeight + 2), 0]} castShadow>
        <boxGeometry args={[BLOCK_SIZE * 0.95, BLOCK_SIZE, BLOCK_SIZE * 0.95]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} />
      </mesh>
    </group>
  )
}

function BlockFlower({
  x,
  z,
  color,
}: {
  x: number
  z: number
  color: string
}): React.ReactNode {
  return (
    <group position={[x, 0.25, z]}>
      <mesh position={[0, BLOCK_SIZE * 0.3, 0]}>
        <boxGeometry args={[BLOCK_SIZE * 0.15, BLOCK_SIZE * 0.6, BLOCK_SIZE * 0.15]} />
        <meshStandardMaterial color="#4a7a2a" roughness={0.8} />
      </mesh>
      <mesh position={[0, BLOCK_SIZE * 0.7, 0]}>
        <boxGeometry args={[BLOCK_SIZE * 0.35, BLOCK_SIZE * 0.25, BLOCK_SIZE * 0.35]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  )
}

function BlockMushroom({
  x,
  z,
  color,
}: {
  x: number
  z: number
  color: string
}): React.ReactNode {
  return (
    <group position={[x, 0.25, z]}>
      <mesh position={[0, BLOCK_SIZE * 0.2, 0]}>
        <boxGeometry args={[BLOCK_SIZE * 0.2, BLOCK_SIZE * 0.4, BLOCK_SIZE * 0.2]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.8} />
      </mesh>
      <mesh position={[0, BLOCK_SIZE * 0.5, 0]}>
        <boxGeometry args={[BLOCK_SIZE * 0.5, BLOCK_SIZE * 0.25, BLOCK_SIZE * 0.5]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  )
}

function BlockGrass({
  x,
  z,
}: {
  x: number
  z: number
}): React.ReactNode {
  return (
    <group position={[x, 0.25, z]}>
      {[-0.08, 0, 0.08].map((offset, i) => (
        <mesh key={i} position={[offset, BLOCK_SIZE * 0.25, offset * 0.5]}>
          <boxGeometry args={[BLOCK_SIZE * 0.08, BLOCK_SIZE * 0.5, BLOCK_SIZE * 0.08]} />
          <meshStandardMaterial color="#5a8a3a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function BlockDecorations({ terrain }: BlockDecorationsProps): React.ReactNode {
  const palette = useMemo(
    () => TERRAIN_PALETTE[terrain] ?? TERRAIN_PALETTE.forest,
    [terrain]
  )

  const decorations = useMemo(() => {
    const seed = terrain.charCodeAt(0)
    const trees: Array<{ x: number; z: number }> = []
    const flowers: Array<{ x: number; z: number; color: string }> = []
    const mushrooms: Array<{ x: number; z: number }> = []
    const grass: Array<{ x: number; z: number }> = []

    const treePositions = [
      { x: -2.2, z: -1.2 },
      { x: 2.0, z: 1.0 },
    ]
    trees.push(...treePositions)

    for (let i = 0; i < 8; i++) {
      const x = (pseudoRandom(seed, i * 3) - 0.5) * 4.5
      const z = (pseudoRandom(seed, i * 3 + 1) - 0.5) * 2.5
      const color = pseudoRandom(seed, i * 3 + 2) > 0.5 ? palette.flower1 : palette.flower2
      flowers.push({ x, z, color })
    }

    if (terrain === 'forest' || terrain === 'wetland' || terrain === 'cave') {
      for (let i = 0; i < 4; i++) {
        const x = (pseudoRandom(seed + 100, i * 2) - 0.5) * 4
        const z = (pseudoRandom(seed + 100, i * 2 + 1) - 0.5) * 2
        mushrooms.push({ x, z })
      }
    }

    for (let i = 0; i < 12; i++) {
      const x = (pseudoRandom(seed + 200, i * 2) - 0.5) * 5
      const z = (pseudoRandom(seed + 200, i * 2 + 1) - 0.5) * 3
      grass.push({ x, z })
    }

    return { trees, flowers, mushrooms, grass }
  }, [terrain, palette])

  return (
    <group>
      {decorations.trees.map((tree, i) => (
        <BlockTree
          key={`tree-${i}`}
          x={tree.x}
          z={tree.z}
          leafColor={palette.leaf}
          trunkColor={palette.trunk}
        />
      ))}
      {decorations.flowers.map((flower, i) => (
        <BlockFlower
          key={`flower-${i}`}
          x={flower.x}
          z={flower.z}
          color={flower.color}
        />
      ))}
      {decorations.mushrooms.map((mushroom, i) => (
        <BlockMushroom
          key={`mushroom-${i}`}
          x={mushroom.x}
          z={mushroom.z}
          color={palette.mushroom}
        />
      ))}
      {decorations.grass.map((g, i) => (
        <BlockGrass key={`grass-${i}`} x={g.x} z={g.z} />
      ))}
    </group>
  )
}
