import type { ActorBrain } from '../actor'
import type { Command } from '../command'
import { chebyshev, dirToward, dirAway } from '../geometry'
import { nearestEnemy } from '../targeting'

/**
 * P1 그리디 브레인: 가장 가까운 적에게 인접하면 bump 공격, 저체력이면 도주, 아니면 접근.
 * 길찾기 없음(직선 접근) — P2에서 rot.js Dijkstra + 엔진 scoreAction으로 교체.
 */
export function createBasicBrain(): ActorBrain {
  return {
    decide(actor, run): Command {
      const target = nearestEnemy(run, actor)
      if (!target) return { type: 'wait' }
      const distance = chebyshev(actor.pos, target.pos)
      const hpRatio = actor.combat.currentHp / actor.combat.maxHp

      if (hpRatio < 0.25 && distance <= 2) {
        const away = dirAway(actor.pos, target.pos)
        if (away) return { type: 'move', dir: away }
      }

      const toward = dirToward(actor.pos, target.pos)
      return toward ? { type: 'move', dir: toward } : { type: 'wait' }
    },
  }
}
