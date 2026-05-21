import type { SerializedError } from './types.ts'

/**
 * Convert any thrown value into a structured shape that fits inside an
 * event payload. Preserves the cause chain when present.
 */
export function serializeError(error: unknown): SerializedError {
	if (error instanceof Error) {
		const out: SerializedError = {
			name: error.name,
			message: error.message,
		}
		if (error.stack) out.stack = error.stack
		if (error.cause !== undefined) out.cause = serializeError(error.cause)
		return out
	}
	return { name: 'UnknownError', message: String(error) }
}
