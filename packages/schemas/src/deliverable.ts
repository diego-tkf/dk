import { z } from 'zod'
import { DeliverableStatusSchema } from './enums.ts'

export const DeliverableSchema = z.object({
	id: z.uuid(),
	campaign_id: z.uuid(),
	status: DeliverableStatusSchema,
	variant_ids: z.array(z.uuid()),
	approved_variant_id: z.uuid().nullable(),
	decisions: z.array(z.uuid()), // FK to Decision/Event ids
	created_at: z.iso.datetime(),
	schema_version: z.number().int().positive().default(1),
})
export type Deliverable = z.infer<typeof DeliverableSchema>
