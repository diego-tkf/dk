import type { EventInsert } from '@dk/db'
import type { Actor, EntityRef, Event } from '@dk/schemas'

/**
 * Input to withAudit() — describes the external call being wrapped.
 */
export interface WithAuditSpec {
	/**
	 * Dotted event type prefix (e.g. "image.generate", "llm.call"). The wrapper
	 * emits `${type}.start`, `${type}.complete`, `${type}.error` events.
	 *
	 * Must come from the registered event catalog (engineering doc §7.4).
	 */
	type: string
	actor: Actor
	refs: EntityRef[]
	correlation_id: string
	causation_id?: string
	/** Free-form metadata attached to all three emitted events. */
	metadata?: Record<string, unknown>
}

/**
 * Persistence backend for events. Implementations: createDbEmitter (prod),
 * createInMemoryEmitter (tests).
 */
export interface AuditEmitter {
	emit(event: EventInsert): Promise<Event>
}

export interface AuditOptions {
	emitter: AuditEmitter
}

/**
 * The curried wrapper returned by createAudited(). Each call emits a
 * start/complete/error event triple bound to a single correlation chain.
 */
export type Audited = <T>(spec: WithAuditSpec, fn: () => Promise<T>) => Promise<T>

export interface SerializedError {
	name: string
	message: string
	stack?: string
	cause?: SerializedError
}
