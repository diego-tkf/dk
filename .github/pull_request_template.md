## Related Ticket

<!--
  Link the Productive ticket this PR implements. Fill all three so the ticket
  is searchable by internal ID, by the human-visible number, and one click
  away via the URL. Skip this section for repo-internal PRs (infra,
  refactors, docs) — note "no ticket" below.

  - Productive Ticket ID    — internal database ID (the long number in the URL)
  - Productive Ticket Number — human-visible number (e.g. #17)
  - Productive Ticket URL   — full link to the ticket
-->

- **Productive Ticket ID**: <!-- e.g. 17218843 -->
- **Productive Ticket Number**: <!-- e.g. 17 -->
- **Productive Ticket URL**: <!-- e.g. https://app.productive.io/26360-keenfolks/projects/.../tasks/task/... -->

## Summary

<!-- 1–3 sentences. What does this PR do and why? -->

## Changes

-
-
-

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation / ADR
- [ ] Infrastructure / DevOps
- [ ] Deviation from engineering doc or an ADR (link the ADR or open a new one)

## Test Plan

- [ ] Unit tests added/updated
- [ ] Manual testing done
- [ ] Edge cases considered (loading, empty, error states for UI; not-found / unauthorized for APIs)

## Checklist

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes (Biome + ESLint + `lint:isolation`)
- [ ] `pnpm format:check` clean (run `pnpm format` if not)
- [ ] `pnpm test` passes; new code raised covered-package threshold ≥85%
- [ ] No new external SDK imported outside its `@dk/*` wrapper package (engineering doc §3.2)
- [ ] No cross-zone import added (`packages/*` → `apps/*`/`services/*`, services importing each other)
- [ ] Conventional Commits used (`feat:` / `fix:` / `chore:` / etc.)
- [ ] No `.env`, secrets, or credentials committed
- [ ] If behavior changed: openspec/ updated (new scenario or existing spec touched)
