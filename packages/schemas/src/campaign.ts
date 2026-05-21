import { z } from 'zod'
import { ProfilePinSchema } from './common.ts'
import { CampaignStatusSchema, CampaignTypeSchema } from './enums.ts'

export const CampaignSchema = z.object({
	id: z.uuid(),
	client_id: z.string(),
	brand_id: z.string(),
	market: z.string(), // ISO country code
	language: z.string(), // BCP-47
	campaign_type: CampaignTypeSchema,
	applicable_profile_pins: z.array(ProfilePinSchema),
	status: CampaignStatusSchema,
	created_by: z.string(), // FK to User.id
	created_at: z.iso.datetime(),
	schema_version: z.number().int().positive().default(1),
})
export type Campaign = z.infer<typeof CampaignSchema>
