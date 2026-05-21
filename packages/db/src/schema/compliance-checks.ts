import { boolean, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { isoTimestamp } from './columns.ts'
import { constraintCheckEnum } from './enums.ts'
import { variants } from './variants.ts'

export const complianceChecks = pgTable('compliance_checks', {
	id: uuid('id').primaryKey().defaultRandom(),
	variant_id: uuid('variant_id')
		.notNull()
		.references(() => variants.id, { onDelete: 'cascade' }),
	profile_id: text('profile_id').notNull(),
	profile_version: integer('profile_version').notNull(),
	rule: text('rule').notNull(),
	check_type: constraintCheckEnum('check_type').notNull(),
	passed: boolean('passed').notNull(),
	evidence: text('evidence'),
	overridden: boolean('overridden').notNull().default(false),
	overridden_by: text('overridden_by'),
	override_reason: text('override_reason'),
	overridden_at: isoTimestamp('overridden_at'),
	created_at: isoTimestamp('created_at').defaultNow().notNull(),
	schema_version: integer('schema_version').default(1).notNull(),
})

export type ComplianceCheckRow = typeof complianceChecks.$inferSelect
export type ComplianceCheckInsert = typeof complianceChecks.$inferInsert
