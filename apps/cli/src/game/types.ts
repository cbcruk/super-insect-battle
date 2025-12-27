import type { BattleState, Insect, Move } from '@insect-battle/engine'

/**
 * 플레이어가 소유한 곤충
 */
export interface PlayerInsect {
  /** 곤충 종 데이터 */
  species: Insect
  /** 플레이어가 지정한 닉네임 */
  nickname: string | null
  /** 현재 HP (배틀 외에서도 유지) */
  currentHp: number
  /** 최대 HP */
  maxHp: number
}

/**
 * 플레이어 상태
 */
export interface Player {
  /** 플레이어 이름 */
  name: string
  /** 현재 위치 (Room ID) */
  location: string
  /** 보유 곤충 팀 (최대 3마리) */
  team: PlayerInsect[]
  /** 선두 곤충 인덱스 */
  activeIndex: number
}

/**
 * 배틀 세션 (진행 중인 배틀)
 */
export interface BattleSession {
  /** 엔진의 배틀 상태 */
  state: BattleState
  /** 상대 정보 */
  opponent: {
    name: string
    isWild: boolean
  }
  /** 플레이어 입력 대기 중 */
  awaitingInput: boolean
  /** 사용 가능한 스킬 목록 */
  availableMoves: Move[]
}

/**
 * 방/장소 정의
 */
export interface Room {
  /** 방 ID */
  id: string
  /** 방 이름 */
  name: string
  /** 방 설명 */
  description: string
  /** 연결된 방 (방향 -> Room ID) */
  exits: Record<string, string>
  /** 야생 곤충 출현 가능 여부 */
  hasWildEncounters: boolean
  /** 출현 가능한 야생 곤충 ID 목록 */
  wildInsects?: string[]
}

/**
 * 전체 게임 상태
 */
export interface GameState {
  /** 플레이어 정보 */
  player: Player
  /** 현재 배틀 세션 (없으면 null) */
  battle: BattleSession | null
  /** 게임 실행 중 여부 */
  isRunning: boolean
}

/**
 * 게임 모드
 */
export type GameMode = 'explore' | 'battle'

/**
 * 명령어 실행 결과
 */
export interface CommandResult {
  /** 출력할 메시지 */
  output: string
  /** 게임 상태 변경 여부 */
  stateChanged: boolean
  /** 게임 종료 여부 */
  shouldQuit?: boolean
}

/**
 * 명령어 핸들러 타입
 */
export type CommandHandler = (args: string[], state: GameState) => CommandResult
