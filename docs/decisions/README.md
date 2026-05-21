# Architecture Decision Records (ADRs)

Short, dated records of architectural decisions made on `dk`. Each ADR captures
the *why* behind a choice so we don't relitigate it later (and so newcomers
can reconstruct intent from artifacts, not tribal knowledge).

## Format

```markdown
# NNNN — Title (verb-led, present tense)

- **Status:** Accepted | Superseded by NNNN | Deprecated
- **Date:** YYYY-MM-DD

## Context
What's the situation? What forces are at play?

## Decision
What did we choose? Be specific.

## Consequences
Positive and negative. Honest about trade-offs.

## Related
Links to other ADRs, doc sections, or the engineering doc.
```

## When to write one

- A non-trivial technology pick (DB, ORM, auth, AI provider)
- A deviation from the [engineering doc](../KFOS_Engineering_Documentation.md)
  (when there is one — currently only shared in conversation)
- A new architectural commitment that constrains future work
- A pattern adopted from another project (e.g. lifting from kfoks-os-flight-control)

## Index

- [0001 — Adopt flight-control's engineering conventions](0001-adopt-flight-control-conventions.md)
- [0002 — Vendor stack picks](0002-vendor-stack-picks.md)
- [0003 — Use Supabase Auth (not NextAuth or Clerk)](0003-supabase-auth.md)
- [0004 — Schemas-first with Zod as single source of truth](0004-schemas-first-zod.md)
- [0005 — Audit middleware (withAudit) enforced by lint](0005-audit-middleware-via-lint.md)
- [0006 — Package/service boundary enforcement via lint:isolation](0006-package-boundary-enforcement.md)
- [0007 — OpenSpec convention adopted (directory pattern, no CLI)](0007-openspec-convention.md)
- [0008 — Puppeteer templates instead of Bannerbear/Placid](0008-puppeteer-templates-over-bannerbear.md)
