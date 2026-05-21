import { integer, jsonb, pgTable, uuid } from 'drizzle-orm/pg-core'
import { campaigns } from './campaigns.ts'
import { isoTimestamp } from './columns.ts'
import { deliverableStatusEnum } from './enums.ts'

export const deliverables = pgTable('deliverables', {
	id: uuid('id').primaryKey().defaultRandom(),
	campaign_id: uuid('campaign_id')
		.notNull()
		.references(() => campaigns.id, { onDelete: 'cascade' }),
	status: deliverableStatusEnum('status').notNull(),
	variant_ids: jsonb('variant_ids').$type<string[]>().notNull().default([]),
	approved_variant_id: uuid('approved_variant_id'),
	decisions: jsonb('decisions').$type<string[]>().notNull().default([]),
	created_at: isoTimestamp('created_at').defaultNow().notNull(),
	schema_version: integer('schema_version').default(1).notNull(),
})

export type DeliverableRow = typeof deliverables.$inferSelect
export type DeliverableInsert = typeof deliverables.$inferInsert
