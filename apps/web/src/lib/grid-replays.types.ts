import type { DuelReplay } from '@super-insect-battle/roguelike'

/** 저장된 격자 매치업 리플레이 한 건. */
export interface SavedGridReplay {
  id: string
  /** 저장 시각 (epoch ms). */
  timestamp: number
  playerName: string
  opponentName: string
  /** 이긴 쪽 이름. */
  winnerName: string
  totalTurns: number
  replay: DuelReplay
}

/** 리플레이를 담는 저장소. 브라우저에서는 `localStorage`. */
export type ReplayStorage = Pick<Storage, 'getItem' | 'setItem'>
