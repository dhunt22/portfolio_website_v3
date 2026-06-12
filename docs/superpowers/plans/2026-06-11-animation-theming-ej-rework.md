# Animation, Theming, and EJ Page Rework — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development to implement this plan task-by-task. Per the user's brief: Sonnet reads relevant code first and implements against the design system; Opus reviews and improves; iterate until each unit clears the bar. Every item must be verified on mobile viewports (390×844 device emulation minimum), not just resized desktop.

**Goal:** Fix the contour-animation drift and mobile first-scroll glitch at root cause, rebuild load/glow animation on GSAP with an explicit mobile perf budget, serve a calmer portrait contour dataset on mobile, quiet the contours, move dark theme to the Stone palette, and rework the EJ-prisons page into a dashboard-first interactive mapping experience.

**Architecture:** The two-layer backdrop invariant holds throughout: static plate rasterized once (CSS background or `<img>`, NEVER merged with animated sprites), animated glow as a separate small inline SVG. GSAP (core + MotionPathPlugin, client-only) replaces all CSS animation logic for load-in and comets. Design system at `design_system/tokens/` remains source of truth. Copy stays verbatim — only relocated.

**Tech stack:** Next.js 14.2 static export, React 18.2, Tailwind 3.4.1 (has `lvh/svh` utilities), maplibre-gl, GSAP 3.13 (new dep: `gsap` + `@gsap/react`), svgo `-p 1 --multipass` only (`-p 0` destroys geometry).

**Verification baseline (all tasks):** `npm run build` then `node style-explorations/serve-out.js` (port 4180). NEVER use `npm run dev`. NEVER delete `.next` without asking. Mobile checks at 390×844; desktop at 1440×900; both themes.

---

## Diagnosis summary (verified 2026-06-11, read before implementing)

**Drift (WS1-1):** `scripts/build-plates.mjs:579` emits the plate `<svg ... width="100%" height="100%" preserveAspectRatio="xMidYMid slice">`. As a CSS `background-image`, percentage width/height void the intrinsic dimensions, so `background-size: cover` computes scale/crop from a fallback ratio instead of the viewBox (406.4:254). The inline glow SVG scales correctly from its viewBox via `slice`. Two different crop math results → comets drift off lines; divergence is maximal on portrait phones.

**First-scroll glitch (WS1-3):** Chain: mobile URL bar collapses → layout viewport height changes → (a) `hooks/useThemeBackground.ts:82-89` unthrottled `resize` listener calls `setIsMobile` → React re-renders backdrop incl. `dangerouslySetInnerHTML` glow div; (b) `fixed inset-0` container (`AnimatedContourBackground.tsx:~106`) resizes → browser re-rasters multi-hundred-KB plate at new `cover` size = paint stall; (c) `min-h-screen` (=100vh) on 6 page wrappers reflows. No `interactive-widget` viewport meta exists.

**Glow mechanism today (for GSAP rebuild):** each `public/images/plates/{page}_{theme}_glow.svg` has a `<style>` block — keyframes `pmove-{page}` (offset-distance 0→100%) + `pfade-{page}` (ignition fade), 14 per-route classes `.{page}-p{i}` whose `offset-path:path("…")` holds the ONLY copy of each route's `d` string (no `<path>` elements exist). 14 routes × 13 circles = 182 sprites per page. Injection: `AnimatedContourBackground.tsx:72-98` fetches, strips prolog, adds inline sizing style, renders via `dangerouslySetInnerHTML`. Reduced motion: JS gate (`AnimatedContourBackground.tsx:56-70`, glow never fetched) + CSS blanket (`globals.css:96-104`).

**Load-in today:** `rise` keyframe `tailwind.config.js:54-56`; 4 hero elements in `app/page.tsx:20-31` with `animate-rise opacity-0` + delays 0/120/260/400ms + `motion-reduce` pairs. `Header.tsx:198` mobile menu also uses `animate-rise` (NOT page-load — leave as CSS, keep the keyframe).

**Mobile dataset (WS1-4):** `C:\Users\devin\Desktop\Claude\minicontour_gis\exports\svg\8.5x11\` holds portrait sheets incl. big-sur `iqr3` variants (~12.7MB raw, sparsest). Portrait coordinate space ≈ 254×323mm (implementer: read the actual viewBox from the source file).

**EJ page (WS2):** Map chain `IndicatorBrowser.tsx` → `LazyProjectMap` (dynamic, ssr:false) → `ProjectMap.tsx` (maplibre, openfreemap positron GRAY_STYLE). Indicator switch = `setPaintProperty` (`usePrisonMap.ts`), percentile filter = `setFilter` hard-coded 95 (`usePrisonMap.ts:68`), popups exist (`useMapPopup.ts`). Data: 1,865 prisons (points + polygons geojson) with 11 indicator percentiles + 3 component scores + final score + `TYPE` (STATE/FEDERAL) + `SECURELVL`. Page DOM order today: hero → Overview panel (~210 words) → IndicatorBrowser → Team/Impact (~330 words) → CTA.

---

### Task 1: Layer alignment — plate and glow share one coordinate space (WS1 item 1)

**Goal:** Comets ride exactly on the painted contour lines at every viewport size.

**Files:**
- Modify: `scripts/build-plates.mjs` (~line 579 plate header, ~604 glow header)
- Regenerate: `public/images/plates/*.svg` (all 24)
- Possibly modify: `components/ui/AnimatedContourBackground.tsx` (fallback only)

**Steps:**
1. In `build-plates.mjs`, remove `width="100%" height="100%"` from the EMITTED PLATE header so the file is `<svg xmlns=… viewBox="12.7 12.7 406.4 254" preserveAspectRatio="xMidYMid slice">` — intrinsic ratio then derives from viewBox and `background-size: cover` crops identically to the glow's `slice`. Remove the same attrs from the glow header (runtime injection already adds inline sizing; verify `AnimatedContourBackground.tsx` regex still matches).
2. Confirm plate div CSS is exactly `background-size: cover; background-position: center` (center = xMidYMid equivalent) and both plate divs + glow wrapper share the same reference box (`absolute inset-0` in the same fixed container).
3. Rebuild all plates (`node scripts/build-plates.mjs`), `npm run build`, serve.
4. Verify empirically at 390×844 AND 1440×900, both themes, home + portfolio: take screenshots; comet heads must sit ON contour lines (pick a moment a comet is mid-route). If drift persists, escalate to Fix B: replace the plate background divs with `<img src=… className="absolute inset-0 h-full w-full object-cover" loading="eager" decoding="async" />` pairs (`<img>` honors viewBox intrinsic ratio identically to inline SVG; still rasterized once). Document which fix shipped.

**Acceptance criteria:**
- [ ] At 390×844 and 1440×900, screenshot shows comet glow centered on a contour line (≤ ~1 line-width error)
- [ ] No change to plate file size class or animation smoothness
- [ ] Build green

**Verify:** `node scripts/build-plates.mjs && npm run build` → exit 0; visual screenshots at both viewports.

---

### Task 2: Viewport stability — kill the first-scroll glitch at root (WS1 item 3)

**Goal:** URL-bar collapse on first mobile scroll causes zero background re-scale, re-render, or repaint stall.

**Files:**
- Modify: `hooks/useThemeBackground.ts:82-89`
- Modify: `components/ui/AnimatedContourBackground.tsx` (container sizing)
- Modify: `app/layout.tsx` (viewport export)
- Modify (6 wrappers): `app/layout.tsx:61`, `app/page.tsx:15`, `app/interests/page.tsx:132`, `app/resume/page.tsx:42`, `app/portfolio/page.tsx:15`, `app/not-found.tsx:14`

**Steps:**
1. `useThemeBackground.ts`: guard the resize handler — track last `window.innerWidth`; if width unchanged, return immediately (URL-bar collapse is height-only). Debounce the remaining width path ~150ms. Clean up timer on unmount.
2. Background container: replace `fixed inset-0` sizing with `fixed top-0 left-0 right-0 -z-10 h-lvh` (Tailwind 3.4 native `h-lvh`). `lvh` = largest viewport = URL-bar-hidden size; it NEVER changes during bar collapse, so the plate never re-rasters. (NOT `dvh` — that resizes dynamically; NOT `svh` — leaves a gap when bar hides.) Keep `pointer-events-none` if present.
3. `app/layout.tsx`: add Next 14 viewport export: `export const viewport: Viewport = { width: 'device-width', initialScale: 1, interactiveWidget: 'resizes-visual' }` (merge with any existing viewport/themeColor config — check for an existing export first).
4. Page wrappers: `min-h-screen` → `min-h-svh` (stable smallest viewport; content never reflows on bar collapse; footer still below fold content on short pages).
5. Verify: 390×844 emulation, load home, scroll down/up repeatedly. Background must not jump or re-scale. Also confirm desktop unaffected and footer placement intact on a short page (404).

**Acceptance criteria:**
- [ ] No visible background re-scale/flash on simulated URL-bar resize (resize height-only by ±60px in emulation: background box unchanged)
- [ ] Resize handler provably skips height-only events (no React re-render: add a temporary console.count check during verification, then remove)
- [ ] 404/short pages: footer not floating mid-screen
- [ ] Build green

**Verify:** `npm run build` → exit 0; emulated scroll + height-resize screenshots before/after.

---

### Task 3: GSAP animation engine — load-in + comet glow (WS1 item 2)

**Goal:** All page-load and contour-glow animation runs on GSAP timelines with an explicit mobile budget; CSS keyframe machinery for these retired.

**Files:**
- Add deps: `gsap`, `@gsap/react` (then `npm run build` must stay green)
- Create: `lib/gsap.ts` (single registration point: core + MotionPathPlugin; export gsap; never imported at module scope by server components)
- Create: `hooks/useReducedMotion.ts` (extract the inline matchMedia state from `AnimatedContourBackground.tsx:56-68`)
- Create: `components/ui/HeroLoadIn.tsx` ('use client' wrapper)
- Modify: `app/page.tsx` (hero uses HeroLoadIn; remove `animate-rise`/delay classes; copy byte-identical)
- Modify: `scripts/build-plates.mjs` (glow emission: drop the `<style>` animation block; emit per-route `<path id="{page}-route{i}" d="…" fill="none" stroke="none"/>` inside `<defs>`; circles get `data-route`, `data-k` (0=head), `data-peak` (per-sprite peak opacity) attributes and initial `opacity="0"`; keep gradients)
- Modify: `components/ui/AnimatedContourBackground.tsx` (after inlining glow, build GSAP timelines; kill on unmount/page change)
- Modify: `tailwind.config.js` (KEEP `rise` keyframe — Header mobile menu still uses it; remove nothing else)
- Regenerate: `public/images/plates/*_glow.svg` (12)

**Animation spec (preserve current feel):**
- Per route i: travel duration = routeLength / speed, speed clamped to the existing per-space equivalent of 70–150 u/s in 1080-space (26–56 u/s in 406.4-space — reuse the build script's existing clamp math; pass each route's printed duration into the SVG as `data-dur` on the route path so runtime doesn't recompute).
- Head + followers: followers trail by `(k+1)×gapU/speed` seconds (emit as `data-delay` per circle, or recompute from data attrs). MotionPathPlugin tween per sprite: `gsap.to(el, { motionPath: { path: '#{page}-route{i}', alignOrigin: [0.5,0.5] }, duration: dur, repeat: -1, ease: 'none', delay })`. Use negative delays for mid-path starts (GSAP supports seeding via `.progress()` or negative delay on repeat: use `tween.totalTime(scatterOffset)` after creation for exact phase).
- Ignition fade (Vercel-style): opacity timeline per route: 0 → peak over 14% of an ~8s period, hold to 45%, fall to 0 by 62%, dark till 100%; period locked to an integer divisor of travel duration (same printed-duration trick — compute once in build script, emit as `data-fade`). Implement as a separate repeating gsap timeline animating the route `<g>` opacity (one tween per route group, not per sprite — cheaper than today).
- Scatter: per-route phase offset `-(i×3.83)s` applied to both move and fade via `totalTime` seeding.
- Mobile budget (HARD): when `isMobile`, animate at most 8 routes × 7 sprites = 56 elements; desktop keeps 14×13=182. Surplus circles get `display:none` before timeline build. Set `will-change: transform` only on animated sprites.
- Reduced motion: `useReducedMotion()` true → glow never fetched (existing gate, keep), hero timeline skipped with elements set visible immediately.
- Hero load-in: GSAP timeline `from { autoAlpha: 0, y: 14 }`, stagger ≈0.14s, `power2.out`, matching current 0/120/260/400ms cadence. No-JS safety: server HTML keeps elements visible (NO `opacity-0` class); `HeroLoadIn` sets initial state via `gsap.set` inside `useGSAP` before the first paint of the effect (useGSAP runs in `useLayoutEffect` — no flash) and adds a `<noscript>`-safe path by construction since default render is visible.

**Perf budget + measurement:** during verification run a 5s `PerformanceObserver` longtask sample on home at 390×844 emulation: no long task > 50ms attributable to the glow after initial inline; rAF-sampled FPS ≥ 50 average. Record numbers in the task report.

**Acceptance criteria:**
- [ ] Zero CSS `@keyframes` left in emitted glow SVGs; routes exist as `<path id>` in defs
- [ ] Hero staggers in via GSAP; copy byte-identical; reduced-motion shows static content instantly; no flash of hidden content with JS disabled (verify by curling the built HTML: hero elements have no opacity-0)
- [ ] Comets: same visual behavior (variable speeds, fading tail, ignition fades, scattered phases); mobile sprite count ≤ 56
- [ ] FPS/longtask numbers recorded; build green; first-load JS delta documented (~29KB gz expected)

**Verify:** `npm run build` → green; serve; visual + perf sample on mobile emulation; `grep -L "@keyframes" public/images/plates/*_glow.svg` lists all 12.

---

### Task 4: Mobile Big Sur dataset + global contour quieting (WS1 items 4+5)

**Goal:** Phones get a calmer portrait Big Sur plate on home; all contour plates get quieter in both themes.

**Files:**
- Modify: `scripts/build-plates.mjs` (mobile variant support + opacity knobs)
- Regenerate: `public/images/plates/*` (+4 new: `home_{light,dark}_plate_mobile.svg`, `home_{light,dark}_glow_mobile.svg`)
- Modify: `hooks/useThemeBackground.ts` (mobile preset entries for home)
- Modify: `components/ui/AnimatedContourBackground.tsx` (responsive plate divs + glow src selection)

**Steps:**
1. Build script: add a `MOBILE_SOURCES` map — home → `C:/Users/devin/Desktop/Claude/minicontour_gis/exports/svg/8.5x11/california_big-sur_iqr3_8.5x11.svg` (verify exact filename + read its viewBox; reframe to the portrait equivalent of the print margins, analogous to the landscape `12.7 12.7 406.4 254`). Emit portrait plate + portrait glow (routes re-extracted from portrait geometry, same comet system, same per-route native colors). Apply the same svgo `-p 1 --multipass` + ≤2.5MB decimation cap.
2. Opacity: lower baked plate stroke opacity — light 0.5 → 0.35, dark 0.45 → 0.30 (knobs at top of script; these are starting values — tune visually until "present and legible, just quieter" and record finals).
3. Runtime: home renders 4 plate divs — light/dark × desktop/mobile — using Tailwind responsive (`md:hidden` / `hidden md:block`) × theme (`dark:hidden` / `hidden dark:block`) combinations. CSS-hidden divs must not fetch their background (display:none subtree — verified pattern from R2). Glow src: pick `_mobile` when `isMobile` (hook already exposes it; glow is JS-fetched so no double download).
4. Non-home pages keep landscape plates (aspect fix from Task 1 + opacity drop should make them acceptable; if portfolio still reads busy at 390w during verification, NOTE it in the report — do not expand scope unilaterally).
5. Verify both themes × both viewports on home: portrait plate on mobile, comets locked to its lines, quieter overall presence on all pages.

**Acceptance criteria:**
- [ ] Mobile home shows the iqr3 portrait plate; desktop unchanged (median landscape)
- [ ] Network panel: exactly one plate + one glow fetched per page/theme/viewport combination
- [ ] All pages visibly quieter contours in both themes (before/after screenshots)
- [ ] Build green; new files within size budget (plate ≤2.5MB, glow ≈55KB class)

**Verify:** `node scripts/build-plates.mjs && npm run build`; screenshots; served network log.

---

### Task 5: Dark theme on the Stone palette (WS1 item 6)

**Goal:** Dark theme surfaces move to Stone steps with page/header/card reading as distinct layers without hard borders; text contrast holds.

**Files:**
- Modify: `app/globals.css` (`.dark` surface block, currently `--surface-page:#14130f; --surface-card:#1d1c16; --surface-sunken:#100f0c`)
- Possibly modify: `components/layout/Header.tsx` (header surface var), `design_system` reference only (do NOT edit design_system/)

**Steps:**
1. New dark mapping from DS stone scale (`design_system/tokens/colors.css`): page = `--stone-950` #1a1814; card = `--stone-900` #2b2822; header = an intermediate step — **flag: requires one new token** `--stone-925: #221f1b` (interpolated 950↔900; add to `:root` in globals.css with a comment citing this brief; do NOT touch design_system files). Sunken = #15130f (darker-than-page well, derived from stone-950 hue).
2. Verify the header actually consumes a distinct surface var (find its current bg class/var; wire to `--surface-header` if one must be introduced — flag it the same way).
3. Contrast audit on each surface: body `--stone-200`/`--stone-300` text on stone-900 card and stone-950 page ≥ 4.5:1 (compute, record ratios); links river-300; eyebrows earth-400. Adjust text steps ONLY if a ratio fails.
4. Check dark plates against the new page color (plates are transparent-stroke SVGs, baked for #14130f; stone-950 #1a1814 is close — verify the dark HSL stroke transform still reads; if washed out, adjust dark stroke transform constant in build script and regenerate dark plates).
5. Verify all 6 pages in dark theme at both viewports; layers must read as distinct planes (screenshot per page).

**Acceptance criteria:**
- [ ] Page/header/card are three distinguishable stone steps, no hard borders introduced
- [ ] Recorded contrast ratios all ≥ 4.5:1 body, ≥ 3:1 large text/UI
- [ ] New tokens (`--stone-925`, possibly `--surface-header`) flagged in commit message
- [ ] Light theme byte-identical (no light-side regressions)

**Verify:** `npm run build`; dark screenshots × 6 pages; ratio table in report.

---

### Task 6: EJ page — dashboard-first layout inversion (WS2 part 1)

**Goal:** Map-led page: compact hero, then the interactive map section dominating the first viewport; ALL existing copy relocated verbatim into an About section + long-form read below.

**Files:**
- Modify: `app/portfolio/environmental-justice-prisons/page.tsx`
- Modify: `components/portfolio/IndicatorBrowser.tsx` (section sizing/placement only in this task)

**Steps:**
1. New DOM order: (1) compact hero — keep eyebrow + h1 + lead + the two `link-quiet` links, tighten vertical padding so the map section enters the first viewport on desktop; (2) the IndicatorBrowser dashboard section (full content width, map given more height: lg min-h ≈ 70vh-equivalent, mobile h ≈ 60svh); (3) `<section id="about">` "About the Project" — Overview paragraphs + Key Project Objectives, copy byte-identical; (4) long-form read: Project Team & My Contribution + Impact & Recognition + blockquote + acknowledgement, byte-identical; (5) CTA section unchanged.
2. Word-for-word audit: diff old vs new rendered text content (script or manual) — zero copy changes allowed, only reordering/regrouping.
3. Panels: About + long-form use `.panel` per the R2 contrast system; dashboard section itself stays quiet (map is the surface).
4. Verify: desktop first viewport shows hero + top of map; mobile shows map within one swipe; anchors (`#about`) work.

**Acceptance criteria:**
- [ ] Rendered text content identical pre/post (record the diff command output: empty)
- [ ] Map section visible within first viewport at 1440×900; within one viewport-height scroll at 390×844
- [ ] All sections present in new order; links intact
- [ ] Build green

**Verify:** text-content diff empty; screenshots both viewports.

---

### Task 7: EJ page — map control rail (WS2 part 2)

**Goal:** Prominent, design-system buttons are the page's core interaction: they drive indicator choropleth, filters, and view state on the map.

**Files:**
- Modify: `components/portfolio/IndicatorBrowser.tsx` (control rail layout + buttons)
- Modify: `components/portfolio/ProjectMap.tsx`, `components/portfolio/MapControls.tsx`, `components/portfolio/usePrisonMap.ts` (threshold param, type filter, reset view, dark basemap)
- Possibly modify: `components/portfolio/mapConfig.ts` (dark style URL, view presets)

**Controls (all data-ready, verified):**
1. **Indicator buttons** (exists — restyle): 4 category groups (Climate Risk / Exposure / Proximity / Overall) with their indicator buttons. Prominent treatment: DS `Button` outline/ghost + `.eyebrow` group labels + active state using the indicator's `componentColor` as a left rule or underline — quiet but unmistakably interactive. Keyboard accessible, `aria-pressed` kept.
2. **Percentile threshold** (extend existing): replace the hard-coded 95 with a small segmented control — All / Top 50% / Top 25% / Top 5% → `setFilter` percentile ≥ 0/50/75/95 on the active indicator.
3. **Facility type filter** (new, S): STATE / FEDERAL toggle chips → combined into the same `setFilter` expression.
4. **Reset view** (new, S): button calling existing `fitBounds` to US extent.
5. **Basemap theme sync** (new, S): dark theme loads openfreemap dark style (e.g. `styles/dark`), light keeps positron; on theme switch, `map.setStyle` + re-add prison layers (use the existing setup function on `style.load`); legend/popup colors hold contrast on both.
6. **Legend** (restyle): keep collapsible panel, restyle to DS (panel surface, eyebrow label, mono values).

**Constraints:** minimalist — no gratuitous chrome, controls earn their place; mobile: control rail collapses to horizontal scroll chips or stacked groups above the map (implementer judgment, verify thumb reach); filter state combinations always produce a valid `setFilter` expression (test: type filter + threshold + indicator switch in all orders).

**Acceptance criteria:**
- [ ] Every control changes map state visibly; no dead UI
- [ ] Filter combinations composable in any order without error (console clean)
- [ ] Dark theme: dark basemap, layers/legend/popups legible
- [ ] Mobile 390×844: controls usable, map ≥ 60svh, no horizontal page scroll
- [ ] Build green; maplibre still code-split (dynamic import intact)

**Verify:** `npm run build`; interaction pass desktop + mobile emulation, both themes; console clean.

---

### Task 8: Full mobile verification sweep + ship

**Goal:** Every brief item verified on mobile emulation; branch pushed; PR #8 updated.

**Steps:**
1. Matrix: 6 pages × 2 themes × 2 viewports (390×844, 1440×900). Checks: comet-on-line lock (Task 1), scroll stability with height-resize simulation (Task 2), GSAP load-in + glow smoothness incl. longtask/FPS sample (Task 3), portrait plate + quieter contours (Task 4), stone dark surfaces + contrast (Task 5), EJ dashboard interactions (Tasks 6-7).
2. `npx jest` (13 tests must pass), `npm run build` final.
3. Commit any verification fixes; push `claude/minimalist-overhaul`; update PR #8 body with a Round 3 section (work streams, diagnoses, perf numbers, GSAP bundle delta, any open knobs).

**Acceptance criteria:**
- [ ] Matrix table with pass/fail per cell in final report; all pass
- [ ] jest 13/13; build green
- [ ] PR #8 updated; pushed head == local head

**Verify:** `git log origin/claude/minimalist-overhaul -1` matches local; PR body shows R3 section.
