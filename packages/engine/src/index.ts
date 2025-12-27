export type {
  InsectType,
  Stats,
  StatModifiers,
  StatusCondition,
  MoveEffect,
  Move,
  Insect,
  BattleInsect,
  BattleLogEntry,
  BattleState,
  SimulationResult,
  TypeChart,
} from './types'

export type {
  Player,
  OwnedInsect,
  Match,
  MatchLog,
  BattleSnapshot,
  BattleInsectSnapshot,
  BattleAction,
  BattleActionType,
  BattleActionData,
  MoveSelectData,
  MoveExecuteData,
  DamageData,
  StatusAppliedData,
  StatChangedData,
  StatusDamageData,
  FaintData,
  TurnMarkerData,
} from './domain'

export type {
  Repository,
  PlayerRepository,
  OwnedInsectRepository,
  MatchRepository,
  MatchLogRepository,
  UnitOfWork,
} from './ports'

export {
  InMemoryPlayerRepository,
  InMemoryOwnedInsectRepository,
  InMemoryMatchRepository,
  InMemoryMatchLogRepository,
  InMemoryUnitOfWork,
  getInMemoryUnitOfWork,
  resetInMemoryUnitOfWork,
} from './infrastructure'

export { insects, insectList, getInsectById } from './data/insects'
export { moves, moveList, getMoveById, getMovesByIds } from './data/moves'
export {
  typeChart,
  typeNames,
  typeEmoji,
  getTypeEffectiveness,
  getEffectivenessText,
  getEffectivenessLevel,
} from './data/type-chart'

export {
  createBattleInsect,
  getEffectiveStat,
  calculateDamage,
  checkAccuracy,
  determineFirstAttacker,
  applyStatChange,
  executeTurn,
  selectAIMove,
  simulateBattle,
  simulateBattleWithReplay,
  simulateMultipleBattles,
} from './engine/battle-engine'

export {
  createBattleRecorder,
  createBattleSnapshot,
  createInsectSnapshot,
  recordTurnStart,
  recordMoveSelect,
  recordMoveExecute,
  recordDamage,
  recordStatusApplied,
  recordStatChanged,
  recordStatusDamage,
  recordFaint,
  recordTurnEnd,
  type BattleRecorder,
} from './engine/battle-recorder'

export {
  statusConditionNames,
  applyStatusCondition,
  checkCanMove,
  processEndOfTurnStatus,
  getBurnAttackMultiplier,
  getParalysisSpeedMultiplier,
} from './engine/status-condition'
