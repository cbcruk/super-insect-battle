import type { Match } from '../../domain/entities'
import type { MatchRepository } from '../../ports/repositories'

export class InMemoryMatchRepository implements MatchRepository {
  private matches: Map<string, Match> = new Map()

  async findById(id: string): Promise<Match | null> {
    return this.matches.get(id) ?? null
  }

  async findAll(): Promise<Match[]> {
    return Array.from(this.matches.values())
  }

  async save(match: Match): Promise<Match> {
    this.matches.set(match.id, { ...match })

    return match
  }

  async delete(id: string): Promise<boolean> {
    return this.matches.delete(id)
  }

  async findByPlayerId(playerId: string, limit?: number): Promise<Match[]> {
    const results = Array.from(this.matches.values())
      .filter(
        (match) => match.player1Id === playerId || match.player2Id === playerId
      )
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())

    return limit ? results.slice(0, limit) : results
  }

  async findByPlayerIds(
    player1Id: string,
    player2Id: string
  ): Promise<Match[]> {
    return Array.from(this.matches.values())
      .filter(
        (match) =>
          (match.player1Id === player1Id && match.player2Id === player2Id) ||
          (match.player1Id === player2Id && match.player2Id === player1Id)
      )
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
  }

  async findActiveMatches(): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.status === 'active' || match.status === 'waiting'
    )
  }

  async findActiveMatchByPlayerId(playerId: string): Promise<Match | null> {
    for (const match of this.matches.values()) {
      if (
        (match.player1Id === playerId || match.player2Id === playerId) &&
        (match.status === 'active' || match.status === 'waiting')
      ) {
        return match
      }
    }
    return null
  }

  async updateStatus(
    id: string,
    status: Match['status'],
    winnerId?: string | null
  ): Promise<Match | null> {
    const match = this.matches.get(id)

    if (!match) return null

    const updated: Match = {
      ...match,
      status,
      winnerId: winnerId !== undefined ? winnerId : match.winnerId,
      endedAt:
        status === 'finished' || status === 'cancelled'
          ? new Date()
          : match.endedAt,
    }

    this.matches.set(id, updated)

    return updated
  }

  async findRecent(limit: number): Promise<Match[]> {
    return Array.from(this.matches.values())
      .filter((match) => match.status === 'finished')
      .sort((a, b) => {
        const aTime = a.endedAt?.getTime() ?? 0
        const bTime = b.endedAt?.getTime() ?? 0
        return bTime - aTime
      })
      .slice(0, limit)
  }

  /** 테스트용: 모든 데이터 삭제 */
  clear(): void {
    this.matches.clear()
  }
}
