export type {
  GameState,
  GameMode,
  Player,
  PlayerInsect,
  BattleSession,
  Room,
  CommandResult,
  CommandHandler,
} from './game/types'

export {
  createInitialGameState,
  getGameMode,
  getActiveInsect,
  addInsectToTeam,
  movePlayer,
  syncTeamHpFromBattle,
  healTeam,
} from './game/state'

export type { ParsedCommand } from './parser'
export { parseCommand, isEmptyInput } from './parser'

export {
  executeCommand,
  lookCommand,
  goCommand,
  teamCommand,
  healCommand,
  helpCommand,
  quitCommand,
  battleCommand,
  useCommand,
  runCommand,
} from './commands'

export { rooms, directionAliases, getRoom, normalizeDirection } from './world/rooms'

export { eventBus, type GameEvents } from './events'

export {
  behaviors,
  getBehavior,
  selectMoveWithBehavior,
  aggressiveBehavior,
  defensiveBehavior,
  balancedBehavior,
  type InsectBehavior,
} from './behaviors'

export {
  rollEncounter,
  generateIVs,
  selectWeightedInsect,
  selectRandomInsect,
  applyIVsToStats,
  type IndividualValues,
  type WeightedInsect,
} from './random'

export {
  line,
  titleBox,
  hpBar,
  formatInsectStatus,
  formatBattleInsect,
  formatBattleScreen,
  formatExploreHints,
  formatPostBattleHints,
  formatTeam,
  getPrompt,
  welcomeMessage,
} from './ui/display'
