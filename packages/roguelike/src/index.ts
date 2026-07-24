// 격자 로그라이크 헤들리스 코어 (P1)

export type { Vec2, Direction } from './geometry'
export {
  DIRECTIONS,
  DIRECTION_DELTA,
  addDir,
  equals,
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

export type { Command } from './command'
export type { GridEvent } from './events'
export type { CombatOutcome } from './combat'
export { resolveAttack } from './combat'

export {
  ENERGY_THRESHOLD,
  nextActor,
  grantEnergy,
  spendTurn,
} from './scheduler'

export type { Level, RunStatus, RunState } from './run'
export { createRun, applyCommand, isPlayerTurn, actorAt } from './run'

export { createBasicBrain } from './ai/basic-brain'
export { makeDemoLevel, type DemoSetup } from './demo-level'
export { renderLevel, renderFrame } from './render'
