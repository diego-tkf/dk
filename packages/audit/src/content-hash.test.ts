import { describe, expect, it } from 'vitest'
import { hashContent, summarizeResult } from './content-hash.ts'

describe('hashContent', () => {
	it('produces deterministic sha256 hex for the same input', () => {
		const a = hashContent({ foo: 'bar' })
		const b = hashContent({ foo: 'bar' })
		expect(a).toBe(b)
		expect(a).toMatch(/^[a-f0-9]{64}$/)
	})

	it('produces different hashes for different inputs', () => {
		const a = hashContent({ foo: 'bar' })
		const b = hashContent({ foo: 'baz' })
		expect(a).not.toBe(b)
	})

	it('hashes strings without re-stringifying', () => {
		const raw = hashContent('hello')
		const wrapped = hashContent({ value: 'hello' })
		expect(raw).not.toBe(wrapped)
	})
})

describe('summarizeResult', () => {
	it('returns primitives inline', () => {
		expect(summarizeResult('short')).toBe('short')
		expect(summarizeResult(42)).toBe(42)
		expect(summarizeResult(true)).toBe(true)
		expect(summarizeResult(null)).toBe(null)
	})

	it('returns small objects inline', () => {
		const obj = { id: '1', name: 'foo' }
		expect(summarizeResult(obj)).toBe(obj)
	})

	it('truncates large objects with hash + size descriptor', () => {
		const big = { huge: 'x'.repeat(20_000) }
		const summary = summarizeResult(big) as { _summary: string; hash: string; size: number }
		expect(summary._summary).toBe('truncated')
		expect(summary.hash).toMatch(/^[a-f0-9]{64}$/)
		expect(summary.size).toBeGreaterThan(10_000)
	})

	it('handles unserializable values gracefully', () => {
		const circular: Record<string, unknown> = {}
		circular.self = circular
		const summary = summarizeResult(circular) as { _summary: string }
		expect(summary._summary).toBe('unserializable')
	})
})
