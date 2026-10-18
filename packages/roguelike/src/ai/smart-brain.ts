import {
  getActionsByIds,
  getAvailableActions,
  getActionTargeting,
  getActionRange,
} from '@super-insect-battle/engine'
import type { Actor, ActorBrain } from '../actor'
import type { Command } from '../command'
import type { RunState } from '../run'
import { chebyshev, dirToward, type Vec2 } from '../geometry'
import { stepAlongPath, fleeStep } from '../pathfind'
import { lineOfSight, SIGHT_RADIUS } from '../fov'
import {
  nearestEnemy,
  nearestEnemyInRange,
  nearestVisibleCube,
} from '../targeting'
import { isInGas } from '../zone'

/** {@linkcode createSmartBrain} 옵션. */
export interface SmartBrainOptions {
  /**
   * 아무도 발견하지 못했을 때 제자리에서 기다리지 않고 가장 가까운 적을 향해
   * 움직인다. 숨을 곳이 없는 난전에서 액터들이 서로를 찾아 나서게 한다.
   * 적이 안 보이는 동안 시야 안에 파워 큐브가 있으면 먼저 줍는다.
   */
  hunt?: boolean
  /** `hunt`가 찾아 나설 적의 최대 거리 (체비셰프). 기본은 제한 없음. */
  huntRadius?: number
}

/**
 * P2b 브레인: 인접하면 bump, 사거리 안이면 원거리 스킬로 견제,
 * 저체력이면 도주, 아니면 rot.js 길찾기로 접근.
 *
 * 적을 시야(반경 {@linkcode SIGHT_RADIUS}·시선)에서 처음 발견하기 전까지는
 * 제자리에 머문다. 한 번 발견한 적은 시야에서 사라져도 계속 추적하고, 시야 안에
 * 다른 적이 더 가까이 있으면 그쪽으로 갈아탄다. 층 전체의 적이 동시에 몰려오지
 * 않게 해서 은신·우회를 실제 선택지로 만든다.
 *
 * 레벨에 독가스 구역이 있으면, 인접한 적과 싸우는 중이 아닌 한 다음 턴 가스에
 * 덮일 자리에서 중심 쪽으로 물러난다.
 */
export function createSmartBrain(options: SmartBrainOptions = {}): ActorBrain {
  let targetId: string | null = null
  return {
    decide(actor, run): Command {
      const seen = nearestEnemyInRange(run, actor, SIGHT_RADIUS)
      if (seen) targetId = seen.id
      let target =
        run.level.actors.find(
          (a) => a.id === targetId && a.combat.currentHp > 0
        ) ?? null
      const occupied = occupiedBy(run, actor)
      const stepTo = (to: Vec2): Command | null => {
        const dir = stepAlongPath(run.level.map, actor.pos, to, occupied)
        return dir ? { type: 'move', dir } : null
      }

      if (target && chebyshev(actor.pos, target.pos) === 1) {
        const dir = dirToward(actor.pos, target.pos)
        return dir ? { type: 'move', dir } : { type: 'wait' }
      }

      // 다음 턴에 독가스가 덮칠 자리면 중심으로 피한다
      const { zone } = run.level
      if (zone && isInGas(zone, actor.pos, run.turn + 1)) {
        const escape = stepTo(zone.center)
        if (escape) return escape
      }

      if (options.hunt && !seen) {
        const cube = nearestVisibleCube(run, actor)
        const grab = cube && stepTo(cube)
        if (grab) return grab
      }

      if (!target && options.hunt) {
        target = nearestEnemy(run, actor, options.huntRadius)
        targetId = target?.id ?? null
      }
      if (!target) return { type: 'wait' }
      const foe = target

      const distance = chebyshev(actor.pos, foe.pos)
      const hpRatio = actor.combat.currentHp / actor.combat.maxHp

      // 원거리 스킬 견제 (사거리·시야선 확보 시)
      const ranged = getAvailableActions(
        getActionsByIds(actor.combat.actions),
        actor.combat
      ).find(
        (a) =>
          getActionTargeting(a) === 'ranged' &&
          distance <= getActionRange(a) &&
          lineOfSight(run.level.map, actor.pos, foe.pos)
      )
      if (ranged) {
        return {
          type: 'ability',
          actionId: ranged.id,
          target: { x: foe.pos.x, y: foe.pos.y },
        }
      }

      if (hpRatio < 0.25) {
        const flee = fleeStep(run.level.map, actor.pos, foe.pos, occupied)
        if (flee) return { type: 'move', dir: flee }
      }

      return stepTo(foe.pos) ?? { type: 'wait' }
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
