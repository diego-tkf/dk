import { z } from 'zod'
import { RoleNameSchema } from './enums.ts'

/**
 * Capability set for each role (engineering doc §3.4). Server-side RBAC reads
 * from here; UI hints are advisory only.
 *
 * `capabilities` is a free-form list of dotted strings (e.g.
 * "carousel:approve", "compliance:override") to keep this extensible without
 * a schema migration every time a new capability is introduced.
 */
export const RoleDefinitionSchema = z.object({
	name: RoleNameSchema,
	description: z.string(),
	capabilities: z.array(z.string()),
	schema_version: z.number().int().positive().default(1),
})
export type RoleDefinition = z.infer<typeof RoleDefinitionSchema>
