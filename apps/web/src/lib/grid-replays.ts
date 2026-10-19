import { getArthropodById } from '@super-insect-battle/engine'
import {
  isDuelReplay,
  type DuelReplay,
  type RunState,
} from '@super-insect-battle/roguelike'
import type { ReplayStorage, SavedGridReplay } from './grid-replays.types.ts'
import { duelWinner } from './duel-winner.ts'

const STORAGE_KEY = 'sib-grid-replays'
const MAX_SAVED = 50

/** 브라우저 저장소. 쿠키 차단 등으로 접근할 수 없으면 null. */
export function getReplayStorage(): ReplayStorage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** 저장된 격자 리플레이 목록. 깨진 항목은 건너뛴다. */
export function loadGridReplays(storage: ReplayStorage): SavedGridReplay[] {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is SavedGridReplay =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        isDuelReplay(item.replay)
    )
  } catch {
    return []
  }
}

/** id로 저장된 격자 리플레이 하나를 찾는다. */
export function findGridReplay(
  storage: ReplayStorage,
  id: string
): SavedGridReplay | undefined {
  return loadGridReplays(storage).find((r) => r.id === id)
}

/**
 * 끝난 판의 리플레이를 목록 맨 앞에 저장한다. 오래된 것부터 지워 최대 50건을 둔다.
 *
 * 승자는 `duelOutcome`으로 정한다. 같은 턴에 둘 다 쓰러졌으면 무승부로 적는다.
 *
 * @returns 저장된 항목.
 */
export function saveGridReplay(
  storage: ReplayStorage,
  run: RunState,
  replay: DuelReplay,
  now: number = Date.now()
): SavedGridReplay {
  const opponentName =
    getArthropodById(replay.opponentSpeciesId)?.nameKo ?? '???'
  const winner = duelWinner(run)
  const saved: SavedGridReplay = {
    id: `${now}-${replay.seed}`,
    timestamp: now,
    playerName: run.player.species.nameKo,
    opponentName,
    winnerName: winner?.species.nameKo ?? null,
    totalTurns: run.stats.endTurn ?? run.turn,
    replay,
  }
  const list = [saved, ...loadGridReplays(storage)].slice(0, MAX_SAVED)
  storage.setItem(STORAGE_KEY, JSON.stringify(list))
  return saved
}

/** id의 격자 리플레이를 지운다. */
export function deleteGridReplay(storage: ReplayStorage, id: string): void {
  const list = loadGridReplays(storage).filter((r) => r.id !== id)
  storage.setItem(STORAGE_KEY, JSON.stringify(list))
}
