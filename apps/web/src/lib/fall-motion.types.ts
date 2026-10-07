import type { Vec2 } from '@super-insect-battle/roguelike'

/** 액터가 쓰러지는 연출 하나. */
export interface Fall {
  id: number
  /** 쓰러진 칸. 무대는 이 칸에 직전까지 있던 글리프로 잔상을 만든다. */
  pos: Vec2
  /** 쓰러뜨린 공격의 출발점. 잔상이 반대쪽으로 밀린다. 독 피해처럼 출처가 없으면 `null`. */
  from: Vec2 | null
  /** 마지막 피해가 닿는 시각(ms). 그때까지 잔상은 제자리에 서 있다. */
  delayMs: number
}

/** 쓰러짐 한 프레임. 오프셋은 칸 단위다. */
export interface FallFrame {
  offset: Vec2
  alpha: number
  /** 기울어진 각도(라디안). */
  rotation: number
  scale: number
  done: boolean
}
