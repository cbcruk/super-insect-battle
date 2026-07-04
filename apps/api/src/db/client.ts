import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema.js'

/**
 * Cloudflare D1은 요청마다 env 바인딩(c.env.DB)으로 접근하므로,
 * 모듈 레벨 싱글턴 대신 바인딩을 받아 drizzle 인스턴스를 생성한다.
 */
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema })
}
