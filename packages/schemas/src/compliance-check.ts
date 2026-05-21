import { z } from 'zod'
import { ConstraintCheckSchema } from './enums.ts'

/**
 * Result of evaluating one constraint from a compliance profile against a
 * specific image or text.
 */
export const ComplianceCheckSchema = z.object({
	id: z.uuid(),
	variant_id: z.uuid(),
	profile_id: z.string(),
	profile_version: z.number().int().nonnegative(),
	rule: z.string(),
	check_type: ConstraintCheckSchema,
	passed: z.boolean(),
	evidence: z.string().optional(), // model output, matched text, etc.
	overridden: z.boolean().default(false),
	overridden_by: z.string().optional(), // FK to User.id
	override_reason: z.string().optional(),
	overridden_at: z.iso.datetime().optional(),
	created_at: z.iso.datetime(),
	schema_version: z.number().int().positive().default(1),
})
export type ComplianceCheck = z.infer<typeof ComplianceCheckSchema>
