import { describe, it, expect } from 'vitest'
import {
  ITEM_IDS,
  TERRAIN,
  type TerrainType,
} from '@super-insect-battle/roguelike'
import { SILHOUETTE_SPAN } from './insect-silhouette.ts'
import type { Silhouette } from './insect-silhouette.types.ts'
import { EXIT_MARK, NEIGHBOUR, itemMark, terrainMark } from './tile-marks.ts'

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

  it('reaches the cell edge only toward a connected neighbour', () => {
    const all = NEIGHBOUR.n | NEIGHBOUR.e | NEIGHBOUR.s | NEIGHBOUR.w
    for (const terrain of TERRAINS) {
      for (let x = 0; x < 8; x++) {
        const mark = terrainMark(terrain, x, 3, all)
        const solid = mark.filter((shape) => shape.kind !== 'line')
        if (solid.length > 0) {
          expect(reach(solid)).toBeLessThanOrEqual(HALF)
        }
        expect(reach(terrainMark(terrain, x, 3, NEIGHBOUR.e))).toBeLessThan(
          HALF + 1
        )
      }
    }
  })

  it('fills a wall to the edge it shares with another wall', () => {
    const open = terrainMark('wall', 2, 2, 0)[0]
    const joined = terrainMark('wall', 2, 2, NEIGHBOUR.e)[0]
    const maxX = (shape: typeof open): number =>
      shape.kind === 'polygon'
        ? Math.max(...shape.points.filter((_, i) => i % 2 === 0))
        : 0
    expect(maxX(open)).toBeLessThan(HALF)
    expect(maxX(joined)).toBe(HALF)
  })

  it('meets neighbouring water waves at the same height on the shared edge', () => {
    const both = NEIGHBOUR.e | NEIGHBOUR.w
    for (let x = 0; x < 8; x++) {
      for (const shape of terrainMark('water', x, 4, both)) {
        if (shape.kind !== 'line') continue
        const p = shape.points
        expect(p[0]).toBe(-HALF)
        expect(p[p.length - 2]).toBe(HALF)
        expect(p[1]).toBeCloseTo(p[p.length - 1])
      }
    }
  })

  it('ignores neighbours for terrain that is not drawn connected', () => {
    expect(terrainMark('mud', 1, 1, NEIGHBOUR.n)).toBe(terrainMark('mud', 1, 1))
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

  it('does not repeat along a diagonal', () => {
    const along = (dx: number): Silhouette[] =>
      Array.from({ length: 8 }, (_, i) => terrainMark('tallgrass', i + dx, i))
    const shifted = along(4)
    expect(along(0).some((mark, i) => mark !== shifted[i])).toBe(true)
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
