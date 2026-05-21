import { createHash } from 'node:crypto'

/**
 * Content-addressed hash for any payload. Used to keep large content
 * (generated images, prompts, uploaded docs) OUT of event payloads — the
 * event records the hash; the bytes live in object storage.
 *
 * This is what lets GDPR-style deletion work without breaking the audit
 * chain (engineering doc §7.6): delete the bytes by hash, the event metadata
 * stays intact.
 */
export function hashContent(content: unknown): string {
	const serialized = typeof content === 'string' ? content : JSON.stringify(content)
	return createHash('sha256').update(serialized).digest('hex')
}

/**
 * Best-effort summary of a function result for inclusion in a complete-event
 * payload. Small primitive/object results inline. Large or unserializable
 * results get replaced with a hash + size descriptor — full bytes are
 * assumed to be in object storage already.
 */
const INLINE_SIZE_LIMIT = 10_000

export function summarizeResult(result: unknown): unknown {
	if (result === null || result === undefined) return result
	if (typeof result === 'string' || typeof result === 'number' || typeof result === 'boolean') return result
	try {
		const serialized = JSON.stringify(result)
		if (serialized.length < INLINE_SIZE_LIMIT) return result
		return { _summary: 'truncated', hash: hashContent(result), size: serialized.length }
	} catch {
		return { _summary: 'unserializable' }
	}
}
