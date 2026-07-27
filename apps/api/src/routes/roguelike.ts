import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { roguelikeRuns } from '../db/schema.js'
import type { AppEnv } from '../types.js'

const roguelike = new Hono<AppEnv>()

interface RunSubmission {
  seed: number
  dailyDate?: string | null
  name?: string
  species: string
  depth: number
  turns: number
  outcome: 'won' | 'dead'
}

/** UTC 오늘 날짜 'YYYY-MM-DD'. */
function todayUtc(): string {
  return new Date().toISOString().slice(0, 10)
}

/** 문자열 → 32비트 시드 (FNV-1a). 날짜당 결정론적 데일리 시드. */
function hashSeed(str: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** 점수: 깊이 우선, 생존 보너스, 적은 턴 보너스. */
function scoreOf(depth: number, turns: number, outcome: string): number {
  return (
    depth * 1000 + (outcome === 'won' ? 2000 : 0) + Math.max(0, 3000 - turns)
  )
}

function formatRun(r: typeof roguelikeRuns.$inferSelect) {
  return {
    name: r.playerName,
    species: r.speciesId,
    depth: r.depth,
    turns: r.turns,
    outcome: r.outcome,
    score: r.score,
    createdAt: r.createdAt,
  }
}

roguelike.get('/daily', (c) => {
  const date = todayUtc()
  return c.json({ date, seed: hashSeed(`daily:${date}`) })
})

roguelike.post('/runs', async (c) => {
  const db = c.get('db')
  const body = await c.req.json<RunSubmission>()

  if (
    typeof body.seed !== 'number' ||
    typeof body.depth !== 'number' ||
    typeof body.turns !== 'number' ||
    (body.outcome !== 'won' && body.outcome !== 'dead')
  ) {
    return c.json({ error: 'invalid run submission' }, 400)
  }

  const id = crypto.randomUUID()
  const score = scoreOf(body.depth, body.turns, body.outcome)
  const playerName =
    typeof body.name === 'string' && body.name.trim()
      ? body.name.trim().slice(0, 24)
      : 'anon'

  await db.insert(roguelikeRuns).values({
    id,
    seed: body.seed,
    dailyDate: body.dailyDate ?? null,
    playerName,
    speciesId: String(body.species ?? 'unknown'),
    depth: body.depth,
    turns: body.turns,
    outcome: body.outcome,
    score,
  })

  return c.json({ id, score })
})

roguelike.get('/leaderboard', async (c) => {
  const db = c.get('db')
  const seed = Number(c.req.query('seed'))
  const limit = Math.min(Number(c.req.query('limit')) || 10, 50)
  if (!Number.isFinite(seed)) {
    return c.json({ error: 'seed query required' }, 400)
  }

  const runs = await db
    .select()
    .from(roguelikeRuns)
    .where(eq(roguelikeRuns.seed, seed))
    .orderBy(desc(roguelikeRuns.score))
    .limit(limit)

  return c.json({ seed, runs: runs.map(formatRun) })
})

roguelike.get('/daily/leaderboard', async (c) => {
  const db = c.get('db')
  const date = todayUtc()
  const limit = Math.min(Number(c.req.query('limit')) || 10, 50)

  const runs = await db
    .select()
    .from(roguelikeRuns)
    .where(eq(roguelikeRuns.dailyDate, date))
    .orderBy(desc(roguelikeRuns.score))
    .limit(limit)

  return c.json({
    date,
    seed: hashSeed(`daily:${date}`),
    runs: runs.map(formatRun),
  })
})

export { roguelike }
