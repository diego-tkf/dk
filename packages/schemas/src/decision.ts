import { z } from 'zod'

/**
 * A human approval/rejection decision on a variant or deliverable. Required
 * typed reasons on regulated flows (engineering doc §3.4).
 */
export const DecisionSchema = z.object({
	id: z.uuid(),
	subject_type: z.enum(['variant', 'deliverable', 'compliance_check', 'profile']),
	subject_id: z.string(),
	action: z.enum(['approve', 'reject', 'override']),
	actor_user_id: z.string(),
	reason: z.string().optional(), // required for regulated flows; enforced at the call site
	created_at: z.iso.datetime(),
	schema_version: z.number().int().positive().default(1),
})
export type Decision = z.infer<typeof DecisionSchema>
