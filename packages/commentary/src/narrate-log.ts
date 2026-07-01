import type {
  BattleState,
  BattleArthropod,
  Environment,
  BattleLogEntry,
} from '@super-insect-battle/engine'
import { deriveEvents } from './events'
import { narrate } from './narrator'
import type { CommentaryLine, Side } from './types'

export interface LogNarrationContext {
  player: BattleArthropod
  opponent: BattleArthropod
  environment: Environment
  winner: Side | 'draw' | null
}

export function narrateLog(
  log: BattleLogEntry[],
  ctx: LogNarrationContext
): CommentaryLine[] {
  const state: BattleState = {
    turn: log.length ? log[log.length - 1].turn : 0,
    player: ctx.player,
    opponent: ctx.opponent,
    environment: ctx.environment,
    log,
    status: ctx.winner ? 'finished' : 'running',
    winner: ctx.winner,
  }
  return narrate(deriveEvents(state))
}
