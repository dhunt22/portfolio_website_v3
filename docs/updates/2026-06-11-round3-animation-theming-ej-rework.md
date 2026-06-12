# 2026-06-11 Update — Round 3: Animation Root Causes, GSAP Engine, Stone Dark Theme, EJ Dashboard

> **Audience: AI assistants in future sessions.** This documents the state of the codebase after Round 3
> of the portfolio revamp (branch `claude/minimalist-overhaul`, commits `bf027f6..56c4c23`,
> shipped 2026-06-11→12). Read this before touching the backdrop/animation system, the dark theme,
> or the EJ-prisons page. Prior rounds: R1/R2 are summarized in the PR body and in
> `docs/superpowers/plans/2026-06-10-minimalist-overhaul.md`. The R3 plan with full per-task specs is
> `docs/superpowers/plans/2026-06-11-animation-theming-ej-rework.md`.

---

## 1. Backdrop architecture (two-layer invariant — DO NOT VIOLATE)

Every page renders a fixed full-viewport contour backdrop via
`components/ui/ContourBackdrop.tsx` → `hooks/useThemeBackground.ts` (PLATE_PRESETS) →
`components/ui/AnimatedContourBackground.tsx`:

1. **Static plate** — large contour-only SVG painted as a CSS `background-image`
   (`background-size: cover; background-position: center`), rasterized ONCE.
   Theme pair: `dark:hidden` / `hidden dark:block` divs (browsers never fetch background-images
   of `display:none` subtrees → exactly one plate downloaded per visitor).
   Home additionally wraps two such pairs in `md:hidden` / `hidden md:block` wrappers for the
   mobile portrait variant.
2. **Animated glow** — small (~55KB) transparent SVG fetched post-mount and inlined via
   `dangerouslySetInnerHTML`, animated by **GSAP** (see §3). Reduced motion ⇒ glow never fetched.

**Never** merge plate paths into the animated SVG (full-layer re-raster per frame ≈ 12fps),
**never** animate the plate divs, **never** give the plate `will-change`.

### Root cause fixed this round: layer drift (commit `bf027f6`)
The emitted SVG roots used to carry `width="100%" height="100%"`. For a CSS background-image,
percentage dimensions void the intrinsic size, so `cover` computed scale/crop from a fallback
ratio while the inline glow scaled from its viewBox — two different crops, comets drifted off the
contour lines (worst on portrait phones). **Fix: emit NO width/height attributes** —
`<svg xmlns=… viewBox="…" preserveAspectRatio="xMidYMid slice">`. With the viewBox as the
intrinsic ratio, CSS `cover` and inline `slice` are mathematically identical for the same box.
Verified: glow `getScreenCTM()` equals container-box cover math to 4 decimals at 390×844 and
1440×900. **Do not regress this header.**

## 2. Viewport stability (commit `cf36a5f`, `a61c1f6`)

Mobile URL-bar collapse used to glitch the backdrop on first scroll. Three-part fix:

- `hooks/useThemeBackground.ts` — resize handler ignores height-only events (tracks last
  `innerWidth`) and debounces width changes ~150ms. URL-bar collapse is height-only.
- Backdrop container is `fixed top-0 left-0 right-0 h-lvh -z-10 overflow-hidden`. `lvh` (largest
  viewport) never changes when the bar collapses ⇒ no plate re-raster. NOT `dvh` (resizes
  dynamically), NOT `svh` (gap when bar hides).
- `app/layout.tsx` exports `viewport = { …, interactiveWidget: 'resizes-visual' }`; page wrappers
  use `min-h-svh`; hero sections use `min-h-[82svh]`. No `100vh`/`h-screen`/`min-h-screen` remain
  in app/ or components/.

## 3. GSAP animation engine (commits `42ee801`, `59ddb62`, `ca50cee`, `26165f4`, `d96da79`)

CSS keyframes are GONE from the glow files and the hero. GSAP 3.13 (`gsap` + `@gsap/react`,
~51KB minified lazy chunk) drives everything. **GSAP is never imported at module scope of a
server component** — only via `import('@/lib/gsap')` inside client-component effects.
`lib/gsap.ts` is the single registration point (core + MotionPathPlugin).

### Glow SVG format v2 (emitted by `scripts/build-plates.mjs`)
- `<defs>`: per-route `<path id="{page}-route{i}" d="…" fill="none" stroke="none">` + the radial
  gradients. Zero `<style>`, zero `@keyframes`.
- Per-route comet group: `<g class="{page}-comet" data-route data-dur data-fade data-scatter
  data-fade-peak opacity="0">` containing 13 circles (head + 12 tapered followers), each with
  `data-k` (0 = head), `data-lag` (seconds behind the head), and cx/cy at the route start.
- `data-fade` is an exact integer divisor of `data-dur` (`n = round(dur/8); fadeT = dur/n`) so the
  ignition fade lands dark at the travel-loop wrap. Preserve this if you touch the emitter.

### Runtime (in `AnimatedContourBackground.tsx`)
- Movement per circle: `gsap.to(circle, { motionPath: { path: routePathEl, align: routePathEl,
  alignOrigin: [0.5,0.5] }, duration: dur, ease: 'none', repeat: -1 })`.
  **GOTCHA (real bug caught in verification): `align` is mandatory.** Without it MotionPathPlugin
  treats path coordinates as RELATIVE transform deltas and the sprites fly ~500 units off the
  artwork. `alignOrigin` is inert without `align`.
- Phase seeding replicates the old CSS negative animation-delays:
  `phase = ((scatterAbs − lag) mod dur + dur) mod dur; tween.totalTime(phase + 10·dur)` where
  `scatterAbs = i × 3.83`. A sprite seeded at exactly phase 0 renders at the repeat seam
  (path END) until the first live tick — known, invisible (groups start at opacity 0), harmless.
- Ignition fade: one repeating timeline per route GROUP (not per circle — deliberate, cheaper):
  opacity 0 → peak@14% → hold@45% → 0@62% → 0@100% of `data-fade`, seeded with the same scatter.
  Per-circle `fill-opacity` taper multiplies with group opacity, so followers stay dimmer.
- **Mobile sprite budget (hard)**: when `isMobile` (<768px), only routes 0–7 animate and only
  sprites `data-k ≤ 6` ⇒ 56 tweens; surplus elements get `display:none` BEFORE tween creation.
  Desktop: 14×13 = 182. `will-change: transform` set only on animated circles.
- Lifecycle: everything inside `gsap.context(…, container)`; `ctx.revert()` on cleanup; effect
  keyed on `[glowMarkup, isMobile]`; theme change swaps `glowSrc` → markup refetch → clean rebuild.

### Hero load-in (`components/ui/HeroLoadIn.tsx`)
- Server HTML keeps hero children VISIBLE (no opacity-0 classes). An inline head script adds
  `html.js`; `globals.css` hides `[data-hero-loadin] > *` only under `html.js`, with a
  reduced-motion override back to visible. GSAP staggers them in (`y:14→0`, 0.8s, stagger 0.13).
  No-JS users and reduced-motion users always see content. The `rise` keyframe REMAINS in
  `tailwind.config.js` — `Header.tsx` mobile menu still uses it (micro-interaction, not load-in).

## 4. Plates: mobile variant + opacity (commits `1027090`, `80f2019`)

- Sources: landscape `C:/Users/devin/Desktop/Claude/minicontour_gis/exports/svg/11x17/
  <loc>-landscape_median_11x17.svg` (viewBox `12.7 12.7 406.4 254`); home-mobile portrait
  `…/8.5x11/california_big-sur_iqr3_8.5x11.svg` (iqr3 = sparsest; derived viewBox
  `12.7 12.7 190.5 254`). 28 emitted files in `public/images/plates/`.
- Plate stroke opacity knobs (top of `scripts/build-plates.mjs`): **light 0.35 / dark 0.30**
  (lowered from 0.5/0.45 this round, user wanted quieter).
- svgo: precision **1** + multipass only. Precision 0 DESTROYS geometry (blank render).
- Comet speed clamp is viewBox-absolute (26–56 u/s); reviewed for the half-width portrait space —
  on-screen px/s stays in the intended band because cover scaling is height-driven on phones.
  No per-orientation clamp needed.
- Decimation cap ≤2.5MB per plate enforced for both orientations.

## 5. Dark theme = Stone palette (commits `374c114`, `d96bb61`)

`.dark` in `app/globals.css`: page `#1a1814` (stone-950) · header `--stone-925: #221f1b`
(**new flagged token**, interpolated 950↔900; via `--surface-header`, light resolves to
paper-base = byte-identical light theme) · card `#2b2822` (stone-900) · sunken `#15130f` ·
borders bumped (`hairline #3a372c`, `default #4a4437`) BUT `.dark .panel` uses the HAIRLINE —
the surface steps carry layer separation, borders recede (brief: "distinct without hard borders").
Contrast verified (WCAG): body 7.8–9.5:1, links 8.1–9.7:1, eyebrow 5.8:1, all pass.
Dark plates were baked against the old `#14130f` ground; verified legible on stone-950 — no regen.

## 6. EJ-prisons page: dashboard-first (commits `3f3127a`, `cf118ac`, `d444bff`, `d606532`, `baa13f6`, `56c4c23`)

- DOM order: compact hero → map dashboard (mobile `h-[60svh]`, desktop `lg:min-h-[70vh]`) →
  `#about` (Overview + Objectives) → long-form (Team/Impact/quote) → CTA. **All copy byte-identical**
  to pre-rework, only relocated (audited via text-extraction diff).
- One category tab row drives the rail (a duplicated in-rail nav was removed — keep it single).
- Controls: indicator buttons (active = 3px left rule in `componentColor`, `aria-pressed`),
  percentile segmented control (All/≥50th/≥75th/≥95th, plain buttons + `aria-pressed`, NOT
  role=radio — radio requires arrow-key roving we don't implement), State/Federal chips
  (last-active click is a no-op), reset view (`fitBounds` US), restyled DS legend.
- **Filter semantics**: `lib/maps/filterUtils.ts` is the single source of truth.
  `COMPONENT_FILTER_COLUMNS` maps componentId → percentile column (mapUtils re-exports it as
  `COMPONENT_COLUMNS` — maplibre-free module so jest can import it; 6 unit tests).
  Expression: `['all', ['>=',['get',activeColumn],threshold]?, ['==',['get','TYPE'],type]?]`,
  null when unrestricted. **The threshold MUST key off the ACTIVE indicator's column** — the
  original implementation filtered by `final_risk_score_pcntl` always (review-caught critical).
- **Basemap theme sync** (`components/portfolio/ProjectMap.tsx`): light = openfreemap positron,
  dark = `https://tiles.openfreemap.org/styles/dark`. On `resolvedTheme` change: if a swap is in
  flight (`isStyleChanging` ref) the theme is QUEUED in a ref and applied after the current
  `style.load`; layers/filters/paint re-applied event-driven inside the `style.load` flow (the
  old 100ms setTimeout was a race and was removed). CSP already covers `*.openfreemap.org`.
- maplibre stays dynamically imported (`LazyProjectMap`, ssr:false).

## 7. Verification techniques that work here (and their traps)

- **NEVER `npm run dev`** (corrupts `.next` when files change underneath; user has explicitly
  denied `.next` deletion). Verify on the static export: `npm run build` then
  `node style-explorations/serve-out.js` (port 4180; it reads from disk per request).
- Mobile emulation: `resize_window` is a NO-OP on a maximized Windows Chrome. Use a same-origin
  IFRAME harness (390×844 / 1440×900) injected into a localhost tab — layout-accurate, and
  same-origin lets you measure inside it.
- **If the user's Chrome window is hidden/minimized: `visibilityState === 'hidden'` ⇒ rAF is
  SUSPENDED ⇒ GSAP and maplibre appear frozen while CSS animations keep playing (compositor).**
  This is environmental, not a bug. Each CDP screenshot forces one BeginFrame — repeated
  screenshots tick GSAP forward (wall-clock-based, so tweens leap). Static verification that
  works while frozen: compare each sprite's seeded transform (`cx/cy + DOMMatrix(transform)`)
  against `routePath.getPointAtLength(phase/dur × L)`.
- Layer alignment check: glow `getScreenCTM()` vs cover math computed from the CONTAINER box
  (not `window.innerWidth` — scrollbar makes innerWidth lie by ~8px).
- Theme assets: confirm fetch discipline via `performance.getEntriesByType('resource')` —
  exactly one plate + one glow per page/theme/viewport combination.

## 8. Known issues / open items

1. **Deferred: live FPS/long-task sampling of the GSAP glow** — impossible in a hidden tab.
   Structure is within budget (≤56 mobile sprites, transform/opacity only, paths sampled once at
   tween creation). Re-measure on a visible tab or the Netlify preview (PR body asks the user to
   sanity-check on their phone).
2. **Intermittent load-time React `removeChild` NotFoundError on the EJ page** (~1-in-3 loads,
   ONLY observed in the throttled hidden-tab environment; self-recovering; page/map/controls all
   function; never reproduced on other pages; a `Node.prototype.removeChild` instrumentation
   wrapper did NOT catch it, suggesting an early-hydration or alternate-path removal). Re-check
   console on the Netlify preview; chase only if it reproduces there.
3. Open user decisions carried from R1/R2 (see PR body): resume duplicate bullets;
   plate decimation knob (25MB of plates in out/); app.netlify.com dropped from CSP.
4. `design_system/` and `eslint.config.mjs` are intentionally untracked AND now gitignored
   (with `.tmp_plates/`, `.tmp_review/`, `tmp-*.mjs`, `bun.lock`) so session-checkpoint
   auto-commits can't sweep them onto the branch again (this happened once — `d931cfd`, reverted).

## 9. Numbers (post-R3)

Build 8/8 static pages · jest 19/19 (13 + 6 filter tests) · first-load JS 88–113KB (GSAP and
maplibre both lazy) · plates: desktop ~0.3–2.5MB each, home mobile plate 1.7MB, glows 54–59KB ·
out/ grew ~3.5MB for the 4 mobile-variant files.
