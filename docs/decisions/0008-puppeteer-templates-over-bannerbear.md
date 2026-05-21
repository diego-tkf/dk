# 0008 — Puppeteer templates instead of Bannerbear/Placid

- **Status:** Accepted
- **Date:** 2026-05-21

## Context

The engineering doc §4.6 specifies the template/compositing engine for v1:

> Bannerbear or Placid as v1 managed template service — (decide Week 1, with
> a real template test on the actual Axxets/Activest PSD)
> Migration path to Puppeteer + HTML/CSS templates for v2 once we have
> multiple tools using the same render.

So the doc explicitly recommends a managed service for v1 and earmarks
Puppeteer as a v2 migration target — because Puppeteer requires recreating
the Axxets navy/X-pattern and Activest cream/illustrated PSDs as HTML/CSS,
which is real upfront work.

## Decision

**Use Puppeteer + HTML/CSS from v1.** Skip the Bannerbear/Placid intermediate
step.

Implementation lives behind `@dk/template-engine`. Per ADR
[0005](0005-audit-middleware-via-lint.md), the package is the only place
`puppeteer` may be imported (enforced by ESLint's `no-restricted-imports`).

## Consequences

**Positive**
- Zero per-render vendor cost. At scale (hundreds of carousels per week
  across multiple clients later), this compounds significantly.
- Full control over the render — debugging is `open the HTML in a browser`,
  not `read Bannerbear's docs about why this layer didn't apply`.
- Already where the platform wants to land in v2 (per doc) — skipping the
  intermediate step avoids a forced migration later.

**Negative**
- More upfront work to recreate the two PSD templates as HTML/CSS faithfully.
  Daniel's brand-fidelity bar is high; this is non-trivial.
- We own the rendering infrastructure (headless Chrome dependency, memory
  footprint, font loading, image embedding).
- The doc's "v2 migration target" framing means we're shipping at v2-maturity
  without v1 validation against the managed service. Acceptable, but worth
  flagging.

## Mitigations

- `@dk/template-engine` should expose a narrow interface (`compose(variant,
  texts, brandAssets) → {slide_a, slide_b, slide_c}`) so a future swap to a
  managed service is a single-file change.
- The `keenfolks-design-system` skill (already installed in Diego's
  environment) is the source of brand fundamentals — colors, type, spacing.
  Faithful HTML/CSS recreation should be more tractable than starting from
  scratch.

## Related

- Engineering doc §4.6
- [0002 — Vendor stack picks](0002-vendor-stack-picks.md)
- [0005 — Audit middleware enforcement](0005-audit-middleware-via-lint.md)
- `packages/template-engine/` — TBD, will be built when carousel pipeline lands
