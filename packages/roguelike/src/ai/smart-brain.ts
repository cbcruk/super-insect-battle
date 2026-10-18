import {
  getActionsByIds,
  getAvailableActions,
  getActionTargeting,
  getActionRange,
} from '@super-insect-battle/engine'
import type { Actor, ActorBrain } from '../actor'
import type { Command } from '../command'
import type { RunState } from '../run'
import { chebyshev, dirToward } from '../geometry'
import { stepAlongPath, fleeStep } from '../pathfind'
import { lineOfSight, SIGHT_RADIUS } from '../fov'
import { nearestEnemyInRange } from '../targeting'

/**
 * P2b 브레인: 인접하면 bump, 사거리 안이면 원거리 스킬로 견제,
 * 저체력이면 도주, 아니면 rot.js 길찾기로 접근.
 *
 * 적을 시야(반경 {@linkcode SIGHT_RADIUS}·시선)에서 처음 발견하기 전까지는
 * 제자리에 머문다. 한 번 발견한 적은 시야에서 사라져도 계속 추적하고, 시야 안에
 * 다른 적이 더 가까이 있으면 그쪽으로 갈아탄다. 층 전체의 적이 동시에 몰려오지
 * 않게 해서 은신·우회를 실제 선택지로 만든다.
 */
export function createSmartBrain(): ActorBrain {
  let targetId: string | null = null
  return {
    decide(actor, run): Command {
      const seen = nearestEnemyInRange(run, actor, SIGHT_RADIUS)
      if (seen) targetId = seen.id
      const target = run.level.actors.find(
        (a) => a.id === targetId && a.combat.currentHp > 0
      )
      if (!target) return { type: 'wait' }

      const distance = chebyshev(actor.pos, target.pos)
      const hpRatio = actor.combat.currentHp / actor.combat.maxHp

      if (distance === 1) {
        const dir = dirToward(actor.pos, target.pos)
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
          lineOfSight(run.level.map, actor.pos, target.pos)
      )
      if (ranged) {
        return {
          type: 'ability',
          actionId: ranged.id,
          target: { x: target.pos.x, y: target.pos.y },
        }
      }

      const occupied = occupiedBy(run, actor)
      if (hpRatio < 0.25) {
        const flee = fleeStep(run.level.map, actor.pos, target.pos, occupied)
        if (flee) return { type: 'move', dir: flee }
      }

      const dir = stepAlongPath(run.level.map, actor.pos, target.pos, occupied)
      return dir ? { type: 'move', dir } : { type: 'wait' }
    },
  }
}

function occupiedBy(
  run: RunState,
  self: Actor
): (x: number, y: number) => boolean {
  return (x, y) =>
    run.level.actors.some(
      (a) =>
        a !== self && a.combat.currentHp > 0 && a.pos.x === x && a.pos.y === y
    )
}
