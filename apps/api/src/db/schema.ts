import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const battles = sqliteTable('battles', {
  id: text('id').primaryKey(),
  playerId: text('player_id').notNull(),
  opponentId: text('opponent_id').notNull(),
  winner: text('winner'),
  totalTurns: integer('total_turns').notNull(),
  playerFinalHp: integer('player_final_hp').notNull(),
  opponentFinalHp: integer('opponent_final_hp').notNull(),
  playerMaxHp: integer('player_max_hp').notNull(),
  opponentMaxHp: integer('opponent_max_hp').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const battleLogs = sqliteTable('battle_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  battleId: text('battle_id')
    .notNull()
    .references(() => battles.id),
  turn: integer('turn').notNull(),
  actor: text('actor').notNull(),
  action: text('action').notNull(),
  actionId: text('action_id'),
  damage: integer('damage'),
  critical: integer('critical').notNull().default(0),
  playerHp: integer('player_hp').notNull(),
  opponentHp: integer('opponent_hp').notNull(),
})

export const matchupStats = sqliteTable('matchup_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playerId: text('player_id').notNull(),
  opponentId: text('opponent_id').notNull(),
  playerWins: integer('player_wins').notNull().default(0),
  opponentWins: integer('opponent_wins').notNull().default(0),
  draws: integer('draws').notNull().default(0),
  totalBattles: integer('total_battles').notNull().default(0),
  avgTurns: real('avg_turns').notNull().default(0),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

export type Battle = typeof battles.$inferSelect
export type NewBattle = typeof battles.$inferInsert
export type BattleLog = typeof battleLogs.$inferSelect
export type NewBattleLog = typeof battleLogs.$inferInsert
export type MatchupStat = typeof matchupStats.$inferSelect
export type NewMatchupStat = typeof matchupStats.$inferInsert
