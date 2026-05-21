# 0004 — Schemas-first with Zod as single source of truth

- **Status:** Accepted
- **Date:** 2026-05-21

## Context

The engineering doc §3.1 lists schemas-first as a non-negotiable architectural
commitment. Users input fluid data (chat, forms, file uploads); the system
needs typed data. Without a single source of truth, schema drift between
frontend forms, API contracts, DB rows, and audit-log payloads is inevitable.

## Decision

**`@dk/schemas` is the single source of truth.** Every entity is a Zod schema
defined once and consumed everywhere — forms, API validation, DB row parsing,
audit payloads.

- **Zod 4** syntax (`z.uuid()`, `z.email()`, `z.iso.datetime()` — top-level
  shortcuts).
- **One file per entity** (`campaign.ts`, `deliverable.ts`, …).
- **Source-first export** — `package.json#main` points at `src/index.ts`. No
  build step; Next.js transpiles via `transpilePackages` config.
- **Every persisted record has `schema_version`** for forward-compatible
  migrations.
- **`@dk/db` Drizzle tables MIRROR Zod schemas by hand** — accepted maintenance
  cost. Considered using `drizzle-zod` to auto-derive Zod from Drizzle, but
  the engineering doc puts Zod first; we mirror to Drizzle, not the other way.
- **Validation at every boundary:** form input → server action → API → pipeline
  step → DB write → DB read → API response.

## Consequences

**Positive**
- Types flow end-to-end from one definition.
- New entities require touching one file in `@dk/schemas` first, then mirror
  in `@dk/db` — order forces schema thinking before implementation thinking.
- Audit payloads can reference shared types (`Actor`, `EntityRef`) directly.

**Negative**
- Zod-to-Drizzle is hand-maintained → drift possible if reviewer misses it.
  Mitigation: tests assert round-trip parse equivalence (future slice).
- Zod 4 syntax differs from Zod 3 — anyone copying examples from older
  documentation may write deprecated code.
- ISO datetime as `string` (not `Date`) required `mode: 'string'` everywhere
  on Drizzle timestamp columns. Encapsulated in `isoTimestamp()` helper.

## Related

- Engineering doc §3.1, §6
- `packages/schemas/` — the schemas package
- `packages/db/src/schema/columns.ts` — `isoTimestamp()` helper resolving the
  Zod-string ↔ Drizzle-Date mismatch
