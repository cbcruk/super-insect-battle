import type { BattleLogEntry } from '@super-insect-battle/engine'

export function getEventDelay(
  entry: BattleLogEntry,
  prevEntry?: BattleLogEntry
): number {
  let delay = 200 + Math.random() * 200

  if (entry.damage && entry.damage > 0) {
    delay += 100
  }

  if (entry.critical) {
    delay += 150
  }

  if (prevEntry && entry.turn !== prevEntry.turn) {
    delay += 300
  }

  return delay
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatSSEEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}
