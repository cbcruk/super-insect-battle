import type { Actor } from './actor'
import type { RunState } from './run'
import { chebyshev } from './geometry'
import { lineOfSight } from './fov'

/** actor 에서 사거리·시야선 안에 있는 가장 가까운 적. 없으면 null. */
export function nearestEnemyInRange(
  run: RunState,
  actor: Actor,
  range: number
): Actor | null {
  let best: Actor | null = null
  let bestDist = Infinity

  for (const other of run.level.actors) {
    if (
      other === actor ||
      other.combat.currentHp <= 0 ||
      other.faction === actor.faction
    ) {
      continue
    }
    const distance = chebyshev(actor.pos, other.pos)
    if (distance > range) continue
    if (!lineOfSight(run.level.map, actor.pos, other.pos)) continue
    if (distance < bestDist) {
      bestDist = distance
      best = other
    }
  }

  return best
}
