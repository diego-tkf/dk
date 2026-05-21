import { timestamp } from 'drizzle-orm/pg-core'

/**
 * Timestamptz column that round-trips as ISO 8601 string (not Date object).
 *
 * Matches `z.iso.datetime()` in @dk/schemas — same on-the-wire shape,
 * same JSON-safe value, no Date<->string conversion in app code.
 */
export const isoTimestamp = (name: string) => timestamp(name, { withTimezone: true, mode: 'string' })
