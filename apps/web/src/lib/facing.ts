import type { GridEvent, Vec2 } from '@super-insect-battle/roguelike'

/**
 * `from`에서 `to`를 바라볼 때의 회전각(라디안)을 구한다.
 *
 * 실루엣은 머리가 위를 향하게 그려져 있으므로 위가 0이고, 화면 좌표(y가 아래로
 * 증가)에서 시계 방향이 양수다.
 *
 * @returns 두 칸이 같아 방향이 없으면 `null`.
 */
export function facingAngle(from: Vec2, to: Vec2): number | null {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (dx === 0 && dy === 0) return null
  return Math.atan2(dx, -dy)
}

/**
 * 한 명령에서 나온 이벤트로 액터별 바라보는 방향을 갱신한다.
 *
 * 이동하면 이동한 쪽, 공격하면 대상 쪽을 바라보고, 같은 명령 안에서는 마지막 행동이
 * 이긴다. 쓰러진 액터는 지운다. 코어 상태가 아닌 화면 표현용 값이라 런의 결정론에
 * 영향을 주지 않는다.
 */
export function nextFacings(
  previous: ReadonlyMap<string, number>,
  events: GridEvent[]
): Map<string, number> {
  const facings = new Map(previous)
  const face = (actorId: string, from: Vec2, to: Vec2): void => {
    const angle = facingAngle(from, to)
    if (angle !== null) facings.set(actorId, angle)
  }
  for (const event of events) {
    if (event.type === 'move') {
      face(event.actorId, event.from, event.to)
    } else if (event.type === 'attack') {
      const o = event.outcome
      face(o.attackerId, o.attackerPos, o.defenderPos)
    } else if (event.type === 'death') {
      facings.delete(event.actorId)
    }
  }
  return facings
}
