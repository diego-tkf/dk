import { z } from 'zod'
import { ImageGeneratorSchema } from './enums.ts'

export const GeneratedImageSchema = z.object({
	id: z.uuid(),
	generator: ImageGeneratorSchema,
	model_version: z.string(),
	parameters: z.record(z.string(), z.unknown()),
	prompt_id: z.uuid(),
	content_hash: z.string(), // content-addressed storage key
	content_url: z.url(),
	created_at: z.iso.datetime(),
	schema_version: z.number().int().positive().default(1),
})
export type GeneratedImage = z.infer<typeof GeneratedImageSchema>
