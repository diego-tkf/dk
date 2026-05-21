import type { ProfilePin } from '@dk/schemas'
import { integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { isoTimestamp } from './columns.ts'
import { campaignStatusEnum, campaignTypeEnum } from './enums.ts'

export const campaigns = pgTable('campaigns', {
	id: uuid('id').primaryKey().defaultRandom(),
	client_id: text('client_id').notNull(),
	brand_id: text('brand_id').notNull(),
	market: text('market').notNull(),
	language: text('language').notNull(),
	campaign_type: campaignTypeEnum('campaign_type').notNull(),
	applicable_profile_pins: jsonb('applicable_profile_pins').$type<ProfilePin[]>().notNull(),
	status: campaignStatusEnum('status').notNull(),
	created_by: text('created_by').notNull(),
	created_at: isoTimestamp('created_at').defaultNow().notNull(),
	schema_version: integer('schema_version').default(1).notNull(),
})

export type CampaignRow = typeof campaigns.$inferSelect
export type CampaignInsert = typeof campaigns.$inferInsert
