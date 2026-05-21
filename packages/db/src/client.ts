import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.ts'

export interface DbClientOptions {
	/** Postgres connection string. Usually loaded from DATABASE_URL. */
	connectionString: string
	/** Max pool size. Defaults to 10 for serverless / 1 for migrations. */
	max?: number
	/** Idle timeout in seconds. */
	idleTimeout?: number
	/** Enable query logging (development only). */
	logger?: boolean
}

/**
 * Create a Drizzle client. Each consumer (web app, worker, migration runner)
 * instantiates its own — no shared singleton, no module-level connection.
 *
 * The returned client is typed against the @dk/db schema; cross-package
 * imports of table definitions go through the `./schema` export, not the
 * client.
 */
export function createDb(options: DbClientOptions) {
	const sql = postgres(options.connectionString, {
		max: options.max ?? 10,
		idle_timeout: options.idleTimeout ?? 20,
	})
	return drizzle(sql, { schema, logger: options.logger ?? false })
}

export type Db = ReturnType<typeof createDb>
