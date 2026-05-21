# 0005 — Audit middleware (withAudit) enforced by lint

- **Status:** Accepted
- **Date:** 2026-05-21

## Context

The engineering doc §3.2 names auditability via middleware as a non-negotiable
architectural commitment. The reason: regulator-traceable causation chains
only work if EVERY external call is captured. Application code remembering to
log around every API call has a 90% capture rate, which is functionally 0%
— the missing 10% is exactly the one a regulator asks about.

Audit cannot be a feature anyone has to remember.

## Decision

**`@dk/audit` provides a `withAudit()` wrapper. Lint enforces its use.**

- `withAudit(options, spec, fn)` emits three events per call:
  `<type>.start`, `<type>.complete` (with result summary), `<type>.error`
  (with serialized error). All share `correlation_id`; complete/error point
  at start via `causation_id`.
- **Wrapper-per-SDK pattern.** External SDKs live in dedicated packages:
  `@dk/llm` wraps `@anthropic-ai/sdk`, `@dk/image-gen` wraps `openai`,
  `@dk/template-engine` wraps `puppeteer`, `@dk/storage` wraps Supabase
  storage / `@aws-sdk/*`. Each wrapper calls `withAudit()` internally.
- **Lint enforcement.** ESLint's `no-restricted-imports` rule blocks direct
  imports of these SDKs everywhere EXCEPT inside the wrapper package itself.
  Configured in `eslint.config.mjs` via per-glob overrides (e.g.
  `packages/llm/**` may import `@anthropic-ai/sdk`; nobody else can).
- **Two emitter implementations:**
  - `createDbEmitter(db)` — production, writes to the `events` table
  - `createInMemoryEmitter()` — tests, returns `{ emitter, events[] }`
- **Content addressing for large payloads.** `hashContent()` produces a
  sha256; large results are replaced with `{_summary: 'truncated', hash, size}`
  in the event payload. Bytes live in object storage (deletable for GDPR
  without breaking the audit chain).

## Consequences

**Positive**
- New external SDK = new wrapper package + new entry in `RESTRICTED_SDKS`.
  Discovered automatically by code review (no ungated import lands).
- 100% capture by construction — there's no path to call OpenAI that skips
  `withAudit`.
- In-memory emitter makes audit code testable without Postgres.

**Negative**
- Adding a new wrapper is a small ceremony (3-file PR minimum).
- The lint rule is opt-in per glob — adding a new wrapper package requires
  remembering to add the `restrictedExcept(...)` override.
- Direct SDK imports may be tempting in scripts/migrations; we exempt
  `scripts/**` and `infra/**` from the rule (limited blast radius).

## Related

- Engineering doc §3.2 (non-negotiable), §7 (event sourcing)
- `packages/audit/` — withAudit + emitters + content hashing
- `eslint.config.mjs` — `RESTRICTED_SDKS` array + wrapper-package overrides
- [0006 — Package/service boundary enforcement](0006-package-boundary-enforcement.md)
