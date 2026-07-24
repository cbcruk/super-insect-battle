import {
  getActionsByIds,
  getAvailableActions,
  getActionTargeting,
  getActionRange,
} from '@super-insect-battle/engine'
import type { ActorBrain } from '../actor'
import type { Command } from '../command'
import { chebyshev, dirToward } from '../geometry'
import { stepAlongPath, fleeStep } from '../pathfind'
import { lineOfSight } from '../fov'

/**
 * P2b 브레인: 인접하면 bump, 사거리 안이면 원거리 스킬로 견제,
 * 저체력이면 도주, 아니면 rot.js 길찾기로 접근.
 */
export function createSmartBrain(): ActorBrain {
  return {
    decide(actor, run): Command {
      const player = run.player
      const distance = chebyshev(actor.pos, player.pos)
      const hpRatio = actor.combat.currentHp / actor.combat.maxHp

      if (distance === 1) {
        const dir = dirToward(actor.pos, player.pos)
        return dir ? { type: 'move', dir } : { type: 'wait' }
      }

      // 원거리 스킬 견제 (사거리·시야선 확보 시)
      const ranged = getAvailableActions(
        getActionsByIds(actor.combat.actions),
        actor.combat
      ).find(
        (a) =>
          getActionTargeting(a) === 'ranged' &&
          distance <= getActionRange(a) &&
          lineOfSight(run.level.map, actor.pos, player.pos)
      )
      if (ranged) {
        return {
          type: 'ability',
          actionId: ranged.id,
          target: { x: player.pos.x, y: player.pos.y },
        }
      }

      if (hpRatio < 0.25) {
        const occupied = (x: number, y: number): boolean =>
          run.level.actors.some(
            (a) =>
              a !== actor &&
              a.combat.currentHp > 0 &&
              a.pos.x === x &&
              a.pos.y === y
          )
        const flee = fleeStep(run.level.map, actor.pos, player.pos, occupied)
        if (flee) return { type: 'move', dir: flee }
      }

      const occupied = (x: number, y: number): boolean =>
        run.level.actors.some(
          (a) =>
            a !== actor &&
            a.combat.currentHp > 0 &&
            a.pos.x === x &&
            a.pos.y === y
        )
      const dir = stepAlongPath(run.level.map, actor.pos, player.pos, occupied)
      return dir ? { type: 'move', dir } : { type: 'wait' }
    },
  }
}
