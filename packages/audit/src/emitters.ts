import type { Db } from '@dk/db'
import { events } from '@dk/db'
import type { Event } from '@dk/schemas'
import type { AuditEmitter } from './types.ts'

/**
 * Production emitter — persists events to the events table.
 */
export function createDbEmitter(db: Db): AuditEmitter {
	return {
		async emit(event) {
			const [inserted] = await db.insert(events).values(event).returning()
			if (!inserted) throw new Error('Audit emit failed — insert returned no rows')
			// Drizzle row matches the Zod Event shape; cast is safe because both
			// derive from the same schema definitions in @dk/schemas.
			return inserted as unknown as Event
		},
	}
}

/**
 * Test emitter — keeps events in memory. Use in unit/integration tests
 * without a Postgres dependency.
 */
export function createInMemoryEmitter(): { emitter: AuditEmitter; events: Event[] } {
	const captured: Event[] = []
	const emitter: AuditEmitter = {
		async emit(event) {
			const stored: Event = {
				event_id: event.event_id ?? crypto.randomUUID(),
				event_type: event.event_type,
				actor: event.actor,
				timestamp: event.timestamp ?? new Date().toISOString(),
				entity_refs: event.entity_refs ?? [],
				causation_id: event.causation_id ?? null,
				correlation_id: event.correlation_id,
				payload: event.payload,
				schema_version: event.schema_version ?? 1,
				content_refs: event.content_refs ?? [],
				previous_event_hash: event.previous_event_hash ?? undefined,
			}
			captured.push(stored)
			return stored
		},
	}
	return { emitter, events: captured }
}
