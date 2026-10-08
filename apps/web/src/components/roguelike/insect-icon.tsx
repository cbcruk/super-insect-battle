import React from 'react'
import type { Arthropod } from '@super-insect-battle/engine'
import { SILHOUETTE_SPAN, silhouetteFor } from '../../lib/insect-silhouette.ts'
import { pointList } from './insect-icon.utils.ts'

const HALF = SILHOUETTE_SPAN / 2

/** 맵에 그려지는 것과 같은 곤충 실루엣을 SVG 아이콘으로 보여준다. */
export function InsectIcon({
  species,
  color,
  size = 16,
}: {
  species: Pick<Arthropod, 'id' | 'weapon'>
  color: string
  size?: number
}): React.ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-HALF} ${-HALF} ${SILHOUETTE_SPAN} ${SILHOUETTE_SPAN}`}
      fill={color}
      stroke={color}
      aria-hidden
    >
      {silhouetteFor(species).map((shape, i) => {
        if (shape.kind === 'ellipse') {
          return (
            <ellipse
              key={i}
              cx={shape.cx}
              cy={shape.cy}
              rx={shape.rx}
              ry={shape.ry}
              stroke="none"
              fillOpacity={shape.opacity}
            />
          )
        }
        if (shape.kind === 'polygon') {
          return (
            <polygon
              key={i}
              points={pointList(shape.points)}
              stroke="none"
              fillOpacity={shape.opacity}
            />
          )
        }
        return (
          <polyline
            key={i}
            points={pointList(shape.points)}
            fill="none"
            strokeWidth={shape.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )
      })}
    </svg>
  )
}
