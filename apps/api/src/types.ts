import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type * as schema from './db/schema.js'

export interface AppBindings {
  DB: D1Database
}

export interface AppVariables {
  db: DrizzleD1Database<typeof schema>
}

export interface AppEnv {
  Bindings: AppBindings
  Variables: AppVariables
}
