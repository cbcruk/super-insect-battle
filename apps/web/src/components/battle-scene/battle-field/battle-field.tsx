import React, { lazy, Suspense, useMemo } from 'react'
import { isWebGLSupported } from '../../../lib/webgl-support.ts'
import { BattleField2D } from './battle-field-2d.tsx'
import type { BattleFieldProps } from './battle-field.types.ts'

const BattleField3D = lazy(
  () => import('../battle-field-3d/battle-field-3d.tsx')
)

export type { BattleFieldProps }

export function BattleField(props: BattleFieldProps): React.ReactNode {
  const webglSupported = useMemo(() => isWebGLSupported(), [])

  if (webglSupported) {
    return (
      <Suspense fallback={<BattleField2D {...props} />}>
        <BattleField3D {...props} />
      </Suspense>
    )
  }

  return <BattleField2D {...props} />
}
