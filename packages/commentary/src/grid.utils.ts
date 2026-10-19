import {
  posKey,
  tileAt,
  type GridEvent,
  type RunState,
  type Vec2,
} from '@super-insect-battle/roguelike'

/** pos가 수풀 칸인가. */
export function inGrass(run: RunState, pos: Vec2): boolean {
  return tileAt(run.level.map, pos.x, pos.y)?.terrain === 'tallgrass'
}

/** from에서 수풀 밖이던 액터가 to의 수풀로 들어갔는가. */
export function enteredGrass(run: RunState, from: Vec2, to: Vec2): boolean {
  return inGrass(run, to) && !inGrass(run, from)
}

/** 플레이어가 이 이동을 지켜볼 수 있었는가: 본인이거나, 출발 칸이 시야 안이었다. */
export function seenLeaving(
  run: RunState,
  event: Extract<GridEvent, { type: 'move' }>
): boolean {
  if (event.actorId === run.player.id) return true
  const { visible } = run.level
  return !visible || visible.has(posKey(event.from.x, event.from.y))
}
