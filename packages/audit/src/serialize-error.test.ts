import { describe, expect, it } from 'vitest'
import { serializeError } from './serialize-error.ts'

describe('serializeError', () => {
	it('serializes a plain Error with name, message, stack', () => {
		const result = serializeError(new Error('boom'))
		expect(result.name).toBe('Error')
		expect(result.message).toBe('boom')
		expect(result.stack).toBeTruthy()
	})

	it('preserves the cause chain', () => {
		const root = new Error('root cause')
		const wrapper = new Error('outer', { cause: root })
		const result = serializeError(wrapper)
		expect(result.message).toBe('outer')
		expect(result.cause?.message).toBe('root cause')
	})

	it('handles non-Error throwables by stringifying', () => {
		expect(serializeError('plain string')).toEqual({
			name: 'UnknownError',
			message: 'plain string',
		})
		expect(serializeError(42)).toEqual({
			name: 'UnknownError',
			message: '42',
		})
	})

	it('handles undefined and null', () => {
		expect(serializeError(undefined)).toEqual({ name: 'UnknownError', message: 'undefined' })
		expect(serializeError(null)).toEqual({ name: 'UnknownError', message: 'null' })
	})
})
