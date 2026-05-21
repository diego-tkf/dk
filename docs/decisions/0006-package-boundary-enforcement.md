# 0006 — Package/service boundary enforcement via lint:isolation

- **Status:** Accepted
- **Date:** 2026-05-21

## Context

The engineering doc §3.5 names "platform as composition of packages" as a
non-negotiable. The 20/80 split (~20% tool-specific, ~80% shared) is what
makes tool #2 cheap to build. But code naturally grows toward whatever's
easiest — without enforcement, a service might import from another service
"just this once" for convenience, and the platform contract collapses.

ESLint can express "don't import X" via `no-restricted-imports`, but
cross-directory boundary rules (e.g. "packages can't import from apps") are
clunky in ESLint because of how relative path imports interact with module
resolution.

## Decision

A custom **`lint:isolation`** script at
`scripts/src/lint/check-isolations.ts` enforces cross-directory boundaries.
Runs as part of `pnpm lint` and on `pre-push`.

**Zones:**
- `apps/<name>` — Next.js apps (frontend)
- `packages/<name>` — shared `@dk/*` infrastructure
- `services/<name>` — tool-specific orchestration

**Forbidden crossings:**
- `packages/*` → `apps/*` (packages stay framework-agnostic)
- `packages/*` → `services/*` (packages are upstream of services)
- `services/X` → `services/Y` (services communicate via events / shared DB)
- `services/*` → `apps/*` (services don't know about presentation)
- `apps/*` → `services/*` (apps consume via events / API, not direct imports)

**Workspace imports** (`@dk/<name>`) always resolve to `packages/<name>` and
are allowed from any zone — packages are upstream of everything.

**How:** Regex-based import extraction from `.ts`/`.tsx` source. Resolves
relative imports and `@dk/*` aliases to absolute paths, then checks the
source/target zone pair against the rule table. Exit 0 on clean, 1 on any
violation. Adapted from flight-control's `check-service-isolations.ts`.

## Consequences

**Positive**
- The §3.5 commitment is mechanically enforced, not relying on PR-review
  vigilance.
- New cross-zone import in a PR shows up as a CI failure with a clear
  `file:line:column` + the §5.2 reference in the error message.
- Cheap to extend — adding a new boundary rule = one entry in
  `isBoundaryViolation()`.

**Negative**
- Regex-based (not AST). Edge cases (dynamic imports built from variables,
  unusual import syntax) may slip through. Acceptable for v1; can graduate
  to AST or `dependency-cruiser` later.
- Workspace imports always treated as targeting `packages/` — if we later
  publish a service as `@dk/<name>`, the script will misclassify it. Easy
  fix; flag for whoever proposes that.

## Related

- Engineering doc §3.5 (non-negotiable), §5.2 (package boundaries)
- `scripts/src/lint/check-isolations.ts` — the script itself
- `package.json#lint:isolation`, also chained into `lint` and `lint:strict`
- [0005 — Audit middleware enforcement](0005-audit-middleware-via-lint.md) — the other lint-enforced commitment
