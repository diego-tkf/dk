import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import unusedImports from 'eslint-plugin-unused-imports'
import dkRules from './eslint-rules/index.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ──────────────────────────────────────────────────────────────────────────
// External SDK restrictions
//
// Per the engineering doc §3.2 (non-negotiable): every external service call
// goes through a @dk/* wrapper so the withAudit middleware can capture it.
// Direct imports of the SDKs below are forbidden in apps/ and services/, and
// in every package EXCEPT the wrapper that owns the SDK.
//
// The wrapper packages get a per-glob override that drops the relevant
// restriction. When you add a new external SDK, add it here AND add the
// wrapper override below.
// ──────────────────────────────────────────────────────────────────────────
const RESTRICTED_SDKS = [
	{
		name: 'openai',
		group: ['openai', 'openai/*'],
		message: 'Import from @dk/image-gen instead — direct openai imports bypass withAudit (engineering doc §3.2).',
	},
	{
		name: 'anthropic',
		group: ['@anthropic-ai/sdk', '@anthropic-ai/sdk/*'],
		message: 'Import from @dk/llm instead — direct @anthropic-ai/sdk imports bypass withAudit (engineering doc §3.2).',
	},
	{
		name: 'aws-sdk',
		group: ['@aws-sdk/*'],
		message: 'Import from @dk/storage instead — direct @aws-sdk/* imports bypass withAudit (engineering doc §3.2).',
	},
	{
		name: 'puppeteer',
		group: ['puppeteer', 'puppeteer-core', 'puppeteer/*'],
		message:
			'Import from @dk/template-engine instead — direct puppeteer imports bypass withAudit (engineering doc §3.2).',
	},
	{
		name: 'replicate',
		group: ['replicate'],
		message: 'Import from @dk/image-gen instead — direct replicate imports bypass withAudit (engineering doc §3.2).',
	},
	{
		name: 'sharp',
		group: ['sharp'],
		message: 'Import from @dk/template-engine instead — direct sharp imports bypass withAudit (engineering doc §3.2).',
	},
]

const restrictedExcept = (...allowedNames) =>
	RESTRICTED_SDKS.filter((r) => !allowedNames.includes(r.name)).map(({ group, message }) => ({ group, message }))

const allRestricted = RESTRICTED_SDKS.map(({ group, message }) => ({ group, message }))

// Flat config. Biome handles formatting + recommended lint.
// ESLint handles type-aware rules + custom architectural rules.
export default [
	// ── Ignore patterns ───────────────────────────────────────────────────────
	{
		ignores: [
			'node_modules/**',
			'dist/**',
			'build/**',
			'coverage/**',
			'out/**',
			'.next/**',
			'.turbo/**',
			'supabase/**',
			'**/*.js',
			'**/*.mjs',
			'infra/**',
			'**/src/infra/**',
			'**/*.mock.ts',
			'jest.*.ts',
			'__mocks__/**',
			'**/vite.config.ts',
			'**/vitest.config.ts',
			'scripts/**',
			'**/__tests__/**',
			'**/*.test.ts',
			'**/*.spec.ts',
		],
	},

	// ── TypeScript source files (default rules) ───────────────────────────────
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: 'module',
				project: './tsconfig.json',
				tsconfigRootDir: __dirname,
			},
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			'unused-imports': unusedImports,
			dk: dkRules,
		},
		rules: {
			...tsPlugin.configs['flat/recommended'].rules,
			...tsPlugin.configs['flat/recommended-type-checked-only'].rules,

			// Type imports
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ prefer: 'type-imports', fixStyle: 'inline-type-imports' },
			],

			// Any is not allowed
			'@typescript-eslint/no-explicit-any': 'error',

			// Handled by unused-imports plugin
			'@typescript-eslint/no-unused-vars': 'off',

			// Promises
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/no-misused-promises': 'error',
			'@typescript-eslint/await-thenable': 'error',

			// Warnings for unsafe patterns (gradually tighten over time)
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-unsafe-call': 'warn',
			'@typescript-eslint/no-unsafe-member-access': 'warn',
			'@typescript-eslint/no-unsafe-return': 'warn',
			'@typescript-eslint/no-non-null-assertion': 'warn',

			// Style
			'@typescript-eslint/no-unnecessary-template-expression': 'error',

			// Base JS rules
			'no-console': 'warn',
			eqeqeq: ['error', 'always'],

			// Unused imports / variables
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'error',
				{ vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
			],

			// Custom dk rules
			'dk/method-naming-convention': 'error',

			// External SDK enforcement (engineering doc §3.2)
			'no-restricted-imports': ['error', { patterns: allRestricted }],

			// Code complexity guardrails (matches flight-control thresholds)
			'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
			'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
		},
	},

	// ── Wrapper-package overrides ─────────────────────────────────────────────
	// Each wrapper is the ONE place the corresponding SDK may be imported.
	// All other packages and services must use the wrapper.
	{
		files: ['packages/llm/**/*.ts', 'packages/llm/**/*.tsx'],
		rules: {
			'no-restricted-imports': ['error', { patterns: restrictedExcept('anthropic') }],
		},
	},
	{
		files: ['packages/image-gen/**/*.ts', 'packages/image-gen/**/*.tsx'],
		rules: {
			'no-restricted-imports': ['error', { patterns: restrictedExcept('openai', 'replicate') }],
		},
	},
	{
		files: ['packages/template-engine/**/*.ts', 'packages/template-engine/**/*.tsx'],
		rules: {
			'no-restricted-imports': ['error', { patterns: restrictedExcept('puppeteer', 'sharp') }],
		},
	},
	{
		files: ['packages/storage/**/*.ts', 'packages/storage/**/*.tsx'],
		rules: {
			'no-restricted-imports': ['error', { patterns: restrictedExcept('aws-sdk') }],
		},
	},
]
