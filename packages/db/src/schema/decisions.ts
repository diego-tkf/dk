import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { isoTimestamp } from './columns.ts'
import { decisionActionEnum, decisionSubjectEnum } from './enums.ts'

export const decisions = pgTable('decisions', {
	id: uuid('id').primaryKey().defaultRandom(),
	subject_type: decisionSubjectEnum('subject_type').notNull(),
	subject_id: text('subject_id').notNull(),
	action: decisionActionEnum('action').notNull(),
	actor_user_id: text('actor_user_id').notNull(),
	reason: text('reason'),
	created_at: isoTimestamp('created_at').defaultNow().notNull(),
	schema_version: integer('schema_version').default(1).notNull(),
})

export type DecisionRow = typeof decisions.$inferSelect
export type DecisionInsert = typeof decisions.$inferInsert
