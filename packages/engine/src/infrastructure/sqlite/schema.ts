import type { Client } from '@libsql/client'

export const SCHEMA = `
-- 플레이어 테이블
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  visible_id TEXT UNIQUE NOT NULL,
  nickname TEXT UNIQUE NOT NULL,
  rating INTEGER NOT NULL DEFAULT 1000,
  created_at TEXT NOT NULL,
  last_active_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_players_visible_id ON players(visible_id);
CREATE INDEX IF NOT EXISTS idx_players_nickname ON players(nickname);
CREATE INDEX IF NOT EXISTS idx_players_rating ON players(rating DESC);

-- 소유 곤충 테이블
CREATE TABLE IF NOT EXISTS owned_insects (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  species_id TEXT NOT NULL,
  nickname TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  exp INTEGER NOT NULL DEFAULT 0,
  ivs TEXT NOT NULL,  -- JSON: {hp, atk, def, spAtk, spDef, spd}
  obtained_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_owned_insects_player_id ON owned_insects(player_id);
CREATE INDEX IF NOT EXISTS idx_owned_insects_species_id ON owned_insects(species_id);

-- 매치 테이블
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  player1_id TEXT NOT NULL REFERENCES players(id),
  player2_id TEXT REFERENCES players(id),  -- NULL이면 AI
  player1_insect_id TEXT NOT NULL,
  player2_insect_id TEXT NOT NULL,
  winner_id TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  total_turns INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'active', 'finished', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_matches_player1_id ON matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2_id ON matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_ended_at ON matches(ended_at DESC);

-- 매치 로그 테이블 (리플레이용)
CREATE TABLE IF NOT EXISTS match_logs (
  id TEXT PRIMARY KEY,
  match_id TEXT UNIQUE NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  initial_snapshot TEXT NOT NULL,  -- JSON
  actions TEXT NOT NULL,           -- JSON array
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_match_logs_match_id ON match_logs(match_id);
`

export async function initializeSchema(client: Client): Promise<void> {
  await client.executeMultiple(SCHEMA)
}
