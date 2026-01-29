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
  Weather,
  Environment,
  HabitatPreference,
} from './types/environment'
export { TERRAINS, TIMES_OF_DAY, WEATHERS, TERRAIN_WEATHERS } from './types/environment'

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
  runInteractiveBattle,
  type BattleLogEntry,
  type BattleState,
  type InteractiveBattleCallbacks,
} from './engine/battle-engine'

export {
  statusConditionNames,
  applyStatusCondition,
  checkCanMove,
  processEndOfTurnStatus,
  getBurnStrengthPenalty,
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

export { createAIPlayer } from './engine/ai-player'

export type { Player, PlayerType, AIDifficulty, BattleContext } from './types/player'

export { resolveActionOrder, type QueuedAction } from './engine/battle-queue'

export {
  terrainNames,
  timeOfDayNames,
  weatherNames,
  getWeatherBonus,
  getEnvironmentBonus,
  getRandomTerrain,
  getRandomTimeOfDay,
  getRandomWeatherForTerrain,
  getRandomEnvironment,
  formatEnvironment,
  formatEnvironmentBonus,
} from './engine/environment'
