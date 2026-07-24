import type { Environment } from './environment'

export interface ReplayAction {
  actionId: string
  actionName: string
}

export interface ReplayTurn {
  turn: number
  playerAction: ReplayAction
  opponentAction: ReplayAction
}

export interface ReplayHeader {
  id: string
  version: string
  timestamp: number
  playerArthropodId: string
  opponentArthropodId: string
  environment: Environment
  /**
   * 전투 해결에 사용된 난수 시드. 저장되어 있으면 재생 시 동일 시드로
   * 엔진을 재구동하여 데미지·명중·상태이상까지 완전히 재현한다.
   * 구버전 리플레이(seed 없음)는 비결정론적으로 재생된다.
   */
  seed?: number
}

export interface BattleReplay {
  header: ReplayHeader
  turns: ReplayTurn[]
  winner: 'player' | 'opponent' | 'draw'
  totalTurns: number
}
