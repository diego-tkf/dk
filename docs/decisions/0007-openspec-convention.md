# 0007 — OpenSpec convention adopted (directory pattern, no CLI)

- **Status:** Accepted
- **Date:** 2026-05-21

## Context

[`kfoks-os-flight-control`](../../README.md) has a `/openspec/` directory
that holds a `config.yaml` with project-level conventions plus per-feature
specs in `specs/<spec-name>/spec.md`. Diego specifically asked to adopt this
convention for `dk` so engineers (human and AI) working across both repos see
the same spec-driven shape.

The `schema: spec-driven` marker at the top of `config.yaml` references the
public [OpenSpec CLI](https://github.com/Fission-AI/OpenSpec). Flight-control
does NOT install the CLI as a dep — they use the directory pattern alone.

## Decision

Adopt OpenSpec as a **directory + file convention**. No CLI installed.

**Layout:**
```
openspec/
├── config.yaml      — project context, stack, conventions, rules
├── specs/           — per-feature specs (WHEN/THEN/AND format)
└── changes/         — proposals (before non-trivial PRs)
```

**`config.yaml` contains:**
- Project context + stack summary
- The architectural non-negotiables from engineering doc §3
- Backend and frontend conventions (single-source location)
- Commit convention + pre-PR checklist
- Rules for proposals, specs, design notes, and tasks

**When to write a spec** (mirroring flight-control's policy):
- New API endpoint → spec the success / validation-failure / not-found /
  unauthorized scenarios
- New UI component → spec the loaded / loading / empty / error states
- New external SDK integration → spec the audit contract (event sequence)
- New compliance profile → spec which constraints apply at which enforcement
  layer

**When NOT to write a spec:** pure refactors, ≤1-line bugfixes, anything
covered by an existing spec (update it instead).

## Consequences

**Positive**
- AI coding agents (Claude, Cursor) reading `openspec/config.yaml` get the
  full convention set in one document — better grounded code, fewer "I didn't
  know we did X here" moments.
- Spec-before-code discipline catches edge cases (unauthorized, empty state,
  validation failure) earlier than code-first does.
- No extra tooling to install or maintain.

**Negative**
- Specs can rot without automated validation. The CLI would catch dead refs;
  we won't. Mitigation: periodic manual audit during planning sessions.
- Two conventions docs (this file and `openspec/config.yaml`) need to stay in
  sync. `config.yaml` is the operational doc; ADRs explain the WHY.

## Related

- `openspec/config.yaml` — the live conventions
- `openspec/README.md` — usage notes
- Reference: kfoks-os-flight-control/openspec/
- [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) (the CLI we
  don't install but could add later)
