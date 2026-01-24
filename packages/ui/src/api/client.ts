export interface BattleStartEvent {
  player: string
  opponent: string
  playerHp: number
  opponentHp: number
}

export interface BattleTurnEvent {
  turn: number
  actor: 'player' | 'opponent'
  action: string
  actionId?: string
  damage?: number
  critical?: boolean
  remainingHp?: { player: number; opponent: number }
}

export interface BattleEndEvent {
  winner: 'player' | 'opponent' | 'draw'
  playerHp: number
  opponentHp: number
  totalTurns: number
}

export interface BattleEventHandlers {
  onStart: (data: BattleStartEvent) => void
  onTurn: (data: BattleTurnEvent) => Promise<void>
  onEnd: (data: BattleEndEvent) => void
  onError: (error: Error) => void
}

export interface BattleStatsResponse {
  player: string
  opponent: string
  count: number
  stats: {
    playerWins: number
    opponentWins: number
    draws: number
    winRate: number
    avgTurns: number
  }
}

export class BattleApiClient {
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }

  async streamBattle(
    playerId: string,
    opponentId: string,
    handlers: BattleEventHandlers
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/battle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player: playerId, opponent: opponentId }),
    })

    if (!response.ok) {
      const error = (await response.json()) as { error?: string }
      throw new Error(error.error || 'Battle request failed')
    }

    if (!response.body) {
      throw new Error('No response body')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      let currentEvent = ''

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7)
        } else if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6))

          switch (currentEvent) {
            case 'start':
              handlers.onStart(data as BattleStartEvent)
              break
            case 'turn':
              await handlers.onTurn(data as BattleTurnEvent)
              break
            case 'end':
              handlers.onEnd(data as BattleEndEvent)
              break
          }
        }
      }
    }
  }

  async getStats(
    playerId: string,
    opponentId: string,
    count: number = 100
  ): Promise<BattleStatsResponse> {
    const response = await fetch(`${this.baseUrl}/api/battle/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player: playerId, opponent: opponentId, count }),
    })

    if (!response.ok) {
      const error = (await response.json()) as { error?: string }
      throw new Error(error.error || 'Stats request failed')
    }

    return (await response.json()) as BattleStatsResponse
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        signal: AbortSignal.timeout(2000),
      })

      return response.ok
    } catch {
      return false
    }
  }
}
