import type { Client } from '@libsql/client'
import type { Player } from '../../domain/entities'
import type { PlayerRepository } from '../../ports/repositories'

export class SqlitePlayerRepository implements PlayerRepository {
  constructor(private client: Client) {}

  async findById(id: string): Promise<Player | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM players WHERE id = ?',
      args: [id],
    })

    return result.rows[0] ? this.mapRow(result.rows[0]) : null
  }

  async findAll(): Promise<Player[]> {
    const result = await this.client.execute('SELECT * FROM players')

    return result.rows.map((row) => this.mapRow(row))
  }

  async save(player: Player): Promise<Player> {
    await this.client.execute({
      sql: `
        INSERT INTO players (id, visible_id, nickname, rating, created_at, last_active_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          visible_id = excluded.visible_id,
          nickname = excluded.nickname,
          rating = excluded.rating,
          last_active_at = excluded.last_active_at
      `,
      args: [
        player.id,
        player.visibleId,
        player.nickname,
        player.rating,
        player.createdAt.toISOString(),
        player.lastActiveAt.toISOString(),
      ],
    })

    return player
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.client.execute({
      sql: 'DELETE FROM players WHERE id = ?',
      args: [id],
    })

    return result.rowsAffected > 0
  }

  async findByVisibleId(visibleId: string): Promise<Player | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM players WHERE visible_id = ?',
      args: [visibleId],
    })

    return result.rows[0] ? this.mapRow(result.rows[0]) : null
  }

  async findByNickname(nickname: string): Promise<Player | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM players WHERE nickname = ?',
      args: [nickname],
    })

    return result.rows[0] ? this.mapRow(result.rows[0]) : null
  }

  async findTopByRating(limit: number): Promise<Player[]> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM players ORDER BY rating DESC LIMIT ?',
      args: [limit],
    })

    return result.rows.map((row) => this.mapRow(row))
  }

  async updateRating(id: string, newRating: number): Promise<Player | null> {
    await this.client.execute({
      sql: 'UPDATE players SET rating = ? WHERE id = ?',
      args: [newRating, id],
    })

    return this.findById(id)
  }

  private mapRow(row: Record<string, unknown>): Player {
    return {
      id: row.id as string,
      visibleId: row.visible_id as string,
      nickname: row.nickname as string,
      rating: row.rating as number,
      createdAt: new Date(row.created_at as string),
      lastActiveAt: new Date(row.last_active_at as string),
    }
  }
}
