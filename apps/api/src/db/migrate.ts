import { client } from './client.js'

const migrations = [
  `CREATE TABLE IF NOT EXISTS battles (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    opponent_id TEXT NOT NULL,
    winner TEXT NOT NULL,
    total_turns INTEGER NOT NULL,
    player_final_hp INTEGER NOT NULL,
    opponent_final_hp INTEGER NOT NULL,
    player_max_hp INTEGER NOT NULL,
    opponent_max_hp INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS battle_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    battle_id TEXT NOT NULL REFERENCES battles(id),
    turn INTEGER NOT NULL,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    action_id TEXT,
    damage INTEGER,
    critical INTEGER NOT NULL DEFAULT 0,
    player_hp INTEGER NOT NULL,
    opponent_hp INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS matchup_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    opponent_id TEXT NOT NULL,
    player_wins INTEGER NOT NULL DEFAULT 0,
    opponent_wins INTEGER NOT NULL DEFAULT 0,
    draws INTEGER NOT NULL DEFAULT 0,
    total_battles INTEGER NOT NULL DEFAULT 0,
    avg_turns REAL NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(player_id, opponent_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_battles_player_id ON battles(player_id)`,
  `CREATE INDEX IF NOT EXISTS idx_battles_opponent_id ON battles(opponent_id)`,
  `CREATE INDEX IF NOT EXISTS idx_battles_created_at ON battles(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_battle_logs_battle_id ON battle_logs(battle_id)`,
  `CREATE INDEX IF NOT EXISTS idx_matchup_stats_player_opponent ON matchup_stats(player_id, opponent_id)`,
]

async function migrate(): Promise<void> {
  console.log('Running migrations...')

  for (const sql of migrations) {
    await client.execute(sql)
  }

  console.log('Migrations completed successfully.')
}

migrate().catch(console.error)
