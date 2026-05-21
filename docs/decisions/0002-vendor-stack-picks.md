# 0002 — Vendor stack picks

- **Status:** Accepted
- **Date:** 2026-05-21

## Context

The engineering doc left six Week-1 decisions open. They block real work:
without a DB host, the schemas don't persist; without a template engine, the
carousel pipeline can't render. We need to commit so packages can be built.

The pre-validation interviews with Daniel and the marketing specialist were
already done (per Diego), so the architecture is committed even though only
the carousel tool is being built first.

## Decision

| Layer | Pick | Notes |
|---|---|---|
| Package manager | pnpm 11 | Strict symlinks; matches modern monorepo defaults |
| Monorepo runner | Turborepo 2 | Built-in cache, simple task definitions |
| Language | TypeScript strict, Node 24+ | Per engineering doc §4.1 |
| Database | **Supabase** | Postgres + auth + storage bundled |
| ORM | Drizzle | Native pgvector support, type-friendly, no engine binary |
| Object storage | **Supabase Storage** | Bundled with the DB pick |
| Orchestration | **BullMQ + Redis (self-hosted)** | Diego: "no vendor lock-in on the workflow layer" |
| Template engine | **Puppeteer + HTML/CSS (self-built)** | Deviates from engineering doc §4.6 — see [0008](0008-puppeteer-templates-over-bannerbear.md) |
| Auth integration | **Supabase Auth (built-in)** | Skip NextAuth/Clerk — see [0003](0003-supabase-auth.md) |
| LLM | Claude (Anthropic API) | Per engineering doc §4.5 |
| Image gen | OpenAI `gpt-image-1` | Parity with Daniel's manual ChatGPT workflow |
| Vision (compliance) | Claude vision | Same provider as LLM, fewer integrations |
| Frontend framework | Next.js 15 (App Router) | React 19 |
| UI primitives | shadcn/ui + Tailwind v4 | Semantic tokens only |
| Format + lint | Biome + ESLint | Per [0001](0001-adopt-flight-control-conventions.md) |
| Tests | Vitest (all packages) | 85% coverage threshold per-included-file |
| Notifications | Microsoft Teams (later) | Notification surface only; not approvals |

## Consequences

**Positive**
- Bundled Supabase (DB + auth + storage + RLS for both) is fewer moving parts
  than DB + separate auth + separate storage.
- Self-hosted BullMQ + Redis avoids per-job vendor cost.
- Puppeteer templates avoid per-render vendor cost.

**Negative**
- Supabase coupling is real — migrating off later costs effort, especially
  for auth ([0003](0003-supabase-auth.md) deepens that coupling).
- Puppeteer is more upfront work than Bannerbear ([0008](0008-puppeteer-templates-over-bannerbear.md)).
- Self-hosted Redis means we own retries, dashboards, scaling.

## Related

- Engineering doc §4 (technology stack), §15.7 (pending decisions)
- [0003 — Use Supabase Auth](0003-supabase-auth.md)
- [0008 — Puppeteer templates instead of Bannerbear/Placid](0008-puppeteer-templates-over-bannerbear.md)
