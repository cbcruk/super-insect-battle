import type { BattleInsect, StatusCondition } from '../types'
import type {
  BattleSnapshot,
  BattleInsectSnapshot,
  BattleAction,
  BattleActionType,
  BattleActionData,
} from '../domain/entities'

/**
 * 배틀 기록 상태
 * simulateBattle에서 사용하여 모든 액션을 기록
 */
export interface BattleRecorder {
  /** 초기 스냅샷 */
  initialSnapshot: BattleSnapshot
  /** 기록된 액션들 */
  actions: BattleAction[]
  /** 현재 액션 시퀀스 번호 */
  sequence: number
}

/**
 * BattleInsect에서 스냅샷 생성
 */
export function createInsectSnapshot(
  insect: BattleInsect
): BattleInsectSnapshot {
  return {
    speciesId: insect.base.id,
    currentHp: insect.currentHp,
    maxHp: insect.maxHp,
    statModifiers: { ...insect.statModifiers },
    statusCondition: insect.statusCondition,
    sleepTurns: insect.sleepTurns,
  }
}

/**
 * 현재 배틀 상태에서 스냅샷 생성
 */
export function createBattleSnapshot(
  turn: number,
  player: BattleInsect,
  opponent: BattleInsect
): BattleSnapshot {
  return {
    turn,
    player1: createInsectSnapshot(player),
    player2: createInsectSnapshot(opponent),
    timestamp: new Date(),
  }
}

/**
 * 새 배틀 레코더 생성
 */
export function createBattleRecorder(
  player: BattleInsect,
  opponent: BattleInsect
): BattleRecorder {
  return {
    initialSnapshot: createBattleSnapshot(0, player, opponent),
    actions: [],
    sequence: 0,
  }
}

/**
 * 액션 기록
 */
export function recordAction(
  recorder: BattleRecorder,
  turn: number,
  type: BattleActionType,
  actor: 1 | 2,
  data: BattleActionData,
  snapshot?: BattleSnapshot
): void {
  recorder.sequence++
  recorder.actions.push({
    sequence: recorder.sequence,
    turn,
    type,
    actor,
    data,
    resultSnapshot: snapshot,
  })
}

/**
 * 턴 시작 기록
 */
export function recordTurnStart(recorder: BattleRecorder, turn: number): void {
  recordAction(recorder, turn, 'turn_start', 1, { turnNumber: turn })
}

/**
 * 스킬 선택 기록
 */
export function recordMoveSelect(
  recorder: BattleRecorder,
  turn: number,
  actor: 1 | 2,
  moveId: string
): void {
  recordAction(recorder, turn, 'move_select', actor, { moveId })
}

/**
 * 스킬 실행 기록
 */
export function recordMoveExecute(
  recorder: BattleRecorder,
  turn: number,
  actor: 1 | 2,
  moveId: string,
  hit: boolean
): void {
  recordAction(recorder, turn, 'move_execute', actor, { moveId, hit })
}

/**
 * 데미지 기록
 */
export function recordDamage(
  recorder: BattleRecorder,
  turn: number,
  actor: 1 | 2,
  moveId: string,
  damage: number,
  critical: boolean,
  effectiveness: number,
  randomFactor: number,
  snapshot: BattleSnapshot
): void {
  recordAction(
    recorder,
    turn,
    'damage_dealt',
    actor,
    { moveId, damage, critical, effectiveness, randomFactor },
    snapshot
  )
}

/**
 * 상태이상 적용 기록
 */
export function recordStatusApplied(
  recorder: BattleRecorder,
  turn: number,
  actor: 1 | 2,
  condition: StatusCondition,
  duration?: number
): void {
  recordAction(recorder, turn, 'status_applied', actor, { condition, duration })
}

/**
 * 스탯 변화 기록
 */
export function recordStatChanged(
  recorder: BattleRecorder,
  turn: number,
  actor: 1 | 2,
  stat: 'atk' | 'def' | 'spAtk' | 'spDef' | 'spd',
  stages: number,
  newValue: number
): void {
  recordAction(recorder, turn, 'stat_changed', actor, {
    stat,
    stages,
    newValue,
  })
}

/**
 * 상태이상 데미지 기록
 */
export function recordStatusDamage(
  recorder: BattleRecorder,
  turn: number,
  actor: 1 | 2,
  condition: 'poison' | 'burn',
  damage: number,
  snapshot: BattleSnapshot
): void {
  recordAction(
    recorder,
    turn,
    'status_damage',
    actor,
    { condition, damage },
    snapshot
  )
}

/**
 * 기절 기록
 */
export function recordFaint(
  recorder: BattleRecorder,
  turn: number,
  actor: 1 | 2,
  finalHp: number
): void {
  recordAction(recorder, turn, 'faint', actor, { finalHp })
}

/**
 * 턴 종료 기록
 */
export function recordTurnEnd(
  recorder: BattleRecorder,
  turn: number,
  snapshot: BattleSnapshot
): void {
  recordAction(recorder, turn, 'turn_end', 1, { turnNumber: turn }, snapshot)
}
