import type { Vec2 } from './geometry'
import type { CombatOutcome } from './combat'

/**
 * 코어가 상태를 변경하며 방출하는 렌더/로그용 이벤트.
 * 렌더러(P1 터미널 ASCII, P3 웹 타일)는 이 배열만 소비한다.
 */
export type GridEvent =
  | { type: 'move'; actorId: string; from: Vec2; to: Vec2 }
  | { type: 'attack'; outcome: CombatOutcome }
  | { type: 'blocked'; actorId: string; pos: Vec2 }
  | { type: 'status'; actorId: string; message: string }
  | { type: 'death'; actorId: string }
  | { type: 'descend'; depth: number }
  | { type: 'message'; text: string }
