# 0003 — Use Supabase Auth (not NextAuth or Clerk)

- **Status:** Accepted
- **Date:** 2026-05-21

## Context

The engineering doc §4.7 suggested NextAuth or Clerk as the integration layer
between the app and Microsoft Entra (Azure AD) for SSO. With the DB pick
landing on Supabase ([0002](0002-vendor-stack-picks.md)), we have Supabase
Auth available as a built-in option.

Daniel pushed back on the heaviness of the [`kfoks-os-flight-control` auth
implementation](../../README.md) (raw OIDC + custom JWT + JWKS verification +
SST secrets), which was appropriate for AWS Lambda but overkill for a
Next.js + Supabase shop.

A separate constraint: we want email/password sign-in for testing while the
Azure app registration is pending (off-platform task on Diego's side).

## Decision

Use **Supabase Auth directly**. No NextAuth, no Clerk, no custom JWT layer.

- **Two providers configured:**
  - Email + password (enabled now; min 10-char password, email verification on)
  - Microsoft (Azure) provider (visible in UI but disabled until Azure app
    registration; one config change to enable)
- **Both write to the same `auth.users` table** (Supabase-managed) →
  `public.user_profiles` (extended with `role`, `is_active`, `display_name`)
  via Postgres trigger.
- **Default role on signup:** `viewer`. Admin promotes.
- **Account linking** (same email arriving via both providers) **off** for v1.
- **RLS** for both DB rows and Storage objects uses `auth.uid()`.

## Consequences

**Positive**
- Zero JWT plumbing in our code — Supabase handles tokens, refresh, cookies.
- Same RLS layer protects DB rows AND storage files.
- One fewer abstraction (no NextAuth middleware) than the doc's path.
- Email/password unblocks dev while Azure app registration is pending.

**Negative**
- Coupled to Supabase Auth, not just Supabase Postgres. Migrating off
  Supabase later is harder; would require keeping auth.users.id UUIDs and
  re-issuing tokens from a replacement provider.
- Supabase Auth's customization surface is narrower than NextAuth's
  (e.g. custom session enrichment requires going through `raw_app_meta_data`
  instead of a `callbacks.session` hook).
- Tenant restriction (lock to `@thekeenfolks.com`) is configured in the
  Supabase dashboard, not in code → harder to audit via diff review.

## Related

- Engineering doc §4.7 (proposed NextAuth or Clerk)
- [0002 — Vendor stack picks](0002-vendor-stack-picks.md) (DB choice that enables this)
- `apps/web/src/lib/supabase/` — client implementations
- `apps/web/src/features/auth/` — signup/signin flow
