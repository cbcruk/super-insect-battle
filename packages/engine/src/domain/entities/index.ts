/**
 * 플레이어 엔티티
 * 게임에 참여하는 사용자
 */
export interface Player {
  /** 고유 식별자 (UUID) */
  id: string
  /** 외부 노출용 ID (공개 프로필용) */
  visibleId: string
  /** 닉네임 */
  nickname: string
  /** 레이팅 점수 (ELO 등) */
  rating: number
  /** 가입 일시 */
  createdAt: Date
  /** 최근 접속 일시 */
  lastActiveAt: Date
}

/**
 * 플레이어가 소유한 곤충 인스턴스
 * 종(species)과 달리 개별 개체로서의 상태를 가짐
 */
export interface OwnedInsect {
  /** 고유 식별자 */
  id: string
  /** 소유자 플레이어 ID */
  playerId: string
  /** 곤충 종 ID (정적 데이터 참조) */
  speciesId: string
  /** 개체 닉네임 (플레이어가 지정) */
  nickname: string | null
  /** 레벨 (1-100) */
  level: number
  /** 경험치 */
  exp: number
  /** 개체값 (Individual Values) - 같은 종이라도 개체마다 다른 능력치 */
  ivs: {
    hp: number
    atk: number
    def: number
    spAtk: number
    spDef: number
    spd: number
  }
  /** 획득 일시 */
  obtainedAt: Date
}

/**
 * 매치 (배틀 세션) 엔티티
 */
export interface Match {
  /** 고유 식별자 */
  id: string
  /** 플레이어 1 ID */
  player1Id: string
  /** 플레이어 2 ID (AI인 경우 null) */
  player2Id: string | null
  /** 플레이어 1 곤충 ID */
  player1InsectId: string
  /** 플레이어 2 곤충 ID */
  player2InsectId: string
  /** 승자 ID (무승부면 null) */
  winnerId: string | null
  /** 매치 시작 일시 */
  startedAt: Date
  /** 매치 종료 일시 */
  endedAt: Date | null
  /** 총 턴 수 */
  totalTurns: number
  /** 매치 상태 */
  status: 'waiting' | 'active' | 'finished' | 'cancelled'
}

/**
 * 매치 로그 (다시보기용)
 * 배틀의 모든 상태 변화를 기록
 */
export interface MatchLog {
  /** 고유 식별자 */
  id: string
  /** 매치 ID */
  matchId: string
  /** 배틀 시작 시점의 스냅샷 (초기 상태) */
  initialSnapshot: BattleSnapshot
  /** 턴별 액션 기록 */
  actions: BattleAction[]
  /** 기록 생성 일시 */
  createdAt: Date
}

/**
 * 배틀 스냅샷 - 특정 시점의 배틀 상태
 * 다시보기 시작점 또는 중간 저장점으로 사용
 */
export interface BattleSnapshot {
  /** 턴 번호 */
  turn: number
  /** 플레이어 1 곤충 상태 */
  player1: BattleInsectSnapshot
  /** 플레이어 2 곤충 상태 */
  player2: BattleInsectSnapshot
  /** 스냅샷 생성 시각 */
  timestamp: Date
}

/**
 * 곤충 스냅샷 - 특정 시점의 곤충 상태
 */
export interface BattleInsectSnapshot {
  /** 곤충 종 ID */
  speciesId: string
  /** 현재 HP */
  currentHp: number
  /** 최대 HP */
  maxHp: number
  /** 스탯 수정치 (-6 ~ +6) */
  statModifiers: {
    atk: number
    def: number
    spAtk: number
    spDef: number
    spd: number
  }
  /** 상태이상 */
  statusCondition: 'poison' | 'paralysis' | 'sleep' | 'burn' | null
  /** 수면 남은 턴 */
  sleepTurns: number
}

/**
 * 배틀 액션 - 턴에서 발생한 단일 행동
 * 결정론적 재생을 위해 모든 랜덤 결과를 기록
 */
export interface BattleAction {
  /** 액션 순번 */
  sequence: number
  /** 턴 번호 */
  turn: number
  /** 액션 타입 */
  type: BattleActionType
  /** 행동 주체 (1 또는 2) */
  actor: 1 | 2
  /** 액션 상세 데이터 */
  data: BattleActionData
  /** 액션 후 상태 (빠른 탐색용) */
  resultSnapshot?: BattleSnapshot
}

export type BattleActionType =
  | 'move_select' // 스킬 선택
  | 'move_execute' // 스킬 실행
  | 'damage_dealt' // 데미지 적용
  | 'status_applied' // 상태이상 적용
  | 'stat_changed' // 능력치 변화
  | 'status_damage' // 상태이상 데미지
  | 'faint' // 기절
  | 'turn_start' // 턴 시작
  | 'turn_end' // 턴 종료

/**
 * 액션별 상세 데이터 (유니온 타입)
 */
export type BattleActionData =
  | MoveSelectData
  | MoveExecuteData
  | DamageData
  | StatusAppliedData
  | StatChangedData
  | StatusDamageData
  | FaintData
  | TurnMarkerData

export interface MoveSelectData {
  moveId: string
}

export interface MoveExecuteData {
  moveId: string
  hit: boolean
  /** 랜덤 시드 또는 실제 난수값 (재현용) */
  randomSeed?: number
}

export interface DamageData {
  moveId: string
  damage: number
  critical: boolean
  effectiveness: number
  /** 데미지 계산에 사용된 랜덤값 */
  randomFactor: number
}

export interface StatusAppliedData {
  condition: 'poison' | 'paralysis' | 'sleep' | 'burn'
  /** 수면인 경우 지속 턴 수 */
  duration?: number
}

export interface StatChangedData {
  stat: 'atk' | 'def' | 'spAtk' | 'spDef' | 'spd'
  stages: number
  newValue: number
}

export interface StatusDamageData {
  condition: 'poison' | 'burn'
  damage: number
}

export interface FaintData {
  finalHp: number
}

export interface TurnMarkerData {
  turnNumber: number
}
