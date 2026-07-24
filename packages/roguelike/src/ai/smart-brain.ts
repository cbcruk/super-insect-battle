import type { ActorBrain } from '../actor'
import type { Command } from '../command'
import { chebyshev, dirToward } from '../geometry'
import { stepAlongPath, fleeStep } from '../pathfind'

/**
 * P2 브레인: 인접하면 bump, 저체력이면 도주, 아니면 rot.js 길찾기로 접근.
 * 벽을 우회하므로 P1 그리디처럼 막히지 않는다.
 */
export function createSmartBrain(): ActorBrain {
  return {
    decide(actor, run): Command {
      const player = run.player
      const distance = chebyshev(actor.pos, player.pos)
      const hpRatio = actor.combat.currentHp / actor.combat.maxHp

      const occupied = (x: number, y: number): boolean =>
        run.level.actors.some(
          (a) =>
            a !== actor &&
            a.combat.currentHp > 0 &&
            a.pos.x === x &&
            a.pos.y === y
        )

      if (distance === 1) {
        const dir = dirToward(actor.pos, player.pos)
        return dir ? { type: 'move', dir } : { type: 'wait' }
      }

      if (hpRatio < 0.25) {
        const flee = fleeStep(run.level.map, actor.pos, player.pos, occupied)
        if (flee) return { type: 'move', dir: flee }
      }

      const dir = stepAlongPath(run.level.map, actor.pos, player.pos, occupied)
      return dir ? { type: 'move', dir } : { type: 'wait' }
    },
  }
}
