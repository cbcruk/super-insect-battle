import { describe, it, expect } from 'vitest'
import { actionList, getActionById, getActionTargeting } from './actions'

describe('grid targeting', () => {
  it('never classifies a damaging action as self-targeted', () => {
    const selfDamaging = actionList
      .filter((a) => a.power > 0 && getActionTargeting(a) === 'self')
      .map((a) => a.id)
    expect(selfDamaging).toEqual([])
  })

  it('treats shell roll as a melee charge', () => {
    const shellRoll = getActionById('shell_roll')
    expect(shellRoll && getActionTargeting(shellRoll)).toBe('melee')
  })
})
