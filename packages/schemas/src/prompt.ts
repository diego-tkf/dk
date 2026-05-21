import { z } from 'zod'
import { ProfilePinSchema } from './common.ts'

export const PromptSchema = z.object({
	id: z.uuid(),
	source_texts_hash: z.string(), // hash of input texts used
	derived_prompt: z.string(),
	model: z.string(), // e.g. "claude-haiku-4-5"
	model_version: z.string(),
	parameters: z.record(z.string(), z.unknown()),
	memory_refs: z.array(z.uuid()),
	profile_refs: z.array(ProfilePinSchema),
	created_at: z.iso.datetime(),
	schema_version: z.number().int().positive().default(1),
})
export type Prompt = z.infer<typeof PromptSchema>
