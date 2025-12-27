import type { Player } from '../../domain/entities'
import type { PlayerRepository } from '../../ports/repositories'

export class InMemoryPlayerRepository implements PlayerRepository {
  private players: Map<string, Player> = new Map()

  async findById(id: string): Promise<Player | null> {
    return this.players.get(id) ?? null
  }

  async findAll(): Promise<Player[]> {
    return Array.from(this.players.values())
  }

  async save(player: Player): Promise<Player> {
    this.players.set(player.id, { ...player })

    return player
  }

  async delete(id: string): Promise<boolean> {
    return this.players.delete(id)
  }

  async findByVisibleId(visibleId: string): Promise<Player | null> {
    for (const player of this.players.values()) {
      if (player.visibleId === visibleId) {
        return player
      }
    }

    return null
  }

  async findByNickname(nickname: string): Promise<Player | null> {
    for (const player of this.players.values()) {
      if (player.nickname === nickname) {
        return player
      }
    }

    return null
  }

  async findTopByRating(limit: number): Promise<Player[]> {
    return Array.from(this.players.values())
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
  }

  async updateRating(id: string, newRating: number): Promise<Player | null> {
    const player = this.players.get(id)

    if (!player) return null

    const updated = { ...player, rating: newRating }

    this.players.set(id, updated)

    return updated
  }

  /** 테스트용: 모든 데이터 삭제 */
  clear(): void {
    this.players.clear()
  }
}
