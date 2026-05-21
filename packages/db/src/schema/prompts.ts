import type { ProfilePin } from '@dk/schemas'
import { integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { isoTimestamp } from './columns.ts'

export const prompts = pgTable('prompts', {
	id: uuid('id').primaryKey().defaultRandom(),
	source_texts_hash: text('source_texts_hash').notNull(),
	derived_prompt: text('derived_prompt').notNull(),
	model: text('model').notNull(),
	model_version: text('model_version').notNull(),
	parameters: jsonb('parameters').$type<Record<string, unknown>>().notNull().default({}),
	memory_refs: jsonb('memory_refs').$type<string[]>().notNull().default([]),
	profile_refs: jsonb('profile_refs').$type<ProfilePin[]>().notNull().default([]),
	created_at: isoTimestamp('created_at').defaultNow().notNull(),
	schema_version: integer('schema_version').default(1).notNull(),
})

export type PromptRow = typeof prompts.$inferSelect
export type PromptInsert = typeof prompts.$inferInsert
