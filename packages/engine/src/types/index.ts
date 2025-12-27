/**
 * 곤충의 속성 타입
 * 각 타입은 다른 타입에 대해 상성 관계를 가짐
 */
export type InsectType =
  | 'beetle' // 갑충
  | 'hopper' // 도약
  | 'flying' // 비행
  | 'swarm' // 군체
  | 'venomous' // 맹독
  | 'survivor' // 생존
  | 'parasite' // 기생
  | 'luminous' // 발광

/**
 * 곤충의 기본 능력치
 */
export interface Stats {
  /** 현재 체력 */
  hp: number
  /** 최대 체력 */
  maxHp: number
  /** 물리 공격력 */
  atk: number
  /** 물리 방어력 */
  def: number
  /** 특수 공격력 */
  spAtk: number
  /** 특수 방어력 */
  spDef: number
  /** 스피드 (선공 결정에 사용) */
  spd: number
}

/**
 * 배틀 중 적용되는 능력치 변화 단계
 * 각 스탯은 -6 ~ +6 범위의 단계를 가짐
 */
export interface StatModifiers {
  atk: number
  def: number
  spAtk: number
  spDef: number
  spd: number
}

/**
 * 상태이상 종류
 * - poison: 매 턴 데미지
 * - paralysis: 행동 불가 확률
 * - sleep: 행동 불가
 * - burn: 물리 공격력 감소 + 매 턴 데미지
 */
export type StatusCondition = 'poison' | 'paralysis' | 'sleep' | 'burn'

/**
 * 스킬 사용 시 발동하는 부가 효과
 */
export interface MoveEffect {
  /** 효과 종류 */
  type: 'stat_change' | 'status_condition' | 'heal' | 'force_switch'
  /** 효과 대상 */
  target: 'self' | 'opponent'
  /** 변화시킬 스탯 (stat_change인 경우) */
  stat?: keyof Omit<StatModifiers, 'hp'>
  /** 스탯 변화 단계 (stat_change인 경우) */
  stages?: number
  /** 부여할 상태이상 (status_condition인 경우) */
  condition?: StatusCondition
  /** 회복량 퍼센트 (heal인 경우) */
  healPercent?: number
}

/**
 * 곤충이 사용하는 스킬
 */
export interface Move {
  /** 스킬 고유 식별자 */
  id: string
  /** 스킬 영문명 */
  name: string
  /** 스킬 속성 타입 */
  type: InsectType
  /** 스킬 분류: physical(물리), special(특수), status(변화) */
  category: 'physical' | 'special' | 'status'
  /** 위력 (status 스킬은 0) */
  power: number
  /** 명중률 (0-100, 100이면 필중) */
  accuracy: number
  /** 우선도 (높을수록 먼저 행동, 기본값 0) */
  priority: number
  /** 스킬 부가 효과 */
  effect?: MoveEffect
  /** 스킬 설명 */
  description: string
}

/**
 * 곤충 기본 데이터
 */
export interface Insect {
  /** 곤충 고유 식별자 */
  id: string
  /** 곤충 영문명 */
  name: string
  /** 곤충 한글명 */
  nameKo: string
  /** 곤충 속성 타입 */
  type: InsectType
  /** 기본 능력치 */
  baseStats: Omit<Stats, 'hp' | 'maxHp'> & { hp: number }
  /** 보유 스킬 ID 목록 */
  moves: string[]
  /** 스프라이트 이미지 경로 */
  sprite?: string
  /** 곤충 설명 */
  description: string
}

/**
 * 배틀 중인 곤충의 상태
 * 기본 데이터에 배틀 관련 정보가 추가됨
 */
export interface BattleInsect {
  /** 원본 곤충 데이터 */
  base: Insect
  /** 현재 체력 */
  currentHp: number
  /** 최대 체력 */
  maxHp: number
  /** 실제 적용되는 능력치 */
  stats: Omit<Stats, 'hp' | 'maxHp'>
  /** 능력치 변화 단계 */
  statModifiers: StatModifiers
  /** 현재 상태이상 */
  statusCondition: StatusCondition | null
  /** 수면 남은 턴 수 (sleep 상태일 때만 사용) */
  sleepTurns: number
  /** 사용 가능한 스킬 목록 */
  moves: Move[]
}

/**
 * 배틀 로그의 단일 항목
 * 한 턴에서 발생한 행동을 기록
 */
export interface BattleLogEntry {
  /** 발생 턴 */
  turn: number
  /** 행동 주체 */
  actor: 'player' | 'opponent'
  /** 행동 설명 텍스트 */
  action: string
  /** 사용한 스킬 ID */
  move?: string
  /** 가한 데미지 */
  damage?: number
  /** 급소 명중 여부 */
  critical?: boolean
  /** 타입 상성 효과 */
  effectiveness?: 'super' | 'normal' | 'not-very' | 'immune'
  /** 행동 후 양측 남은 체력 */
  remainingHp?: { player: number; opponent: number }
}

/**
 * 배틀 전체 상태
 */
export interface BattleState {
  /** 현재 턴 수 */
  turn: number
  /** 플레이어 곤충 상태 */
  player: BattleInsect
  /** 상대 곤충 상태 */
  opponent: BattleInsect
  /** 배틀 로그 */
  log: BattleLogEntry[]
  /** 배틀 진행 상태 */
  status: 'idle' | 'ready' | 'running' | 'finished'
  /** 승자 (배틀 종료 시) */
  winner: 'player' | 'opponent' | 'draw' | null
}

/**
 * 배틀 인섹트 스냅샷 (리플레이용)
 */
export interface ReplayInsectSnapshot {
  speciesId: string
  currentHp: number
  maxHp: number
  statModifiers: {
    atk: number
    def: number
    spAtk: number
    spDef: number
    spd: number
  }
  statusCondition: StatusCondition | null
  sleepTurns: number
}

/**
 * 배틀 스냅샷 (리플레이용)
 */
export interface ReplaySnapshot {
  turn: number
  player1: ReplayInsectSnapshot
  player2: ReplayInsectSnapshot
  timestamp: Date
}

/**
 * 리플레이 액션
 */
export interface ReplayAction {
  sequence: number
  turn: number
  type: string
  actor: 1 | 2
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  resultSnapshot?: ReplaySnapshot
}

/**
 * 배틀 결과 (다시보기 데이터 포함)
 */
export interface BattleResult {
  /** 최종 배틀 상태 */
  state: BattleState
  /** 다시보기용 리플레이 데이터 */
  replay: {
    /** 배틀 시작 시점의 초기 스냅샷 */
    initialSnapshot: ReplaySnapshot
    /** 모든 액션 기록 */
    actions: ReplayAction[]
    /** 총 액션 수 */
    totalActions: number
  }
}

/**
 * N판 시뮬레이션 결과 통계
 */
export interface SimulationResult {
  /** 총 대전 횟수 */
  totalBattles: number
  /** 플레이어 승리 횟수 */
  playerWins: number
  /** 상대 승리 횟수 */
  opponentWins: number
  /** 무승부 횟수 */
  draws: number
  /** 플레이어 승률 (0-100) */
  playerWinRate: number
  /** 평균 턴 수 */
  averageTurns: number
  /** 하이라이트 장면들 */
  highlights: BattleLogEntry[]
}

/**
 * 타입 상성표
 * typeChart[공격타입][방어타입] = 데미지 배율
 */
export interface TypeChart {
  /** 갑충: 도약에 강함 (밟아 으깸), 맹독에 약함 (갑각 틈새 침투) */
  beetle: Record<InsectType, number>
  /** 도약: 비행에 강함 (점프 포획), 갑충에 약함 */
  hopper: Record<InsectType, number>
  /** 비행: 군체에 강함 (공중 회피), 도약에 약함 */
  flying: Record<InsectType, number>
  /** 군체: 생존에 강함 (수적 우세), 비행에 약함 */
  swarm: Record<InsectType, number>
  /** 맹독: 갑충에 강함 (독 침투), 생존에 약함 (해독 능력) */
  venomous: Record<InsectType, number>
  /** 생존: 맹독에 강함 (해독), 군체에 약함 */
  survivor: Record<InsectType, number>
  /** 기생: 생존에 강함 (숙주 이용), 도약에 약함 (빨라서 붙기 어려움) */
  parasite: Record<InsectType, number>
  /** 발광: 기생에 강함 (빛으로 퇴치), 맹독에 약함 */
  luminous: Record<InsectType, number>
}
