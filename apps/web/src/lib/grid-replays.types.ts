import type { DuelReplay } from '@super-insect-battle/roguelike'

/** 저장된 격자 매치업 리플레이 한 건. */
export interface SavedGridReplay {
  /** 목록 안에서 고유한 id. */
  id: string
  /** 저장 시각 (epoch ms). */
  timestamp: number
  /** 1P 종 이름. */
  playerName: string
  /** 상대 종 이름. */
  opponentName: string
  /** 이긴 쪽 이름. 둘 다 쓰러졌으면 null. */
  winnerName: string | null
  /** 판이 끝난 턴. */
  totalTurns: number
  /** 재생에 쓰는 기록. */
  replay: DuelReplay
}

/** 리플레이를 담는 저장소. 브라우저에서는 `localStorage`. */
export type ReplayStorage = Pick<Storage, 'getItem' | 'setItem'>
