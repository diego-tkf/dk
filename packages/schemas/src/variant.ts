import { z } from 'zod'
import { ComplianceStatusSchema } from './enums.ts'

/**
 * One AI-generated option for a deliverable. A 3-slide carousel variant
 * stores hashes for each composed slide (slide A/B/C).
 */
export const VariantSchema = z.object({
	id: z.uuid(),
	deliverable_id: z.uuid(),
	prompt_id: z.uuid(),
	image_content_hash: z.string(),
	composed_image_hashes: z.object({
		slide_a: z.string(),
		slide_b: z.string(),
		slide_c: z.string(),
	}),
	compliance_status: ComplianceStatusSchema,
	compliance_check_ids: z.array(z.uuid()),
	created_at: z.iso.datetime(),
	schema_version: z.number().int().positive().default(1),
})
export type Variant = z.infer<typeof VariantSchema>
