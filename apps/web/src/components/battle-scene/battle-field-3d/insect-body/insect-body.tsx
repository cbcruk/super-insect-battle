import React, { useMemo } from 'react'
import type { InsectBodyProps } from './insect-body.types.ts'
import { getBodyScale, getBodyThickness, getDarkColor } from './insect-body.types.ts'
import { BodyHorn } from './body-horn.tsx'
import { BodyMandible } from './body-mandible.tsx'
import { BodyStinger } from './body-stinger.tsx'
import { BodyFang } from './body-fang.tsx'
import { BodyForeleg } from './body-foreleg.tsx'
import { BodyLeg } from './body-leg.tsx'

export function InsectBody({
  weaponType,
  lengthMm,
  weightG,
  color,
  side,
}: InsectBodyProps): React.ReactNode {
  const scale = useMemo(() => getBodyScale(lengthMm), [lengthMm])
  const thickness = useMemo(() => getBodyThickness(weightG), [weightG])
  const darkColor = useMemo(() => getDarkColor(color), [color])

  const bodyProps = {
    scale,
    thickness,
    color,
    darkColor,
    side,
  }

  const rotation: [number, number, number] = side === 'player'
    ? [0, Math.PI / 2, 0]
    : [0, -Math.PI / 2, 0]

  return (
    <group rotation={rotation}>
      {weaponType === 'horn' && <BodyHorn {...bodyProps} />}
      {weaponType === 'mandible' && <BodyMandible {...bodyProps} />}
      {weaponType === 'stinger' && <BodyStinger {...bodyProps} />}
      {weaponType === 'fang' && <BodyFang {...bodyProps} />}
      {weaponType === 'foreleg' && <BodyForeleg {...bodyProps} />}
      {weaponType === 'leg' && <BodyLeg {...bodyProps} />}
    </group>
  )
}
