import React, { useMemo } from 'react'
import type { Terrain } from '@super-insect-battle/engine'
import type { ArenaGroundProps } from './battle-field-3d.types.ts'

const TERRAIN_COLORS: Record<
  Terrain,
  { soil: string; soilDark: string; rock: string; plant: string }
> = {
  forest: { soil: '#3d2817', soilDark: '#2a1c10', rock: '#4a4a4a', plant: '#2d5a1e' },
  desert: { soil: '#c4a35a', soilDark: '#a08040', rock: '#8b7355', plant: '#6b8e23' },
  wetland: { soil: '#2f4f4f', soilDark: '#1a3333', rock: '#556b6b', plant: '#228b5b' },
  cave: { soil: '#2d2d2d', soilDark: '#1a1a1a', rock: '#4a4a4a', plant: '#3d5a3d' },
}

const BOX_WIDTH = 6
const BOX_DEPTH = 4

const ROCK_COUNT = 8
const ROCK_SCALE_MIN = 0.08
const ROCK_SCALE_RANGE = 0.12
const ROCK_MARGIN = 1

const PLANT_COUNT = 6
const PLANT_HEIGHT_MIN = 0.15
const PLANT_HEIGHT_RANGE = 0.2
const PLANT_MARGIN = 1.5
const PLANT_SEED_OFFSET = 50

function pseudoRandom(seed: number, index: number, multiplier: number): number {
  return ((seed * (index + 1) * multiplier) % 100) / 100
}

export function ArenaGround({ terrain }: ArenaGroundProps): React.ReactNode {
  const colors = useMemo(
    () => TERRAIN_COLORS[terrain] ?? TERRAIN_COLORS.forest,
    [terrain]
  )

  const rocks = useMemo(() => {
    const seed = terrain.charCodeAt(0)
    const spreadW = BOX_WIDTH - ROCK_MARGIN
    const spreadD = BOX_DEPTH - ROCK_MARGIN
    return Array.from({ length: ROCK_COUNT }, (_, i) => ({
      x: pseudoRandom(seed, i, 7) * spreadW - spreadW / 2,
      z: pseudoRandom(seed, i, 13) * spreadD - spreadD / 2,
      scale: ROCK_SCALE_MIN + pseudoRandom(seed, i, 3) * ROCK_SCALE_RANGE,
    }))
  }, [terrain])

  const plants = useMemo(() => {
    const seed = terrain.charCodeAt(0) + PLANT_SEED_OFFSET
    const spreadW = BOX_WIDTH - PLANT_MARGIN
    const spreadD = BOX_DEPTH - PLANT_MARGIN
    return Array.from({ length: PLANT_COUNT }, (_, i) => ({
      x: pseudoRandom(seed, i, 11) * spreadW - spreadW / 2,
      z: pseudoRandom(seed, i, 17) * spreadD - spreadD / 2,
      height: PLANT_HEIGHT_MIN + pseudoRandom(seed, i, 5) * PLANT_HEIGHT_RANGE,
    }))
  }, [terrain])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[BOX_WIDTH, BOX_DEPTH]} />
        <meshStandardMaterial color={colors.soil} roughness={0.9} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[BOX_WIDTH * 0.8, BOX_DEPTH * 0.8]} />
        <meshStandardMaterial
          color={colors.soilDark}
          roughness={1}
          transparent
          opacity={0.4}
        />
      </mesh>

      {rocks.map((rock, i) => (
        <mesh
          key={`rock-${i}`}
          position={[rock.x, rock.scale / 2, rock.z]}
          rotation={[0, i * 0.7, 0]}
        >
          <dodecahedronGeometry args={[rock.scale, 0]} />
          <meshStandardMaterial
            color={colors.rock}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ))}

      {plants.map((plant, i) => (
        <group key={`plant-${i}`} position={[plant.x, 0, plant.z]}>
          <mesh position={[0, plant.height / 2, 0]}>
            <coneGeometry args={[0.06, plant.height, 6]} />
            <meshStandardMaterial
              color={colors.plant}
              roughness={0.7}
            />
          </mesh>
          <mesh position={[0.04, plant.height * 0.4, 0.02]}>
            <coneGeometry args={[0.04, plant.height * 0.7, 5]} />
            <meshStandardMaterial
              color={colors.plant}
              roughness={0.7}
            />
          </mesh>
        </group>
      ))}

      <mesh position={[-BOX_WIDTH / 2 + 0.3, 0.1, -BOX_DEPTH / 2 + 0.3]}>
        <cylinderGeometry args={[0.15, 0.18, 0.08, 12]} />
        <meshStandardMaterial color={colors.soilDark} roughness={0.9} />
      </mesh>

      <mesh position={[BOX_WIDTH / 2 - 0.4, 0.08, BOX_DEPTH / 2 - 0.3]}>
        <cylinderGeometry args={[0.12, 0.15, 0.06, 10]} />
        <meshStandardMaterial color={colors.soilDark} roughness={0.9} />
      </mesh>
    </group>
  )
}
