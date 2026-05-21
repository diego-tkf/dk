/**
 * lint:isolation — static-analysis CI gate for package/service boundary discipline
 * (engineering doc §3.5 + §5.2).
 *
 * The rules enforced here can't be expressed cleanly as per-file ESLint rules
 * because they're cross-file: "does this relative import cross a boundary it
 * shouldn't?" We do regex-based extraction of import paths, resolve them
 * relative to the importing file, and check the source/target zone pair.
 *
 * Zones:
 *   - apps/<name>      — Next.js app, frontend code
 *   - packages/<name>  — shared @dk/* infrastructure
 *   - services/<name>  — tool-specific orchestration (carousel, newsletter, …)
 *
 * Forbidden crossings:
 *   - packages/* → apps/*      (packages must stay framework-agnostic)
 *   - packages/* → services/*  (packages are upstream of services)
 *   - services/X → services/Y  (services communicate via events / shared DB, never direct imports)
 *   - services/* → apps/*      (services don't know about presentation)
 *   - apps/*    → services/*   (apps consume services via events / API, not via direct imports)
 *
 * Workspace imports (`@dk/<name>`) are always treated as targeting
 * packages/<name> and are allowed from any zone — packages are upstream of
 * everything.
 *
 * Adapted from flight-control's scripts/src/lint/check-service-isolations.ts.
 * Run via `pnpm lint:isolation`. Exits 0 on clean, 1 on any violation.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '../../../')

type Zone =
	| { kind: 'app'; name: string }
	| { kind: 'package'; name: string }
	| { kind: 'service'; name: string }
	| { kind: 'other' }

interface Violation {
	file: string
	line: number
	column: number
	importPath: string
	message: string
}

const SOURCE_ROOTS = ['apps', 'packages', 'services'] as const

function zoneOf(absPath: string): Zone {
	const rel = path.relative(ROOT, absPath)
	if (rel.startsWith('..') || path.isAbsolute(rel)) return { kind: 'other' }
	const parts = rel.split(path.sep)
	const root = parts[0]
	const name = parts[1]
	if (!name) return { kind: 'other' }
	if (root === 'apps') return { kind: 'app', name }
	if (root === 'packages') return { kind: 'package', name }
	if (root === 'services') return { kind: 'service', name }
	return { kind: 'other' }
}

function isBoundaryViolation(from: Zone, to: Zone): string | null {
	if (from.kind === 'other' || to.kind === 'other') return null
	// Same zone instance is always fine
	if (from.kind === to.kind && from.name === to.name) return null

	if (from.kind === 'package' && to.kind === 'app') {
		return `package "${from.name}" must not import from app "${to.name}" — packages stay framework-agnostic (§5.2).`
	}
	if (from.kind === 'package' && to.kind === 'service') {
		return `package "${from.name}" must not import from service "${to.name}" — packages are upstream of services (§5.2).`
	}
	if (from.kind === 'service' && to.kind === 'service' && from.name !== to.name) {
		return `service "${from.name}" must not import from service "${to.name}" — services communicate via events / shared DB, never direct imports (§5.2).`
	}
	if (from.kind === 'service' && to.kind === 'app') {
		return `service "${from.name}" must not import from app "${to.name}" — services don't know about presentation.`
	}
	if (from.kind === 'app' && to.kind === 'service') {
		return `app "${from.name}" must not import from service "${to.name}" — consume services via events or API, not direct imports.`
	}
	return null
}

function findTsFiles(dir: string): string[] {
	const out: string[] = []
	if (!existsSync(dir)) return out
	let entries: string[]
	try {
		entries = readdirSync(dir)
	} catch {
		return out
	}
	for (const entry of entries) {
		if (entry === '__tests__' || entry === 'node_modules' || entry === 'dist' || entry === '.next') continue
		if (entry.endsWith('.test.ts') || entry.endsWith('.spec.ts')) continue
		const full = path.join(dir, entry)
		const st = statSync(full)
		if (st.isDirectory()) out.push(...findTsFiles(full))
		else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) out.push(full)
	}
	return out
}

// Match: import ... from '<path>'  |  import('<path>')  |  require('<path>')
const IMPORT_REGEX = /(?:from|import|require)\s*\(?\s*['"`]([^'"`]+)['"`]/g

interface ExtractedImport {
	path: string
	column: number
}

function extractImports(line: string): ExtractedImport[] {
	const out: ExtractedImport[] = []
	for (const match of line.matchAll(IMPORT_REGEX)) {
		const importPath = match[1]
		if (!importPath) continue
		out.push({ path: importPath, column: match.index + 1 })
	}
	return out
}

function resolveImport(fromFile: string, importPath: string): string | null {
	// Workspace imports (@dk/<name>) always resolve to packages/<name>
	if (importPath.startsWith('@dk/')) {
		const pkgName = importPath.slice('@dk/'.length).split('/')[0]
		if (!pkgName) return null
		return path.join(ROOT, 'packages', pkgName)
	}
	// Relative imports
	if (importPath.startsWith('.')) {
		return path.resolve(path.dirname(fromFile), importPath)
	}
	// Bare specifiers (external packages) — not our concern here
	return null
}

function scanFile(file: string): Violation[] {
	const violations: Violation[] = []
	const fromZone = zoneOf(file)
	if (fromZone.kind === 'other') return violations

	const content = readFileSync(file, 'utf8')
	const lines = content.split('\n')

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i] ?? ''
		for (const { path: importPath, column } of extractImports(line)) {
			const resolved = resolveImport(file, importPath)
			if (!resolved) continue
			const toZone = zoneOf(resolved)
			const message = isBoundaryViolation(fromZone, toZone)
			if (message) {
				violations.push({
					file: path.relative(ROOT, file),
					line: i + 1,
					column,
					importPath,
					message,
				})
			}
		}
	}
	return violations
}

function main(): void {
	const allFiles: string[] = []
	for (const root of SOURCE_ROOTS) {
		allFiles.push(...findTsFiles(path.join(ROOT, root)))
	}

	const violations: Violation[] = []
	for (const file of allFiles) {
		violations.push(...scanFile(file))
	}

	if (violations.length === 0) {
		console.log(`[lint:isolation] ✓ clean — ${allFiles.length} file(s) checked`)
		process.exit(0)
	}

	console.error(`\n[lint:isolation] ✗ ${violations.length} boundary violation(s):\n`)
	for (const v of violations) {
		console.error(`  ${v.file}:${v.line}:${v.column}`)
		console.error(`    import: ${v.importPath}`)
		console.error(`    ${v.message}`)
		console.error('')
	}
	console.error('Package/service boundaries enforce §5.2 of the engineering doc.')
	process.exit(1)
}

main()
