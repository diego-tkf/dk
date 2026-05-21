import { z } from 'zod'
import { ActorTypeSchema } from './enums.ts'

/**
 * Reference to another entity (used by events). Keeps audit-graph reconstruction
 * possible without embedding the related entity itself.
 */
export const EntityRefSchema = z.object({
	type: z.string(),
	id: z.string(),
})
export type EntityRef = z.infer<typeof EntityRefSchema>

/**
 * Who or what performed an action (used by events).
 */
export const ActorSchema = z.object({
	type: ActorTypeSchema,
	id: z.string(),
})
export type Actor = z.infer<typeof ActorSchema>

/**
 * Pin of a compliance profile to a specific version. Campaigns capture these
 * at evaluation time so future profile edits don't retroactively invalidate
 * past compliance checks (engineering doc §8.7).
 */
export const ProfilePinSchema = z.object({
	profile_id: z.string(),
	version: z.number().int().nonnegative(),
})
export type ProfilePin = z.infer<typeof ProfilePinSchema>
