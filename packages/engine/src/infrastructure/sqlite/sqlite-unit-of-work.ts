import { createClient, type Client } from '@libsql/client'
import type { UnitOfWork } from '../../ports/repositories'
import { initializeSchema } from './schema'
import { SqlitePlayerRepository } from './sqlite-player-repository'
import { SqliteOwnedInsectRepository } from './sqlite-owned-insect-repository'
import { SqliteMatchRepository } from './sqlite-match-repository'
import { SqliteMatchLogRepository } from './sqlite-match-log-repository'

export interface SqliteConfig {
  url: string
  authToken?: string
}

export class SqliteUnitOfWork implements UnitOfWork {
  readonly players: SqlitePlayerRepository
  readonly ownedInsects: SqliteOwnedInsectRepository
  readonly matches: SqliteMatchRepository
  readonly matchLogs: SqliteMatchLogRepository

  private client: Client
  private inTransaction = false

  constructor(client: Client) {
    this.client = client
    this.players = new SqlitePlayerRepository(client)
    this.ownedInsects = new SqliteOwnedInsectRepository(client)
    this.matches = new SqliteMatchRepository(client)
    this.matchLogs = new SqliteMatchLogRepository(client)
  }

  async begin(): Promise<void> {
    if (this.inTransaction) {
      throw new Error('Transaction already in progress')
    }

    await this.client.execute('BEGIN')

    this.inTransaction = true
  }

  async commit(): Promise<void> {
    if (!this.inTransaction) {
      throw new Error('No transaction in progress')
    }

    await this.client.execute('COMMIT')

    this.inTransaction = false
  }

  async rollback(): Promise<void> {
    if (!this.inTransaction) {
      throw new Error('No transaction in progress')
    }

    await this.client.execute('ROLLBACK')

    this.inTransaction = false
  }

  async close(): Promise<void> {
    this.client.close()
  }
}

export async function createSqliteUnitOfWork(
  config: SqliteConfig
): Promise<SqliteUnitOfWork> {
  const client = createClient({
    url: config.url,
    authToken: config.authToken,
  })

  await initializeSchema(client)

  return new SqliteUnitOfWork(client)
}

export function createLocalSqliteUnitOfWork(
  dbPath: string = ':memory:'
): Promise<SqliteUnitOfWork> {
  return createSqliteUnitOfWork({
    url: dbPath === ':memory:' ? ':memory:' : `file:${dbPath}`,
  })
}
