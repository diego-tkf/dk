/**
 * Conventional Commits enforcement via commitlint.
 * Default rules from @commitlint/config-conventional:
 *   - type required (feat|fix|chore|refactor|docs|test|build|ci|perf|style|revert)
 *   - subject case lower
 *   - max header length 100
 *
 * Customizations: increase subject max length for the longer dotted scopes
 * we'll use (e.g. "feat(carousel/composer): ...").
 */
export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'header-max-length': [2, 'always', 120],
		'subject-case': [0],
	},
}
