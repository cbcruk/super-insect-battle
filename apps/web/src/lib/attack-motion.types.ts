import type { Vec2 } from '@super-insect-battle/roguelike'

/** 인접 공격은 돌진, 떨어진 대상은 투사체로 보여준다. */
export type MotionKind = 'lunge' | 'projectile'

/** 공격 한 번의 움직임 연출. */
export interface AttackMotion {
  id: number
  kind: MotionKind
  from: Vec2
  to: Vec2
  /** 플레이어가 휘두른 공격인가. 투사체 색을 가른다. */
  byPlayer: boolean
  /** 명중했는가. 명중일 때만 맞은 쪽이 밀린다. */
  hit: boolean
  /** 같은 턴 안의 연출을 순서대로 보이게 하는 지연(ms). */
  delayMs: number
}

/** 움직임 한 프레임. 좌표와 오프셋은 모두 칸 단위다. */
export interface MotionFrame {
  /** 공격자 글리프를 제자리에서 옮길 양. */
  attacker: Vec2
  /** 맞은 쪽 글리프를 제자리에서 옮길 양. */
  defender: Vec2
  /** 날아가는 투사체의 머리와 꼬리 위치. 날고 있지 않으면 `null`. */
  projectile: { head: Vec2; tail: Vec2 } | null
  /** 움직임이 모두 끝났는가. */
  done: boolean
}
