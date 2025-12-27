import type { MatchLog, BattleAction } from '../../domain/entities'
import type { MatchLogRepository } from '../../ports/repositories'

export class InMemoryMatchLogRepository implements MatchLogRepository {
  private logs: Map<string, MatchLog> = new Map()
  /** matchId -> logId 매핑 (빠른 조회용) */
  private matchIdIndex: Map<string, string> = new Map()

  async findById(id: string): Promise<MatchLog | null> {
    return this.logs.get(id) ?? null
  }

  async findAll(): Promise<MatchLog[]> {
    return Array.from(this.logs.values())
  }

  async save(log: MatchLog): Promise<MatchLog> {
    const saved = {
      ...log,
      actions: [...log.actions],
      initialSnapshot: { ...log.initialSnapshot },
    }

    this.logs.set(log.id, saved)

    this.matchIdIndex.set(log.matchId, log.id)

    return saved
  }

  async delete(id: string): Promise<boolean> {
    const log = this.logs.get(id)

    if (log) {
      this.matchIdIndex.delete(log.matchId)
    }

    return this.logs.delete(id)
  }

  async findByMatchId(matchId: string): Promise<MatchLog | null> {
    const logId = this.matchIdIndex.get(matchId)

    if (!logId) return null

    return this.logs.get(logId) ?? null
  }

  async findByPlayerId(_playerId: string, limit?: number): Promise<MatchLog[]> {
    // TODO: 실제 구현에서는 Match 테이블과 조인하여 playerId로 필터링 필요
    // In-Memory에서는 현재 모든 로그를 반환 (Match 정보가 없으므로)
    const results = Array.from(this.logs.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )

    return limit ? results.slice(0, limit) : results
  }

  async appendAction(matchId: string, action: BattleAction): Promise<boolean> {
    const logId = this.matchIdIndex.get(matchId)

    if (!logId) return false

    const log = this.logs.get(logId)

    if (!log) return false

    log.actions.push(action)

    return true
  }

  /** 테스트용: 모든 데이터 삭제 */
  clear(): void {
    this.logs.clear()
    this.matchIdIndex.clear()
  }
}
