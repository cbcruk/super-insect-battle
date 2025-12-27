import type { OwnedInsect } from '../../domain/entities'
import type { OwnedInsectRepository } from '../../ports/repositories'

export class InMemoryOwnedInsectRepository implements OwnedInsectRepository {
  private insects: Map<string, OwnedInsect> = new Map()

  async findById(id: string): Promise<OwnedInsect | null> {
    return this.insects.get(id) ?? null
  }

  async findAll(): Promise<OwnedInsect[]> {
    return Array.from(this.insects.values())
  }

  async save(insect: OwnedInsect): Promise<OwnedInsect> {
    this.insects.set(insect.id, { ...insect })
    return insect
  }

  async delete(id: string): Promise<boolean> {
    return this.insects.delete(id)
  }

  async findByPlayerId(playerId: string): Promise<OwnedInsect[]> {
    return Array.from(this.insects.values()).filter(
      (insect) => insect.playerId === playerId
    )
  }

  async findByPlayerIdAndSpeciesId(
    playerId: string,
    speciesId: string
  ): Promise<OwnedInsect[]> {
    return Array.from(this.insects.values()).filter(
      (insect) => insect.playerId === playerId && insect.speciesId === speciesId
    )
  }

  async updateLevel(
    id: string,
    level: number,
    exp: number
  ): Promise<OwnedInsect | null> {
    const insect = this.insects.get(id)

    if (!insect) return null

    const updated = { ...insect, level, exp }

    this.insects.set(id, updated)

    return updated
  }

  /** 테스트용: 모든 데이터 삭제 */
  clear(): void {
    this.insects.clear()
  }
}
