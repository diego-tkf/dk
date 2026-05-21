import { boolean, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { isoTimestamp } from './columns.ts'
import { roleNameEnum } from './enums.ts'

/**
 * Extension of Supabase auth.users — joined on id. role + capabilities live
 * here so we can evolve RBAC without touching Supabase-managed tables.
 *
 * A Postgres trigger (added in a later slice) creates a row here with
 * role='viewer' whenever a new auth.users entry appears, so every signed-in
 * user has a profile from day one.
 */
export const userProfiles = pgTable('user_profiles', {
	id: uuid('id').primaryKey(), // FK to auth.users.id (not enforced here; Supabase manages auth schema)
	email: text('email').notNull().unique(),
	display_name: text('display_name'),
	role: roleNameEnum('role').notNull().default('viewer'),
	is_active: boolean('is_active').notNull().default(true),
	created_at: isoTimestamp('created_at').defaultNow().notNull(),
	updated_at: isoTimestamp('updated_at').defaultNow().notNull(),
	schema_version: integer('schema_version').default(1).notNull(),
})

export type UserProfileRow = typeof userProfiles.$inferSelect
export type UserProfileInsert = typeof userProfiles.$inferInsert
