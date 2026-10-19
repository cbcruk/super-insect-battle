import { describe, it, expect } from 'vitest'
import { getArthropodById } from '@super-insect-battle/engine'
import {
  createDuelReplay,
  createDuelRun,
  type DuelOptions,
} from '@super-insect-battle/roguelike'
import {
  deleteGridReplay,
  findGridReplay,
  loadGridReplays,
  saveGridReplay,
} from './grid-replays.ts'
import type { ReplayStorage } from './grid-replays.types.ts'

function memoryStorage(): ReplayStorage & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  }
}

const OPTS: DuelOptions = {
  playerSpecies: getArthropodById('mantis')!,
  opponentSpecies: getArthropodById('scorpion')!,
  seed: 3,
  autopilot: true,
}

describe('grid replays', () => {
  it('saves newest first and finds and deletes by id', () => {
    const storage = memoryStorage()
    const run = createDuelRun(OPTS)
    run.status = 'dead'
    const a = saveGridReplay(storage, run, createDuelReplay(OPTS), 1)
    const b = saveGridReplay(storage, run, createDuelReplay(OPTS), 2)

    expect(loadGridReplays(storage).map((r) => r.id)).toEqual([b.id, a.id])
    expect(a).toMatchObject({
      playerName: '사마귀',
      opponentName: '전갈',
      winnerName: '전갈',
    })
    expect(findGridReplay(storage, a.id)?.replay.seed).toBe(3)

    deleteGridReplay(storage, b.id)
    expect(loadGridReplays(storage).map((r) => r.id)).toEqual([a.id])
  })

  it('survives corrupt storage', () => {
    const storage = memoryStorage()
    storage.setItem('sib-grid-replays', '{not json')
    expect(loadGridReplays(storage)).toEqual([])
    storage.setItem('sib-grid-replays', JSON.stringify([{ id: 'x' }]))
    expect(loadGridReplays(storage)).toEqual([])
  })
})
