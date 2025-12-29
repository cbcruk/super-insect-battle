import type { Client } from '@libsql/client'
import type { Match } from '../../domain/entities'
import type { MatchRepository } from '../../ports/repositories'

export class SqliteMatchRepository implements MatchRepository {
  constructor(private client: Client) {}

  async findById(id: string): Promise<Match | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM matches WHERE id = ?',
      args: [id],
    })

    return result.rows[0] ? this.mapRow(result.rows[0]) : null
  }

  async findAll(): Promise<Match[]> {
    const result = await this.client.execute('SELECT * FROM matches')

    return result.rows.map((row) => this.mapRow(row))
  }

  async save(match: Match): Promise<Match> {
    await this.client.execute({
      sql: `
        INSERT INTO matches (id, player1_id, player2_id, player1_insect_id, player2_insect_id, winner_id, started_at, ended_at, total_turns, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          winner_id = excluded.winner_id,
          ended_at = excluded.ended_at,
          total_turns = excluded.total_turns,
          status = excluded.status
      `,
      args: [
        match.id,
        match.player1Id,
        match.player2Id,
        match.player1InsectId,
        match.player2InsectId,
        match.winnerId,
        match.startedAt.toISOString(),
        match.endedAt?.toISOString() ?? null,
        match.totalTurns,
        match.status,
      ],
    })
    return match
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.client.execute({
      sql: 'DELETE FROM matches WHERE id = ?',
      args: [id],
    })

    return result.rowsAffected > 0
  }

  async findByPlayerId(playerId: string, limit?: number): Promise<Match[]> {
    const sql = limit
      ? 'SELECT * FROM matches WHERE player1_id = ? OR player2_id = ? ORDER BY started_at DESC LIMIT ?'
      : 'SELECT * FROM matches WHERE player1_id = ? OR player2_id = ? ORDER BY started_at DESC'
    const args = limit ? [playerId, playerId, limit] : [playerId, playerId]
    const result = await this.client.execute({ sql, args })

    return result.rows.map((row) => this.mapRow(row))
  }

  async findByPlayerIds(
    player1Id: string,
    player2Id: string
  ): Promise<Match[]> {
    const result = await this.client.execute({
      sql: `
        SELECT * FROM matches
        WHERE (player1_id = ? AND player2_id = ?) OR (player1_id = ? AND player2_id = ?)
        ORDER BY started_at DESC
      `,
      args: [player1Id, player2Id, player2Id, player1Id],
    })

    return result.rows.map((row) => this.mapRow(row))
  }

  async findActiveMatches(): Promise<Match[]> {
    const result = await this.client.execute({
      sql: "SELECT * FROM matches WHERE status IN ('waiting', 'active')",
      args: [],
    })

    return result.rows.map((row) => this.mapRow(row))
  }

  async findActiveMatchByPlayerId(playerId: string): Promise<Match | null> {
    const result = await this.client.execute({
      sql: `
        SELECT * FROM matches
        WHERE (player1_id = ? OR player2_id = ?) AND status IN ('waiting', 'active')
        LIMIT 1
      `,
      args: [playerId, playerId],
    })

    return result.rows[0] ? this.mapRow(result.rows[0]) : null
  }

  async updateStatus(
    id: string,
    status: Match['status'],
    winnerId?: string | null
  ): Promise<Match | null> {
    const endedAt =
      status === 'finished' || status === 'cancelled'
        ? new Date().toISOString()
        : null

    if (winnerId !== undefined) {
      await this.client.execute({
        sql: 'UPDATE matches SET status = ?, winner_id = ?, ended_at = COALESCE(?, ended_at) WHERE id = ?',
        args: [status, winnerId, endedAt, id],
      })
    } else {
      await this.client.execute({
        sql: 'UPDATE matches SET status = ?, ended_at = COALESCE(?, ended_at) WHERE id = ?',
        args: [status, endedAt, id],
      })
    }

    return this.findById(id)
  }

  async findRecent(limit: number): Promise<Match[]> {
    const result = await this.client.execute({
      sql: "SELECT * FROM matches WHERE status = 'finished' ORDER BY ended_at DESC LIMIT ?",
      args: [limit],
    })

    return result.rows.map((row) => this.mapRow(row))
  }

  private mapRow(row: Record<string, unknown>): Match {
    return {
      id: row.id as string,
      player1Id: row.player1_id as string,
      player2Id: row.player2_id as string | null,
      player1InsectId: row.player1_insect_id as string,
      player2InsectId: row.player2_insect_id as string,
      winnerId: row.winner_id as string | null,
      startedAt: new Date(row.started_at as string),
      endedAt: row.ended_at ? new Date(row.ended_at as string) : null,
      totalTurns: row.total_turns as number,
      status: row.status as Match['status'],
    }
  }
}
