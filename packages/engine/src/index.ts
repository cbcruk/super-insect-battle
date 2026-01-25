export type {
  WeaponType,
  BehaviorStyle,
  PhysicalStats,
  WeaponStats,
  BehaviorStats,
  DefenseStats,
  Arthropod,
  StatusCondition,
  BattleMode,
  StatType,
  StatStages,
  BattleArthropod,
} from './types/arthropod'

export type { ActionCategory, ActionEffect, Action } from './types/action'

export type {
  Terrain,
  TimeOfDay,
  Environment,
  HabitatPreference,
} from './types/environment'
export { TERRAINS, TIMES_OF_DAY } from './types/environment'

export { arthropods, arthropodList, getArthropodById } from './data/arthropods'
export {
  actions,
  actionList,
  getActionById,
  getActionsByIds,
} from './data/actions'
export {
  getStyleMatchup,
  getWeightBonus,
  getWeaponVsArmorBonus,
  calculateTotalMultiplier,
  type DamageFactors,
} from './data/matchup'

export {
  createBattleArthropod,
  calculateDamage,
  checkAccuracy,
  determineFirstAttacker,
  applyActionEffect,
  executeTurn,
  selectAIAction,
  simulateBattle,
  simulateMultipleBattles,
  type BattleLogEntry,
  type BattleState,
} from './engine/battle-engine'

export {
  statusConditionNames,
  applyStatusCondition,
  checkCanMove,
  processEndOfTurnStatus,
} from './engine/status-condition'

export {
  battleModeNames,
  applyBattleMode,
  getFleeEvasionBonus,
  getBraceDamageReduction,
  canAttackInMode,
  getAttackPenalty,
  processBattleModeEndOfTurn,
} from './engine/battle-mode'

export {
  createStatStages,
  applyStatStageChange,
  getStatMultiplier,
} from './engine/stat-stages'

export { selectStrategicAIAction } from './engine/ai-strategy'

export {
  terrainNames,
  timeOfDayNames,
  getEnvironmentBonus,
  getRandomTerrain,
  getRandomTimeOfDay,
  getRandomEnvironment,
  formatEnvironment,
  formatEnvironmentBonus,
} from './engine/environment'
