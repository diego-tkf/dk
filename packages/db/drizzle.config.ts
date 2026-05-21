import { defineConfig } from 'drizzle-kit'

/**
 * drizzle-kit config. Migrations are emitted to infra/migrations/ (engineering
 * doc §15.3 — migrations are an infra concern, not a per-package concern).
 *
 * DATABASE_URL is read from the environment at generate/migrate time. For
 * local dev this points at a docker-compose Postgres or a Supabase project
 * connection string.
 */
export default defineConfig({
	schema: './src/schema/index.ts',
	out: '../../infra/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/dk',
	},
	verbose: true,
	strict: true,
})
