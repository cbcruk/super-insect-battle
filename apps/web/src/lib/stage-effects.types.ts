import type { BurstKind } from './hit-particles.types.ts'

/** 피격 연출 하나를 무대에서 어떻게 보여줄지. */
export interface StageCue {
  /** 칸을 번쩍일 색. 없으면 번쩍이지 않는다. */
  flash?: { color: string; alpha: number }
  burst?: BurstKind
}

/** 칸 번쩍임 하나의 진행 상태. */
export interface CellFlash {
  x: number
  y: number
  color: string
  /** 시작 시점의 불투명도. 시간이 지나며 0까지 줄어든다. */
  alpha: number
  delayMs: number
  ageMs: number
  lifeMs: number
}
