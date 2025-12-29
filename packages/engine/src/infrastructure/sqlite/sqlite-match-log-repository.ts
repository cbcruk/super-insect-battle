import type { Client } from '@libsql/client'
import type { MatchLog, BattleAction } from '../../domain/entities'
import type { MatchLogRepository } from '../../ports/repositories'

export class SqliteMatchLogRepository implements MatchLogRepository {
  constructor(private client: Client) {}

  async findById(id: string): Promise<MatchLog | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM match_logs WHERE id = ?',
      args: [id],
    })

    return result.rows[0] ? this.mapRow(result.rows[0]) : null
  }

  async findAll(): Promise<MatchLog[]> {
    const result = await this.client.execute('SELECT * FROM match_logs')

    return result.rows.map((row) => this.mapRow(row))
  }

  async save(log: MatchLog): Promise<MatchLog> {
    await this.client.execute({
      sql: `
        INSERT INTO match_logs (id, match_id, initial_snapshot, actions, created_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          actions = excluded.actions
      `,
      args: [
        log.id,
        log.matchId,
        JSON.stringify(log.initialSnapshot),
        JSON.stringify(log.actions),
        log.createdAt.toISOString(),
      ],
    })
    return log
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.client.execute({
      sql: 'DELETE FROM match_logs WHERE id = ?',
      args: [id],
    })

    return result.rowsAffected > 0
  }

  async findByMatchId(matchId: string): Promise<MatchLog | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM match_logs WHERE match_id = ?',
      args: [matchId],
    })

    return result.rows[0] ? this.mapRow(result.rows[0]) : null
  }

  async findByPlayerId(playerId: string, limit?: number): Promise<MatchLog[]> {
    const sql = limit
      ? `
        SELECT ml.* FROM match_logs ml
        JOIN matches m ON ml.match_id = m.id
        WHERE m.player1_id = ? OR m.player2_id = ?
        ORDER BY ml.created_at DESC
        LIMIT ?
      `
      : `
        SELECT ml.* FROM match_logs ml
        JOIN matches m ON ml.match_id = m.id
        WHERE m.player1_id = ? OR m.player2_id = ?
        ORDER BY ml.created_at DESC
      `
    const args = limit ? [playerId, playerId, limit] : [playerId, playerId]
    const result = await this.client.execute({ sql, args })

    return result.rows.map((row) => this.mapRow(row))
  }

  async appendAction(matchId: string, action: BattleAction): Promise<boolean> {
    const log = await this.findByMatchId(matchId)

    if (!log) return false

    log.actions.push(action)

    await this.client.execute({
      sql: 'UPDATE match_logs SET actions = ? WHERE match_id = ?',
      args: [JSON.stringify(log.actions), matchId],
    })

    return true
  }

  private mapRow(row: Record<string, unknown>): MatchLog {
    return {
      id: row.id as string,
      matchId: row.match_id as string,
      initialSnapshot: JSON.parse(row.initial_snapshot as string),
      actions: JSON.parse(row.actions as string),
      createdAt: new Date(row.created_at as string),
    }
  }
}
