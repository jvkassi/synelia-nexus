---
name: synelia-design
description: Generate well-branded Synelia interfaces and assets (Groupe Synelia — Ivorian digital-transformation leader). Colors, type, fonts, tokens and rules for designing with the brand in Synelia Nexus.
---

When building or styling any surface in this repo, design with the Synelia brand.
Read [`../DESIGN.md`](../DESIGN.md) (tokens + components) and [`BRAND.md`](./BRAND.md)
(brand context + voice), then design like an expert in the brand.

## Quick map
- `../DESIGN.md` — tokens (colors, type, spacing, radii, shadows) + component spec. **The contract.**
- `app/globals.css` — operative implementation of those tokens (`@theme inline` + `:root`).
- `BRAND.md` — full context: company, voice, visual foundations, iconography, caveats.
- `colors_and_type.css` — upstream canonical token sheet (provenance; not imported).
- `public/brand/` — logo wordmark (substitute, light + white) and compact mark.

## Non-negotiables
- Violet `#4B2882` is the signature (structure); magenta `#C0297A` is a punctual
  accent only — never equal proportions, never magenta as a large fill.
- Surface budget ≈ 60% neutral (white / `#F5F4F8`) · 30% violet · 10% magenta + semantic.
- Montserrat (display) + Open Sans (body, line-height 1.6) + JetBrains Mono (code).
  Max 2 families per document. **Never** Arial / Roboto / Inter / system-ui.
- A 56×3 px magenta `.synelia-rule` under every H1/H2/section title on content surfaces.
- No purple gradients, no generic "tech-startup" palettes, no generic stock photos.
- Line icons only (Lucide, 1.5–2px, violet/white). Cyan only for Info callouts — never as a brand color.
- Shadows are violet-tinted (`rgba(45,21,87,…)`), never black. Radii: 4 / 8 / 16.
- French for institutional/product copy; English only for international technical docs. Never mix in a paragraph.
- Buttons: primary + ghost + text link only. No 4th button style.
