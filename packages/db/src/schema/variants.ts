import { integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { isoTimestamp } from './columns.ts'
import { deliverables } from './deliverables.ts'
import { complianceStatusEnum } from './enums.ts'

export const variants = pgTable('variants', {
	id: uuid('id').primaryKey().defaultRandom(),
	deliverable_id: uuid('deliverable_id')
		.notNull()
		.references(() => deliverables.id, { onDelete: 'cascade' }),
	prompt_id: uuid('prompt_id').notNull(),
	image_content_hash: text('image_content_hash').notNull(),
	composed_image_hashes: jsonb('composed_image_hashes')
		.$type<{ slide_a: string; slide_b: string; slide_c: string }>()
		.notNull(),
	compliance_status: complianceStatusEnum('compliance_status').notNull(),
	compliance_check_ids: jsonb('compliance_check_ids').$type<string[]>().notNull().default([]),
	created_at: isoTimestamp('created_at').defaultNow().notNull(),
	schema_version: integer('schema_version').default(1).notNull(),
})

export type VariantRow = typeof variants.$inferSelect
export type VariantInsert = typeof variants.$inferInsert
