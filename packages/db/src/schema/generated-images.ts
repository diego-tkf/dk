import { integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { isoTimestamp } from './columns.ts'
import { imageGeneratorEnum } from './enums.ts'
import { prompts } from './prompts.ts'

export const generatedImages = pgTable('generated_images', {
	id: uuid('id').primaryKey().defaultRandom(),
	generator: imageGeneratorEnum('generator').notNull(),
	model_version: text('model_version').notNull(),
	parameters: jsonb('parameters').$type<Record<string, unknown>>().notNull().default({}),
	prompt_id: uuid('prompt_id')
		.notNull()
		.references(() => prompts.id, { onDelete: 'restrict' }),
	content_hash: text('content_hash').notNull(),
	content_url: text('content_url').notNull(),
	created_at: isoTimestamp('created_at').defaultNow().notNull(),
	schema_version: integer('schema_version').default(1).notNull(),
})

export type GeneratedImageRow = typeof generatedImages.$inferSelect
export type GeneratedImageInsert = typeof generatedImages.$inferInsert
