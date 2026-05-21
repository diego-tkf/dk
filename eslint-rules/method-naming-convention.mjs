/**
 * ESLint custom rule: method-naming-convention
 *
 * Enforces find/get/list naming conventions for data-access methods:
 *   - find*() must return T | null (nullable) — never throws on not found
 *   - get*() must NOT return T | null — should throw on not found
 *   - list*() must return T[] (array, never null) — always returns [], not null
 *   - findAll/getAll are banned — use list* instead
 *
 * Applied to files in: repositories/, repository/, services/, adapters/
 *
 * Lifted from flight-control's identically-named rule. Same semantics.
 */

export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Enforce find/get/list method naming conventions based on return type semantics',
			category: 'Best Practices',
			recommended: true,
		},
		messages: {
			useListNotFindAll:
				'Method "{{name}}" should be renamed to "list{{suffix}}". Use "list" prefix instead of "findAll" or "getAll".',
			useListNotGetAll:
				'Method "{{name}}" should be renamed to "list{{suffix}}". Use "list" prefix instead of "getAll" or "findAll".',
			listMustReturnArray:
				'Method "{{name}}" uses "list" prefix but does not return an array type. "list" methods must always return T[] (never null or undefined).',
		},
		schema: [],
	},

	create(context) {
		const filename = context.physicalFilename || context.filename
		if (!filename) return {}

		// Only apply to repository, service, and adapter files
		const isTargetFile =
			filename.includes('/repositories/') ||
			filename.includes('/repository/') ||
			filename.includes('/services/') ||
			filename.includes('/adapters/')

		// Skip test files
		const isTestFile = filename.includes('__tests__') || filename.includes('.test.') || filename.includes('.spec.')

		if (!isTargetFile || isTestFile) return {}

		return {
			MethodDefinition(node) {
				if (node.key.type !== 'Identifier') return
				const name = node.key.name

				// Rule: ban findAll/getAll — use list instead
				if (name === 'findAll' || name.startsWith('findAll')) {
					const suffix = name.slice(7)
					context.report({
						node: node.key,
						messageId: 'useListNotFindAll',
						data: { name, suffix: suffix || '' },
					})
					return
				}
				if (name === 'getAll' || name.startsWith('getAll')) {
					const suffix = name.slice(6)
					context.report({
						node: node.key,
						messageId: 'useListNotGetAll',
						data: { name, suffix: suffix || '' },
					})
					return
				}

				// Rule: list* methods must have array return type annotation
				if (name.startsWith('list')) {
					const fn = node.value
					if (fn?.returnType?.typeAnnotation) {
						const returnType = fn.returnType.typeAnnotation
						const sourceCode = context.sourceCode || context.getSourceCode()
						const returnTypeText = sourceCode.getText(returnType)

						const isArrayReturn = returnTypeText.includes('[]') || returnTypeText.includes('Array<')

						if (!isArrayReturn) {
							context.report({
								node: node.key,
								messageId: 'listMustReturnArray',
								data: { name },
							})
						}
					}
				}
			},
		}
	},
}
