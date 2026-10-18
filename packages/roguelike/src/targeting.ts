import type { Actor } from './actor'
import type { RunState } from './run'
import { chebyshev, type Vec2 } from './geometry'
import { tileAt } from './map'
import { lineOfSight, SIGHT_RADIUS } from './fov'
import { isHostile } from './faction'

/**
 * actor 에서 사거리·시야선 안에 있는 가장 가까운 적. 없으면 null.
 *
 * 거리가 같으면 HP가 적은 쪽을 고른다. 난전에서 빈사 상대를 먼저 마무리하게 한다.
 */
export function nearestEnemyInRange(
  run: RunState,
  actor: Actor,
  range: number
): Actor | null {
  return findNearestEnemy(run, actor, range, true)
}

/**
 * 시야와 무관하게 range 안에서 가장 가까운 살아있는 적. 거리가 같으면 HP가 적은 쪽.
 * 없으면 null.
 */
export function nearestEnemy(
  run: RunState,
  actor: Actor,
  range: number = Infinity
): Actor | null {
  return findNearestEnemy(run, actor, range, false)
}

function findNearestEnemy(
  run: RunState,
  actor: Actor,
  range: number,
  requireSight: boolean
): Actor | null {
  let best: Actor | null = null
  let bestDist = Infinity

  for (const other of run.level.actors) {
    if (
      other === actor ||
      other.combat.currentHp <= 0 ||
      !isHostile(actor, other)
    ) {
      continue
    }
    const distance = chebyshev(actor.pos, other.pos)
    if (distance > range) continue
    if (requireSight && !lineOfSight(run.level.map, actor.pos, other.pos)) {
      continue
    }
    if (
      distance < bestDist ||
      (distance === bestDist &&
        best !== null &&
        other.combat.currentHp < best.combat.currentHp)
    ) {
      bestDist = distance
      best = other
    }
  }

  return best
}

/** actor 시야(반경·시선) 안에서 파워 큐브가 놓인 가장 가까운 칸. 없으면 null. */
export function nearestVisibleCube(run: RunState, actor: Actor): Vec2 | null {
  const { map } = run.level
  let best: Vec2 | null = null
  let bestDist = Infinity
  for (let dy = -SIGHT_RADIUS; dy <= SIGHT_RADIUS; dy++) {
    for (let dx = -SIGHT_RADIUS; dx <= SIGHT_RADIUS; dx++) {
      const pos = { x: actor.pos.x + dx, y: actor.pos.y + dy }
      if (!tileAt(map, pos.x, pos.y)?.cubes) continue
      const distance = chebyshev(actor.pos, pos)
      if (distance >= bestDist) continue
      if (!lineOfSight(map, actor.pos, pos)) continue
      bestDist = distance
      best = pos
    }
  }
  return best
}
