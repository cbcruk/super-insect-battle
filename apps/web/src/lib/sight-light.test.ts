import { describe, it, expect } from 'vitest'
import { SIGHT_RADIUS } from '@super-insect-battle/roguelike'
import {
  EDGE_LIGHT,
  FULL_LIGHT_RADIUS,
  REMEMBERED_LIGHT,
  lightAt,
} from './sight-light.ts'

const origin = { x: 10, y: 10 }

describe('lightAt', () => {
  it('keeps the area around the player fully lit', () => {
    expect(lightAt(origin, 10, 10)).toBe(1)
    expect(lightAt(origin, 10 + FULL_LIGHT_RADIUS, 10)).toBe(1)
  })

  it('dims to the edge light at the sight radius', () => {
    expect(lightAt(origin, 10 + SIGHT_RADIUS, 10)).toBeCloseTo(EDGE_LIGHT)
    expect(lightAt(origin, 10 + SIGHT_RADIUS + 3, 10)).toBeCloseTo(EDGE_LIGHT)
  })

  it('falls off monotonically with distance', () => {
    const lights = Array.from({ length: SIGHT_RADIUS + 1 }, (_, d) =>
      lightAt(origin, 10 + d, 10)
    )
    for (let i = 1; i < lights.length; i++) {
      expect(lights[i]).toBeLessThanOrEqual(lights[i - 1])
    }
  })

  it('uses round distance so diagonals dim more than straight lines', () => {
    expect(lightAt(origin, 15, 15)).toBeLessThan(lightAt(origin, 15, 10))
  })

  it('stays brighter than remembered cells so the sight edge is visible', () => {
    expect(EDGE_LIGHT).toBeGreaterThan(REMEMBERED_LIGHT)
  })
})
