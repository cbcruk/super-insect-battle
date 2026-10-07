/** 입자 묶음의 종류. 독은 위로 피어오르고, 치명타는 사방으로 튄다. */
export type BurstKind = 'venom' | 'critical'

/** 피격 칸에서 퍼지는 입자 하나의 상태. 좌표 단위는 px. */
export interface HitParticle {
  x: number
  y: number
  vx: number
  vy: number
  /** 초당 속도 변화(px/s²). 음수면 위로 떠오른다. */
  gravity: number
  /** 초당 속도 감쇠 비율. */
  drag: number
  radius: number
  color: number
  /** 생성 전 대기 시간(ms). 같은 턴 연출 순서에 맞춘다. */
  delayMs: number
  ageMs: number
  lifeMs: number
}
