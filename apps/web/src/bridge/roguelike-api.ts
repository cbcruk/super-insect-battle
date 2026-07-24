const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

export interface DailyInfo {
  date: string
  seed: number
}

export interface LeaderRun {
  name: string
  species: string
  depth: number
  turns: number
  outcome: 'won' | 'dead'
  score: number
  createdAt: string
}

export interface Leaderboard {
  seed?: number
  date?: string
  runs: LeaderRun[]
}

export interface RunSubmission {
  seed: number
  dailyDate?: string | null
  name?: string
  species: string
  depth: number
  turns: number
  outcome: 'won' | 'dead'
}

/** 실패(서버 미연결 등) 시 null 반환 — 오프라인 플레이는 유지된다. */
async function safeJson<T>(request: Promise<Response>): Promise<T | null> {
  try {
    const response = await request
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

function timed(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(4000) })
}

export const roguelikeApi = {
  getDaily: () => safeJson<DailyInfo>(timed(`${BASE}/api/roguelike/daily`)),

  getDailyLeaderboard: () =>
    safeJson<Leaderboard>(timed(`${BASE}/api/roguelike/daily/leaderboard`)),

  getLeaderboard: (seed: number) =>
    safeJson<Leaderboard>(
      timed(`${BASE}/api/roguelike/leaderboard?seed=${seed}`)
    ),

  submitRun: (body: RunSubmission) =>
    safeJson<{ id: string; score: number }>(
      timed(`${BASE}/api/roguelike/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    ),
}

/** 클라이언트 표시용 점수(서버와 동일 공식). */
export function localScore(
  depth: number,
  turns: number,
  outcome: 'won' | 'dead'
): number {
  return (
    depth * 1000 + (outcome === 'won' ? 2000 : 0) + Math.max(0, 3000 - turns)
  )
}
