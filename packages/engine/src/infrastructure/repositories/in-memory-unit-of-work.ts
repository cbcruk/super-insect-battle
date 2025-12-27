import type { UnitOfWork } from '../../ports/repositories'
import { InMemoryPlayerRepository } from './in-memory-player-repository'
import { InMemoryOwnedInsectRepository } from './in-memory-owned-insect-repository'
import { InMemoryMatchRepository } from './in-memory-match-repository'
import { InMemoryMatchLogRepository } from './in-memory-match-log-repository'

export class InMemoryUnitOfWork implements UnitOfWork {
  readonly players: InMemoryPlayerRepository
  readonly ownedInsects: InMemoryOwnedInsectRepository
  readonly matches: InMemoryMatchRepository
  readonly matchLogs: InMemoryMatchLogRepository

  private inTransaction = false

  constructor() {
    this.players = new InMemoryPlayerRepository()
    this.ownedInsects = new InMemoryOwnedInsectRepository()
    this.matches = new InMemoryMatchRepository()
    this.matchLogs = new InMemoryMatchLogRepository()
  }

  async begin(): Promise<void> {
    if (this.inTransaction) {
      throw new Error('Transaction already in progress')
    }

    this.inTransaction = true
    // In-memory에서는 실제 트랜잭션 없음
    // 실제 DB에서는 여기서 트랜잭션 시작
  }

  async commit(): Promise<void> {
    if (!this.inTransaction) {
      throw new Error('No transaction in progress')
    }

    this.inTransaction = false
    // In-memory에서는 이미 변경사항이 적용됨
    // 실제 DB에서는 여기서 커밋
  }

  async rollback(): Promise<void> {
    if (!this.inTransaction) {
      throw new Error('No transaction in progress')
    }

    this.inTransaction = false
    // In-memory에서는 롤백 구현이 복잡함 (스냅샷 필요)
    // 현재는 단순히 상태만 리셋
    console.warn('InMemoryUnitOfWork: rollback is not fully implemented')
  }

  /** 모든 데이터 초기화 (테스트용) */
  clear(): void {
    this.players.clear()
    this.ownedInsects.clear()
    this.matches.clear()
    this.matchLogs.clear()
  }
}

/** 싱글톤 인스턴스 (개발/테스트용) */
let instance: InMemoryUnitOfWork | null = null

export function getInMemoryUnitOfWork(): InMemoryUnitOfWork {
  if (!instance) {
    instance = new InMemoryUnitOfWork()
  }

  return instance
}

export function resetInMemoryUnitOfWork(): void {
  if (instance) {
    instance.clear()
  }

  instance = null
}
