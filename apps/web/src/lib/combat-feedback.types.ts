import type { Vec2 } from '@super-insect-battle/roguelike'

/** 로그 한 줄의 의미. 색으로 구분해 내가 때린 것과 맞은 것을 한눈에 가른다. */
export type FeedTone =
  | 'dealt'
  | 'taken'
  | 'evaded'
  | 'missed'
  | 'kill'
  | 'status'
  | 'pickup'
  | 'info'

export interface FeedLine {
  id: number
  text: string
  tone: FeedTone
  critical: boolean
}

/** 맵 위 피격 연출 종류. */
export type HitEffectKind =
  | 'damage'
  | 'critical'
  | 'miss'
  | 'venom'
  | 'condition'

export interface HitEffect {
  id: number
  pos: Vec2
  label: string
  kind: HitEffectKind
  /** 연출 대상이 플레이어인가. 플레이어 피격은 더 강한 색으로 그린다. */
  onPlayer: boolean
  /** 같은 턴 안의 연출을 순서대로 보이게 하는 지연(ms). */
  delayMs: number
  /** 같은 칸에 앞서 쌓인 연출 수. 글자가 겹치지 않게 위로 올린다. */
  stack: number
}

/** 한 번의 명령으로 발생한 이벤트를 연출 단위로 변환한 결과. */
export interface CombatFeedback {
  lines: Omit<FeedLine, 'id'>[]
  effects: Omit<HitEffect, 'id'>[]
  /** 이번 명령으로 플레이어가 입은 총 피해. */
  playerDamage: number
  /** 플레이어가 급소를 맞았는가. 화면 흔들림 강도에 쓴다. */
  playerCritical: boolean
}
