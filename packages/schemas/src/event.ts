import { z } from 'zod'
import { ActorSchema, EntityRefSchema } from './common.ts'

/**
 * The audit log entry. Append-only. Every withAudit() call emits at least one
 * Event (start + complete or start + error). The full event catalog lives in
 * engineering doc §7.4.
 *
 * `causation_id` links to the event that directly caused this one.
 * `correlation_id` groups events belonging to the same logical workflow.
 *
 * `previous_event_hash` is reserved for v2 tamper-evidence (hash chain).
 */
export const EventSchema = z.object({
	event_id: z.uuid(),
	event_type: z.string(), // dotted: "user.chat.message", "image.generate", "llm.call.complete", ...
	actor: ActorSchema,
	timestamp: z.iso.datetime(), // server-assigned
	entity_refs: z.array(EntityRefSchema),
	causation_id: z.uuid().nullable(),
	correlation_id: z.uuid(),
	payload: z.record(z.string(), z.unknown()),
	schema_version: z.number().int().positive().default(1),
	content_refs: z.array(z.string()).default([]), // content-hash references (large payloads live in object storage)
	previous_event_hash: z.string().optional(),
})
export type Event = z.infer<typeof EventSchema>
