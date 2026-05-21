import type { Actor, EntityRef } from '@dk/schemas'
import { index, integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { isoTimestamp } from './columns.ts'

/**
 * Append-only audit log. Every withAudit() call emits at least one event.
 * Indexes target the queries we know we'll run: by-correlation (workflow
 * timeline), by-causation (causal-chain traversal), by-type (per-event-type
 * filtering), by-time (range queries for retention / reports).
 *
 * `payload` is jsonb. Large content (images, prompts) lives in object storage
 * and is referenced via `content_refs` (content-addressed hashes) — see
 * engineering doc §7.6.
 */
export const events = pgTable(
	'events',
	{
		event_id: uuid('event_id').primaryKey().defaultRandom(),
		event_type: text('event_type').notNull(),
		actor: jsonb('actor').$type<Actor>().notNull(),
		timestamp: isoTimestamp('timestamp').defaultNow().notNull(),
		entity_refs: jsonb('entity_refs').$type<EntityRef[]>().notNull().default([]),
		causation_id: uuid('causation_id'),
		correlation_id: uuid('correlation_id').notNull(),
		payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
		schema_version: integer('schema_version').default(1).notNull(),
		content_refs: jsonb('content_refs').$type<string[]>().notNull().default([]),
		previous_event_hash: text('previous_event_hash'),
	},
	(table) => [
		index('events_correlation_id_idx').on(table.correlation_id),
		index('events_causation_id_idx').on(table.causation_id),
		index('events_event_type_idx').on(table.event_type),
		index('events_timestamp_idx').on(table.timestamp),
	],
)

export type EventRow = typeof events.$inferSelect
export type EventInsert = typeof events.$inferInsert
