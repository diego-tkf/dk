# 0001 — Adopt flight-control's engineering conventions

- **Status:** Accepted
- **Date:** 2026-05-21

## Context

We're starting a new platform (`dk`) at Keenfolks. Another Keenfolks project,
[`kfoks-os-flight-control`](../../README.md), is mid-refactor in branches
`frontend-arch/01-foundation-scaffold` through `frontend-arch/11-…` and has
arrived at a mature set of engineering conventions (lint rules, folder
layouts, CI gates, ADR practice).

We could either invent our own conventions from scratch or lift theirs. The
team will work across both repos, so consistency reduces friction.

## Decision

Lift flight-control's engineering conventions, adapted to dk's stack picks:

- **Format + lint:** Biome for format + recommended lint, ESLint for type-aware
  rules and custom architectural rules. (Flight-control's exact split.)
- **Custom ESLint rules** in `eslint-rules/` registered under the `dk` plugin
  namespace. Lifted `method-naming-convention` rule wholesale.
- **`lint:isolation` script** in `scripts/src/lint/check-isolations.ts`
  enforcing cross-directory boundaries — adapted from flight-control's
  `check-service-isolations.ts`.
- **Feature-scoped frontend layout:** `features/<name>/{api,hooks,components,pages}`
  with api/ as pure async (no React), hooks/ wrapping TanStack Query, typed
  `query-keys.ts` per feature.
- **Atomic + semantic-tokens-only** for UI: shadcn primitives in
  `shared/components/ui/`, never edited; semantic Tailwind tokens
  (`bg-background`, never `bg-gray-*`); CVA for variants.
- **85% coverage threshold** enforced in CI from day one (per-package include
  list; expand as packages get tests).
- **Husky + lint-staged + check-secrets** pre-commit; commitlint on commit-msg;
  pre-push blocks direct push to `main`, runs typecheck + lint + test.
- **Conventional Commits** enforced via commitlint.
- **ADRs from week 1** (this file).
- **OpenSpec convention** for proposals/specs ([0007](0007-openspec-convention.md)).

Stack deviations from flight-control noted in [0002](0002-vendor-stack-picks.md)
and [0008](0008-puppeteer-templates-over-bannerbear.md).

## Consequences

**Positive**
- Engineers working across both repos move with the same muscle memory.
- Quality gates land before any feature code, not retrofitted under deadline.
- Decisions like "where does the API layer live?" are pre-answered.

**Negative**
- We inherit conventions even where flight-control's specific reasoning
  doesn't apply (e.g. flight-control's `require-dto-serialization` rule is
  about their HTTP response pattern; we don't have that yet).
- The first PR that wants to deviate has to justify it as an ADR.

## Related

- [0002 — Vendor stack picks](0002-vendor-stack-picks.md)
- [0007 — OpenSpec convention adopted](0007-openspec-convention.md)
- `openspec/config.yaml` — the consolidated conventions
- `eslint-rules/method-naming-convention.mjs` — lifted custom rule
