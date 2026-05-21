import type { ComplianceConstraint } from '@dk/schemas'
import { integer, jsonb, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { isoTimestamp } from './columns.ts'
import { profileStatusEnum } from './enums.ts'

/**
 * Composite primary key on (id, version) — every edit creates a new row,
 * older versions remain immutable for audit (engineering doc §8.7).
 */
export const complianceProfiles = pgTable(
	'compliance_profiles',
	{
		id: text('id').notNull(),
		version: integer('version').notNull(),
		client_id: text('client_id'),
		market: text('market'),
		campaign_types: jsonb('campaign_types').$type<string[]>().notNull().default([]),
		jurisdiction_tags: jsonb('jurisdiction_tags').$type<string[]>().notNull().default([]),
		constraints: jsonb('constraints')
			.$type<{
				visual: ComplianceConstraint[]
				textual: ComplianceConstraint[]
				audience: ComplianceConstraint[]
			}>()
			.notNull(),
		legal_source_documents: jsonb('legal_source_documents')
			.$type<Array<{ document_url: string; document_hash: string; description: string }>>()
			.notNull()
			.default([]),
		status: profileStatusEnum('status').notNull(),
		created_by: text('created_by').notNull(),
		approved_by: text('approved_by'),
		approved_at: isoTimestamp('approved_at'),
		effective_date: isoTimestamp('effective_date').notNull(),
		schema_version: integer('schema_version').default(1).notNull(),
	},
	(table) => [primaryKey({ columns: [table.id, table.version] })],
)

export type ComplianceProfileRow = typeof complianceProfiles.$inferSelect
export type ComplianceProfileInsert = typeof complianceProfiles.$inferInsert
