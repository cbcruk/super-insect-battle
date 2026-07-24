import type { Direction, Vec2 } from './geometry'

/**
 * 한 액터의 한 턴 의도.
 * - move: 빈 칸이면 이동, 적이 있으면 자동 근접 공격(bump).
 * - ability: 원거리/특수/자기버프 기술 사용.
 * - wait: 제자리 대기.
 */
export type Command =
  | { type: 'move'; dir: Direction }
  | { type: 'ability'; actionId: string; target: Vec2 }
  | { type: 'wait' }
