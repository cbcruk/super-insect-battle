// 격자 로그라이크 헤들리스 코어 (P1)

export type { Vec2, Direction } from './geometry'
export {
  DIRECTIONS,
  DIRECTION_DELTA,
  addDir,
  equals,
  posKey,
  chebyshev,
  dirToward,
  dirAway,
} from './geometry'

export type { TerrainType, TerrainProps } from './terrain'
export { TERRAIN } from './terrain'

export type { Tile, TileMap } from './map'
export {
  inBounds,
  tileAt,
  isWalkable,
  blocksSight,
  tileMapFromStrings,
} from './map'

export type { Faction, Actor, ActorBrain, CreateActorOptions } from './actor'
export { createActor, deriveSpeed } from './actor'
export { isHostile } from './faction'

export type { Command } from './command'
export type { GridEvent } from './events'
export { isEventVisible } from './event-visibility'
export type { CombatOutcome } from './combat'
export { resolveAttack } from './combat'

export {
  ENERGY_THRESHOLD,
  nextActor,
  grantEnergy,
  spendTurn,
} from './scheduler'

export type { Level, RunMode, RunStats, RunStatus, RunState } from './run'
export {
  createRun,
  applyCommand,
  isPlayerTurn,
  actorAt,
  canSpectate,
  emptyStats,
  isLastStanding,
  spectateTurn,
  survivorCount,
} from './run'

export { createBasicBrain } from './ai/basic-brain'
export { createSmartBrain, type SmartBrainOptions } from './ai/smart-brain'
export {
  createShowdownRun,
  showdownPlacement,
  showdownWinner,
  type ShowdownOptions,
} from './showdown'
export { createDuelRun, isAutopilot, type DuelOptions } from './duel'
export { runAutoDuel, duelBatch, type DuelBatchResult } from './duel-sim'
export {
  absorbCubes,
  CUBE_GLYPH,
  CUBE_HP_RATIO,
  CUBES_PER_STRENGTH,
} from './power-cube'
export {
  gasDamage,
  isInGas,
  turnsUntilShrink,
  zoneRadius,
  GAS_DAMAGE_RATIO,
  type SafeZone,
} from './zone'
export { makeDemoLevel, type DemoSetup } from './demo-level'
export {
  renderLevel,
  renderFrame,
  enemyList,
  showdownReport,
  duelReport,
} from './render'

// P2: 절차 생성 · 시야 · 길찾기
export { generateJungle, type GeneratedMap, type JungleOptions } from './mapgen'
export { computeVisible, lineOfSight, SIGHT_RADIUS } from './fov'
export { stepAlongPath, fleeStep, type Blocked } from './pathfind'
export {
  nearestEnemy,
  nearestEnemyInRange,
  nearestVisibleCube,
} from './targeting'
export { ITEMS, ITEM_IDS, type ItemDef } from './items'
export {
  refreshFov,
  createGeneratedLevel,
  enterLevel,
  createGeneratedRun,
  HOSTILE_GLYPHS,
} from './generate'
export {
  assessThreat,
  describeThreat,
  visibleEnemies,
  THREAT_LABELS,
  type ThreatLevel,
  type ThreatAssessment,
} from './threat'
