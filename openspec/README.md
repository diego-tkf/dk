# openspec/ — spec-driven development for dk

This directory holds project-level rules, proposals, and specs that drive how
features are designed and shipped.

## Layout

- **`config.yaml`** — context, stack, conventions, and rules-of-engagement.
  The single place to look for "what conventions does this repo follow?".
- **`specs/<spec-name>/spec.md`** — feature specs in WHEN/THEN/AND format.
  Each spec describes the behavior of one bounded thing (an API endpoint,
  a UI component, a worker, a compliance profile, ...).
- **`changes/`** — proposals for change. Created before any non-trivial PR.

## When to write a spec

- **New API endpoint** — spec the success / validation-failure / not-found /
  unauthorized scenarios before implementing.
- **New UI component** — spec the loaded / loading / empty / error states.
- **New external SDK integration** — spec the audit contract (verify the call
  goes through `withAudit` and emits start/complete events with the right
  correlation chain).
- **New compliance profile** — spec which constraints apply at which
  enforcement layer (prompt / image / text).

## When NOT to write a spec

- Pure refactors with no behavior change.
- Bugfixes that change behavior by ≤1 line.
- Anything covered by an existing spec — update it instead.

## Convention lifted from kfoks-os-flight-control

This structure mirrors the OpenSpec convention used in
`kfoks-os-flight-control`. Adapted for dk's stack (Supabase, Drizzle,
BullMQ self-hosted, Puppeteer templates) and architectural commitments
(engineering doc §3).
