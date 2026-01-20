import type { BattleSession, PlayerInsect } from '../game/types'

export interface GameEvents {
  playerEnter: { roomId: string; previousRoomId: string | null }
  playerLeave: { roomId: string; nextRoomId: string }
  battleStart: { opponent: BattleSession['opponent']; playerInsect: PlayerInsect }
  battleEnd: { winner: 'player' | 'opponent' | 'draw'; opponent: BattleSession['opponent'] }
  turnStart: { turn: number; playerInsect: PlayerInsect; opponentName: string }
}

type EventHandler<T> = (payload: T) => void

class GameEventBus {
  private handlers: Map<keyof GameEvents, Set<EventHandler<unknown>>> = new Map()

  on<K extends keyof GameEvents>(event: K, handler: EventHandler<GameEvents[K]>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler as EventHandler<unknown>)
  }

  off<K extends keyof GameEvents>(event: K, handler: EventHandler<GameEvents[K]>): void {
    const eventHandlers = this.handlers.get(event)
    if (eventHandlers) {
      eventHandlers.delete(handler as EventHandler<unknown>)
    }
  }

  emit<K extends keyof GameEvents>(event: K, payload: GameEvents[K]): void {
    const eventHandlers = this.handlers.get(event)
    if (eventHandlers) {
      for (const handler of eventHandlers) {
        handler(payload)
      }
    }
  }

  clear(): void {
    this.handlers.clear()
  }
}

export const eventBus = new GameEventBus()
