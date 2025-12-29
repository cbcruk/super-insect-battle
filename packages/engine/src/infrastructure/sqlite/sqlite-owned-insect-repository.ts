import type { Client } from '@libsql/client'
import type { OwnedInsect } from '../../domain/entities'
import type { OwnedInsectRepository } from '../../ports/repositories'

export class SqliteOwnedInsectRepository implements OwnedInsectRepository {
  constructor(private client: Client) {}

  async findById(id: string): Promise<OwnedInsect | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM owned_insects WHERE id = ?',
      args: [id],
    })

    return result.rows[0] ? this.mapRow(result.rows[0]) : null
  }

  async findAll(): Promise<OwnedInsect[]> {
    const result = await this.client.execute('SELECT * FROM owned_insects')

    return result.rows.map((row) => this.mapRow(row))
  }

  async save(insect: OwnedInsect): Promise<OwnedInsect> {
    await this.client.execute({
      sql: `
        INSERT INTO owned_insects (id, player_id, species_id, nickname, level, exp, ivs, obtained_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          nickname = excluded.nickname,
          level = excluded.level,
          exp = excluded.exp,
          ivs = excluded.ivs
      `,
      args: [
        insect.id,
        insect.playerId,
        insect.speciesId,
        insect.nickname,
        insect.level,
        insect.exp,
        JSON.stringify(insect.ivs),
        insect.obtainedAt.toISOString(),
      ],
    })

    return insect
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.client.execute({
      sql: 'DELETE FROM owned_insects WHERE id = ?',
      args: [id],
    })

    return result.rowsAffected > 0
  }

  async findByPlayerId(playerId: string): Promise<OwnedInsect[]> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM owned_insects WHERE player_id = ?',
      args: [playerId],
    })

    return result.rows.map((row) => this.mapRow(row))
  }

  async findByPlayerIdAndSpeciesId(
    playerId: string,
    speciesId: string
  ): Promise<OwnedInsect[]> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM owned_insects WHERE player_id = ? AND species_id = ?',
      args: [playerId, speciesId],
    })

    return result.rows.map((row) => this.mapRow(row))
  }

  async updateLevel(
    id: string,
    level: number,
    exp: number
  ): Promise<OwnedInsect | null> {
    await this.client.execute({
      sql: 'UPDATE owned_insects SET level = ?, exp = ? WHERE id = ?',
      args: [level, exp, id],
    })

    return this.findById(id)
  }

  private mapRow(row: Record<string, unknown>): OwnedInsect {
    return {
      id: row.id as string,
      playerId: row.player_id as string,
      speciesId: row.species_id as string,
      nickname: row.nickname as string | null,
      level: row.level as number,
      exp: row.exp as number,
      ivs: JSON.parse(row.ivs as string),
      obtainedAt: new Date(row.obtained_at as string),
    }
  }
}
