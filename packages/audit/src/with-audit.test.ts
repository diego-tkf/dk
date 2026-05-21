import { describe, expect, it } from 'vitest'
import { createInMemoryEmitter } from './emitters.ts'
import type { WithAuditSpec } from './types.ts'
import { createAudited, emitEvent, withAudit } from './with-audit.ts'

function spec(overrides: Partial<WithAuditSpec> = {}): WithAuditSpec {
	return {
		type: 'image.generate',
		actor: { type: 'user', id: 'user-1' },
		refs: [{ type: 'deliverable', id: 'd-1' }],
		correlation_id: '00000000-0000-0000-0000-000000000001',
		...overrides,
	}
}

describe('withAudit', () => {
	it('emits start + complete events on success and returns the result', async () => {
		const { emitter, events } = createInMemoryEmitter()
		const result = await withAudit({ emitter }, spec(), async () => ({ url: 'https://x' }))

		expect(result).toEqual({ url: 'https://x' })
		expect(events).toHaveLength(2)
		expect(events[0]?.event_type).toBe('image.generate.start')
		expect(events[1]?.event_type).toBe('image.generate.complete')
	})

	it('chains causation: complete points at start', async () => {
		const { emitter, events } = createInMemoryEmitter()
		await withAudit({ emitter }, spec(), async () => 'ok')

		const start = events[0]
		const complete = events[1]
		expect(start?.causation_id).toBeNull()
		expect(complete?.causation_id).toBe(start?.event_id)
		expect(start?.correlation_id).toBe(complete?.correlation_id)
	})

	it('emits start + error events on throw and re-throws', async () => {
		const { emitter, events } = createInMemoryEmitter()
		const boom = new Error('boom')

		await expect(
			withAudit({ emitter }, spec(), async () => {
				throw boom
			}),
		).rejects.toThrow('boom')

		expect(events).toHaveLength(2)
		expect(events[0]?.event_type).toBe('image.generate.start')
		expect(events[1]?.event_type).toBe('image.generate.error')
		const payload = events[1]?.payload as { error: { message: string }; status: string }
		expect(payload.status).toBe('errored')
		expect(payload.error.message).toBe('boom')
	})

	it('propagates causation_id when caller provides one', async () => {
		const { emitter, events } = createInMemoryEmitter()
		await withAudit({ emitter }, spec({ causation_id: '00000000-0000-0000-0000-000000000099' }), async () => 'ok')
		expect(events[0]?.causation_id).toBe('00000000-0000-0000-0000-000000000099')
	})

	it('truncates large results in complete-event payload', async () => {
		const { emitter, events } = createInMemoryEmitter()
		await withAudit({ emitter }, spec(), async () => ({ huge: 'x'.repeat(20_000) }))

		const completePayload = events[1]?.payload as { result_summary: { _summary: string; hash: string } }
		expect(completePayload.result_summary._summary).toBe('truncated')
		expect(completePayload.result_summary.hash).toMatch(/^[a-f0-9]{64}$/)
	})
})

describe('createAudited', () => {
	it('returns a closure bound to the given options', async () => {
		const { emitter, events } = createInMemoryEmitter()
		const audited = createAudited({ emitter })

		const result = await audited(spec(), async () => 42)

		expect(result).toBe(42)
		expect(events).toHaveLength(2)
	})
})

describe('emitEvent', () => {
	it('delegates to emitter.emit', async () => {
		const { emitter, events } = createInMemoryEmitter()
		await emitEvent(
			{ emitter },
			{
				event_type: 'user.chat.message',
				actor: { type: 'user', id: 'u-1' },
				correlation_id: '00000000-0000-0000-0000-000000000002',
				payload: { text: 'hi' },
			},
		)
		expect(events).toHaveLength(1)
		expect(events[0]?.event_type).toBe('user.chat.message')
	})
})
