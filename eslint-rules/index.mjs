/**
 * dk custom ESLint plugin entry.
 *
 * Bundles dk-specific architectural rules. Imported by the root
 * eslint.config.mjs and registered under the `dk` namespace, so rules
 * appear in lint output as e.g. `dk/method-naming-convention`.
 *
 * Boundary enforcement (packages can't import from apps/services, services
 * can't import from each other) lives in scripts/src/lint/check-isolations.ts
 * instead of as a custom ESLint rule — filesystem-level checks are faster
 * and easier to reason about than per-file AST analysis for those rules.
 */

import methodNamingConvention from './method-naming-convention.mjs'

export default {
	meta: {
		name: 'dk-custom',
		version: '0.0.0',
	},
	rules: {
		'method-naming-convention': methodNamingConvention,
	},
}
