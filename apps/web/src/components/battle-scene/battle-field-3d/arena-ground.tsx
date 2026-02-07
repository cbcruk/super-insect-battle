import React, { useMemo } from 'react'
import { Grid } from '@react-three/drei'
import type { Terrain } from '@super-insect-battle/engine'
import type { ArenaGroundProps } from './battle-field-3d.types.ts'

const TERRAIN_COLORS: Record<Terrain, { grid: string; cell: string }> = {
  forest: { grid: '#22c55e', cell: '#14532d' },
  desert: { grid: '#f59e0b', cell: '#78350f' },
  wetland: { grid: '#06b6d4', cell: '#164e63' },
  cave: { grid: '#6b7280', cell: '#1f2937' },
}

export function ArenaGround({ terrain }: ArenaGroundProps): React.ReactNode {
  const colors = useMemo(
    () => TERRAIN_COLORS[terrain] ?? TERRAIN_COLORS.forest,
    [terrain]
  )

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={colors.cell} />
      </mesh>
      <Grid
        position={[0, 0, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor={colors.grid}
        sectionSize={5}
        sectionThickness={1}
        sectionColor={colors.grid}
        fadeDistance={15}
        fadeStrength={1}
        infiniteGrid={false}
      />
    </>
  )
}
