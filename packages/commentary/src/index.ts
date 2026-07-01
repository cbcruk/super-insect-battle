export type {
  Side,
  Magnitude,
  Matchup,
  Hp,
  BattleEvent,
  CommentaryLine,
  Emphasis,
  FeedItem,
  MatchFeed,
} from './types'
export { deriveEvents } from './events'
export { narrate, createNarrator, type Narrator } from './narrator'
export { buildFeed } from './feed'
export { narrateLog, type LogNarrationContext } from './narrate-log'
export { eunNeun, iGa, eulReul, euroRo } from './particles'
