import { describe, it, expect } from 'vitest'
import { arthropodList } from '@super-insect-battle/engine'
import { HOSTILE_GLYPHS } from '@super-insect-battle/roguelike'
import { SILHOUETTE_SPAN, silhouetteFor } from './insect-silhouette.ts'
import type { Silhouette } from './insect-silhouette.types.ts'

const HALF = SILHOUETTE_SPAN / 2

function extents(silhouette: Silhouette): number[] {
  return silhouette.flatMap((shape) => {
    if (shape.kind === 'ellipse') {
      return [Math.abs(shape.cx) + shape.rx, Math.abs(shape.cy) + shape.ry]
    }
    const pad = shape.kind === 'line' ? shape.width / 2 : 0
    return shape.points.map((v) => Math.abs(v) + pad)
  })
}

describe('silhouetteFor', () => {
  it('draws every species inside its cell', () => {
    for (const species of arthropodList) {
      const silhouette = silhouetteFor(species)
      expect(silhouette.length).toBeGreaterThan(0)
      expect(Math.max(...extents(silhouette))).toBeLessThanOrEqual(HALF + 0.5)
    }
  })

  it('gives every hostile species a distinct outline', () => {
    const outlines = Object.keys(HOSTILE_GLYPHS)
      .filter((id) => id !== 'black_widow' && id !== 'tarantula')
      .map((id) => {
        const species = arthropodList.find((a) => a.id === id)!
        return JSON.stringify(silhouetteFor(species))
      })
    expect(new Set(outlines).size).toBe(outlines.length)
  })

  it('falls back to the weapon type for unknown species', () => {
    const fang = silhouetteFor({
      id: 'unknown_spider',
      weapon: { type: 'fang', power: 10, venomous: true },
    })
    const tarantula = arthropodList.find((a) => a.id === 'tarantula')!
    expect(fang).toEqual(silhouetteFor(tarantula))
  })
})
