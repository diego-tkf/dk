import { defineConfig } from 'vitest/config'

/**
 * Vitest config for dk. Coverage scoped to packages we've explicitly tested
 * (engineering doc §15.1: tests with Vitest). As each package adds tests,
 * add it to coverage.include — the 85% threshold then applies.
 */
export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['packages/**/*.test.ts', 'services/**/*.test.ts'],
		exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.turbo/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov', 'html'],
			reportsDirectory: './coverage',
			include: [
				// Add packages here as they get tests.
				'packages/audit/src/**/*.ts',
			],
			exclude: [
				'**/index.ts',
				'**/types.ts',
				'**/*.test.ts',
				'**/*.spec.ts',
				// DB-touching code is covered by integration tests, not unit:
				'packages/audit/src/emitters.ts',
			],
			thresholds: {
				statements: 85,
				branches: 85,
				functions: 85,
				lines: 85,
			},
		},
	},
})
