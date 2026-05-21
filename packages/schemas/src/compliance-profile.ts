import { z } from 'zod'
import { ConstraintCheckSchema, ConstraintSeveritySchema, ProfileStatusSchema } from './enums.ts'

/**
 * A single constraint inside a compliance profile. Constraints are evaluated
 * by the compliance engine at three layers (prompt-level, image-level,
 * text-level) per engineering doc §8.2.
 */
export const ComplianceConstraintSchema = z.object({
	rule: z.string(), // e.g. "must_not_show_product_packaging"
	check: ConstraintCheckSchema,
	severity: ConstraintSeveritySchema,
	value: z.string().optional(), // required text for text_presence rules
})
export type ComplianceConstraint = z.infer<typeof ComplianceConstraintSchema>

export const ComplianceProfileSchema = z.object({
	id: z.string(), // e.g. "merck-germany-vet-vaccine"
	version: z.number().int().nonnegative(),
	client_id: z.string().optional(),
	market: z.string().optional(),
	campaign_types: z.array(z.string()),
	jurisdiction_tags: z.array(z.string()),
	constraints: z.object({
		visual: z.array(ComplianceConstraintSchema),
		textual: z.array(ComplianceConstraintSchema),
		audience: z.array(ComplianceConstraintSchema),
	}),
	legal_source_documents: z.array(
		z.object({
			document_url: z.string(),
			document_hash: z.string(),
			description: z.string(),
		}),
	),
	status: ProfileStatusSchema,
	created_by: z.string(),
	approved_by: z.string().optional(),
	approved_at: z.iso.datetime().optional(),
	effective_date: z.iso.datetime(),
	schema_version: z.number().int().positive().default(1),
})
export type ComplianceProfile = z.infer<typeof ComplianceProfileSchema>
