import type { EventInsert } from '@dk/db'
import type { Event } from '@dk/schemas'
import { summarizeResult } from './content-hash.ts'
import { serializeError } from './serialize-error.ts'
import type { Audited, AuditOptions, WithAuditSpec } from './types.ts'

/**
 * Low-level emit. Most code uses withAudit() or an Audited closure instead;
 * this is for one-off events that aren't wrapping a call (auth.login,
 * user.chat.message, etc.).
 */
export async function emitEvent(options: AuditOptions, event: EventInsert): Promise<Event> {
	return options.emitter.emit(event)
}

/**
 * Wrap a function so that every invocation emits a `${type}.start` event
 * before, then either `${type}.complete` (with a result summary) or
 * `${type}.error` (with a serialized error) after. All three events share
 * the same correlation_id; complete/error point at start via causation_id.
 *
 * The wrapped function's return value passes through unchanged; errors
 * re-throw after being logged.
 *
 * This is the single most important rule of the entire infrastructure
 * (engineering doc §3.2): every external call goes through here.
 */
export async function withAudit<T>(options: AuditOptions, spec: WithAuditSpec, fn: () => Promise<T>): Promise<T> {
	const startEventId = crypto.randomUUID()
	const baseEvent = {
		actor: spec.actor,
		entity_refs: spec.refs,
		correlation_id: spec.correlation_id,
		schema_version: 1,
		content_refs: [] as string[],
	}

	await options.emitter.emit({
		event_id: startEventId,
		event_type: `${spec.type}.start`,
		timestamp: new Date().toISOString(),
		causation_id: spec.causation_id ?? null,
		payload: { metadata: spec.metadata ?? {}, status: 'started' },
		...baseEvent,
	})

	try {
		const result = await fn()
		await options.emitter.emit({
			event_id: crypto.randomUUID(),
			event_type: `${spec.type}.complete`,
			timestamp: new Date().toISOString(),
			causation_id: startEventId,
			payload: {
				metadata: spec.metadata ?? {},
				status: 'completed',
				result_summary: summarizeResult(result),
			},
			...baseEvent,
		})
		return result
	} catch (error) {
		await options.emitter.emit({
			event_id: crypto.randomUUID(),
			event_type: `${spec.type}.error`,
			timestamp: new Date().toISOString(),
			causation_id: startEventId,
			payload: {
				metadata: spec.metadata ?? {},
				status: 'errored',
				error: serializeError(error),
			},
			...baseEvent,
		})
		throw error
	}
}

/**
 * Create a curried wrapper bound to a specific AuditOptions. Most callers
 * import this once at boot time and pass the resulting function around
 * (instead of threading AuditOptions through every call).
 */
export function createAudited(options: AuditOptions): Audited {
	return <T>(spec: WithAuditSpec, fn: () => Promise<T>) => withAudit(options, spec, fn)
}
