-- 로그라이크 런 기록 · 리더보드 (Cloudflare D1 / SQLite)

CREATE TABLE IF NOT EXISTS roguelike_runs (
  id TEXT PRIMARY KEY,
  seed INTEGER NOT NULL,
  daily_date TEXT,
  player_name TEXT NOT NULL DEFAULT 'anon',
  species_id TEXT NOT NULL,
  depth INTEGER NOT NULL,
  turns INTEGER NOT NULL,
  outcome TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rl_runs_seed_score ON roguelike_runs(seed, score DESC);
CREATE INDEX IF NOT EXISTS idx_rl_runs_daily_score ON roguelike_runs(daily_date, score DESC);
