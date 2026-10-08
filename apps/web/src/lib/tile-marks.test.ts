import { describe, it, expect } from 'vitest'
import {
  ITEM_IDS,
  TERRAIN,
  type TerrainType,
} from '@super-insect-battle/roguelike'
import { SILHOUETTE_SPAN } from './insect-silhouette.ts'
import type { Silhouette } from './insect-silhouette.types.ts'
import { EXIT_MARK, itemMark, terrainMark } from './tile-marks.ts'

const HALF = SILHOUETTE_SPAN / 2
const TERRAINS = Object.keys(TERRAIN) as TerrainType[]

function reach(mark: Silhouette): number {
  return Math.max(
    ...mark.flatMap((shape) =>
      shape.kind === 'ellipse'
        ? [Math.abs(shape.cx) + shape.rx, Math.abs(shape.cy) + shape.ry]
        : shape.points.map(
            (v) => Math.abs(v) + (shape.kind === 'line' ? shape.width / 2 : 0)
          )
    )
  )
}

describe('terrainMark', () => {
  it('keeps every terrain variant inside its cell', () => {
    for (const terrain of TERRAINS) {
      for (let x = 0; x < 8; x++) {
        expect(reach(terrainMark(terrain, x, 3))).toBeLessThanOrEqual(HALF)
      }
    }
  })

  it('picks the same mark for the same cell', () => {
    expect(terrainMark('tallgrass', 5, 9)).toBe(terrainMark('tallgrass', 5, 9))
  })

  it('varies a large patch so it does not repeat like wallpaper', () => {
    for (const terrain of TERRAINS) {
      const marks = new Set<Silhouette>()
      for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 6; y++) marks.add(terrainMark(terrain, x, y))
      }
      expect(marks.size).toBeGreaterThan(1)
    }
  })
})

describe('itemMark', () => {
  it('has an icon for every item that fits the cell', () => {
    for (const id of ITEM_IDS) {
      const mark = itemMark(id)
      expect(mark).not.toBeNull()
      expect(reach(mark!)).toBeLessThanOrEqual(HALF)
    }
    expect(reach(EXIT_MARK)).toBeLessThanOrEqual(HALF)
  })

  it('returns null for unknown items so the glyph is drawn instead', () => {
    expect(itemMark('mystery_seed')).toBeNull()
  })
})
