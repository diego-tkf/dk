import { z } from 'zod'
import { RoleNameSchema } from './enums.ts'

/**
 * User profile. Backed by Supabase auth.users (referenced via id = auth.uid).
 * The role lives here and not in auth.users so we can extend without touching
 * Supabase-managed tables.
 */
export const UserProfileSchema = z.object({
	id: z.uuid(), // matches auth.users.id
	email: z.email(),
	display_name: z.string().optional(),
	role: RoleNameSchema.default('viewer'),
	is_active: z.boolean().default(true),
	created_at: z.iso.datetime(),
	updated_at: z.iso.datetime(),
	schema_version: z.number().int().positive().default(1),
})
export type UserProfile = z.infer<typeof UserProfileSchema>
