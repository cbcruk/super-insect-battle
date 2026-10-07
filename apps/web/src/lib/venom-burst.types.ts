/** 독 피해 칸에서 피어오르는 입자 하나의 상태. 좌표 단위는 px. */
export interface VenomParticle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: number
  /** 생성 전 대기 시간(ms). 같은 턴 연출 순서에 맞춘다. */
  delayMs: number
  ageMs: number
  lifeMs: number
}
