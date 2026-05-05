# Tailwind CSS Audit — EST Website

Date: 2026-05-05
Scope: `app/` Vue components + pages + `app/assets/css/*.css` + Tailwind v4 setup
Method: static inspection (no runtime analysis)

---

## TL;DR

The Tailwind v4 setup itself is **correct and idiomatic** — modern `@theme`-driven token configuration in CSS, no legacy `tailwind.config.js`, prettier-plugin-tailwindcss enabled. The codebase passes lint + typecheck + build, and class-name spot checks show no invalid utilities.

The notable problem is **two parallel design systems coexisting** without integration — the public site uses Tailwind `@theme` tokens, while `/admin/*` uses a separate plain-CSS variable system (`--adm-*` in `admin.css`) with `.adm-*` BEM-style classes. Both define a "gold" accent, but with **different hex values**. Admin pages then mix the two, including 26 places where the admin gold hex is hardcoded as a Tailwind arbitrary value (`bg-[#d4a843]`) instead of going through the variable.

This isn't broken — it ships and works — but it is a real maintainability issue that will compound as the admin grows.

---

## 1 — Setup (correct)

| Item | Status |
|---|---|
| Tailwind version | v4.2.2 (latest stable) ✅ |
| Config file | None — uses `@theme` block in `app/assets/css/main.css` ✅ (idiomatic for v4) |
| Imports | `@import "tailwindcss"` + `@import "@nuxt/ui"` ✅ |
| Class ordering | `prettier-plugin-tailwindcss` configured in `.prettierrc` ✅ |
| Custom function recognition | `tailwindFunctions: ["clsx", "cva", "cn"]` ✅ |
| `@apply` usage | None (recommended in v4) ✅ |
| `@layer` usage | None (acceptable — no layer customisation needed yet) ✅ |
| CSS entry points | `~/assets/css/main.css`, `~/assets/css/admin.css` (loaded via `nuxt.config.ts:38`) ✅ |

**Spot check on the 30 most-used classes** (`items-center`, `text-sm`, `border`, `font-bold`, `gap-3`, `bg-white/4`, `text-white/50`, etc.) — all are valid Tailwind v4 utilities.

---

## 2 — Issues

### 2.1 Two design systems, two golds (highest impact)

**Public site** — `app/assets/css/main.css` (`@theme`):
```css
--color-gold: #E8B547;
--color-gold-bright: #F4D076;
--color-gold-deep: #A87E2A;
--color-bg-0: #07050C;
--color-ink: #F4ECDF;
--font-display: 'Cinzel', 'Georgia', serif;
--font-body: 'Inter', 'Noto Sans Thai', system-ui, sans-serif;
```
These flow through Tailwind: `bg-gold`, `text-ink`, `font-display`, `bg-bg-0/40`, etc.

**Admin** — `app/assets/css/admin.css` (`:root`, plain CSS vars):
```css
--adm-gold: #d4a843;          /* ← different from public --color-gold (#E8B547) */
--adm-gold-light: #e8c468;
--adm-surface-1: rgba(255, 255, 255, 0.025);
--adm-sp-2: ...;
--adm-radius: ...;
```
These are **NOT** registered with Tailwind. They power `.adm-btn-primary`, `.adm-panel`, `.adm-icon-btn`, etc. (BEM-style classes inside `admin.css`).

#### Concrete consequences

- **Visual drift**: `--color-gold` (#E8B547) and `--adm-gold` (#d4a843) are visibly different golds. Public-site nav clipping into admin (or vice versa) shows the inconsistency.
- **`[#d4a843]` hardcoded 26 times** across admin `.vue` files. Example:
  - `app/pages/admin/banners.vue` and friends use `bg-[#d4a843]/10` etc.
  - These bypass the variable. Changing `--adm-gold` does not propagate.
- **Mixed authoring style** — admin pages use Tailwind utilities (`flex`, `gap-3`, `text-sm`) AND `.adm-*` classes AND bare hex arbitrary values, in the same template.

#### Recommendation (deferred per audit-only scope)

Pick one path:

1. **Promote admin tokens into Tailwind**: rename `--adm-*` to `--color-adm-*` / `--spacing-adm-*` and move them into the `@theme` block. Then `bg-[#d4a843]` becomes `bg-adm-gold`. Keeps admin's distinct visual identity but removes the parallel system.
2. **Unify the two golds** if the visual difference is unintentional (likely — `#d4a843` and `#E8B547` are close enough that this looks like drift, not deliberate).
3. **Keep the split** but at minimum change every `[#d4a843]` to `var(--adm-gold)` via inline `style="color: var(--adm-gold)"` or a wrapper utility. Worst option (most verbose) but lowest risk.

### 2.2 Redundant encoding of opacity-on-white surfaces

The admin `:root` defines:
```css
--adm-surface-1: rgba(255, 255, 255, 0.025);
--adm-surface-2: rgba(255, 255, 255, 0.04);
--adm-surface-3: rgba(255, 255, 255, 0.06);
--adm-ink: rgba(255, 255, 255, 0.92);
--adm-ink-soft: rgba(255, 255, 255, 0.62);
```
And the same values are hand-rolled inline as Tailwind utilities throughout admin pages:
- `bg-white/4` — 16 places in `admin/integrations.vue` alone, 4–12 in others
- `text-white/60`, `text-white/50`, `text-white/40`, `text-white/30`, `text-white/25` — dozens of occurrences each

Two encodings of the same scale → readers cannot tell whether `bg-white/4` and `var(--adm-surface-2)` are intentionally different (they are not). A single source of truth (preferably the `@theme` route) would fix it.

### 2.3 Arbitrary-value density

**231 class attributes** contain at least one arbitrary value (`[...]`). Top-30 distinct arbitrary values:

| Count | Value | Reading |
|---|---|---|
| 28 | `[#d4a843]` | admin gold hex hardcoded — see 2.1 |
| 23 | `[index]` | likely v-bind dynamic class match — false positive |
| 20 | `[0.625rem]` | one-off micro text size — could become a `--font-size-2xs` token |
| 11 | `[0.3em]` | letter-spacing — could become `--tracking-wider-2` |
| 9 | `[10px]` | scattered px sizes — Tailwind has `text-[10px]` patterns; consider tokenising |
| 6 | `[#110d17]` | one-off dark hex — should be `--color-bg-2` (`#181024`) or similar |

**Per-file hot spots** (most arbitrary-value class attributes):
- `app/pages/admin/media.vue` — 19
- `app/components/organisms/WeaponSelector.vue` — 16
- `app/components/organisms/HeroSection.vue` — 16
- `app/components/organisms/NewsSection.vue` — 14
- `app/pages/news/index.vue` — 13

This is **not a bug** — Tailwind v4 supports arbitrary values precisely so you can escape the design system locally. But density this high in a few files often indicates either (a) a missing token, or (b) a one-off effect that should be moved to a `<style>` block.

### 2.4 Scoped `<style>` weight

- 31 `.vue` files contain `<style scoped>` blocks
- ~1942 total lines of scoped CSS
- Most are admin component styling (`.field-input`, `.gold-btn`, etc.) and animations (acceptable)

Some admin scoped CSS could move into `admin.css` as `.adm-*` classes (the file already exposes that pattern), or into `@theme` tokens used directly from templates. Not a correctness issue.

### 2.5 Inline `style=""` attributes

32 inline style attributes across `app/`. Mostly dynamic styles bound via Vue (`:style="..."` for colour overrides, animation delays). Low priority — leave as-is unless a specific case becomes a maintenance pain.

### 2.6 `!important` usage

Five total occurrences:
- `app/layouts/admin.vue:704` — `margin-left: 0 !important;` (mobile responsive override — legitimate)
- `app/assets/css/main.css:234-237` — inside `@media (prefers-reduced-motion: reduce)` (a11y override — legitimate)

No misuse detected.

---

## 3 — Things that look fine

- No tailwind.config.* file (correct for v4 — `@theme` is the new home).
- prettier-plugin-tailwindcss handles ordering automatically; no need for ESLint plugin.
- `@nuxt/ui` is imported into `main.css` via `@import "@nuxt/ui"`, plus enabled as a Nuxt module in `nuxt.config.ts:30`.
- Modern colour syntax in `@theme` (`oklch()` for glass surfaces).
- All top-30 utility classes are valid v4 syntax (including `bg-white/4` opacity-modifier shorthand).
- Class ordering in templates is consistent — prettier is doing its job.

---

## 4 — Suggested follow-ups (in priority order)

| # | Item | Effort | Priority |
|---|---|---|---|
| 1 | Decide whether `--color-gold` and `--adm-gold` are deliberately different. If not: unify. | S | High |
| 2 | Eliminate `bg-[#d4a843]` (×26) by either putting `--adm-gold` into `@theme` (then `bg-adm-gold`) or using `bg-[var(--adm-gold)]` | S | High |
| 3 | Decide single source of truth for opacity-on-white surfaces (Tailwind `bg-white/N` OR `--adm-surface-*` — not both) | S | Med |
| 4 | Move repeated arbitrary values (`[0.625rem]`, `[0.3em]`) into `@theme` tokens if reused 5+ times | M | Med |
| 5 | Audit `app/pages/admin/media.vue` (19 arbitrary values, the worst offender) for token candidates | M | Low |
| 6 | Document the public/admin token boundary in `docs/` so future contributors know where to add what | S | Low |

Sizes are rough: S = 1–2 hr, M = half-day.

---

## 5 — Summary

| | Public site | Admin |
|---|---|---|
| Token system | `@theme` in `main.css` (Tailwind v4) | `:root` `--adm-*` in `admin.css` (plain CSS) |
| Class style | Tailwind utilities | Mixed: Tailwind utilities + `.adm-*` BEM + arbitrary hex values |
| Gold accent | `#E8B547` | `#d4a843` (different) |
| Surface opacity | `bg-bg-N/M` from theme | `bg-white/N` arbitrary + `--adm-surface-*` (redundant) |
| Inline arbitrary `[#hex]` | Few | 26 `[#d4a843]` (admin gold) |

The setup is solid. The biggest wins are normalising the admin/public boundary and removing the 26 hardcoded admin-gold hexes — both are small surgical changes.
