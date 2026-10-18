import type { GridEvent } from './events'
import { posKey, type Vec2 } from './geometry'

/**
 * 플레이어 시야 안에서 일어난 이벤트인지 판정한다.
 *
 * 난전에서는 시야 밖 액터끼리의 전투·상태 메시지가 쏟아지므로 로그와 연출에는
 * 보이는 것만 남긴다. 공격은 공격자나 대상 중 한쪽만 보여도 보인 것으로 친다.
 * 위치가 없는 이벤트(플레이어 전용 메시지, 하강 등)와 시야 미설정(`visible`이
 * 없는 테스트 레벨)은 항상 보인다.
 */
export function isEventVisible(
  event: GridEvent,
  visible: Set<string> | undefined
): boolean {
  if (!visible) return true
  const seen = (pos: Vec2): boolean => visible.has(posKey(pos.x, pos.y))

  switch (event.type) {
    case 'attack':
      return seen(event.outcome.attackerPos) || seen(event.outcome.defenderPos)
    case 'status':
      return seen(event.pos)
    case 'message':
      return event.pos ? seen(event.pos) : true
    default:
      return true
  }
}
