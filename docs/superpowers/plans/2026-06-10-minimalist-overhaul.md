# Minimalist Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild dth_portfolio_v3 into a minimalist, cartographic experience: design_system/ tokens everywhere, the "Night Drafting" contour/comet background as the centerpiece, all existing copy preserved verbatim, all bloat removed.

**Architecture:** Tailwind stays but is re-grounded on `design_system/tokens` CSS variables (paper light theme / night-field dark theme). The background becomes a generated two-layer system (static contour wash + drafted key contours + comet ignition pulses) produced by a build script and inlined by one client component (`ContourBackdrop`), so every page can be a server component. Pages are de-carded into editorial layouts: mono eyebrows, Newsreader display, Hanken Grotesk body, quiet mono links.

**Tech Stack:** Next.js 14 App Router (static export), Tailwind, next/font (Newsreader, Hanken Grotesk, JetBrains Mono), MapLibre GL (dynamic import), Jest + RTL.

**Execution model (per the owner's brief):** Each task is implemented by a **Sonnet** subagent and then reviewed by an **Opus** subagent for quality, minimalist-constraint adherence, performance, and correctness; iterate until the unit clears the bar, then commit and move on.

**Hard constraints (apply to every task):**
- Preserve existing user-facing copy verbatim. Unless a task explicitly lists a string for deletion, the diff must not alter any user-facing string literal.
- No gratuitous UI: no new cards, badges, divider lines, or buttons beyond what content requires.
- Animation must stay GPU-composited (offset-distance/opacity only). Never animate SVG paint-server attributes or stroke-dash on long paths in steady state.
- The reference visual is `style-explorations/d-night-drafting.html` (approved treatment D, scheme DS-6) — do not regress from it.
- After every task: `npm run build` must pass and `npx jest --ci` must pass.

**Approved decisions already locked:** DS-6 text scheme (eyebrow earth, body stone, links river) · light theme = same composition on paper · header coordinate readout omitted · map proxy scripts removed if tiles verify · buttons replaced by quiet mono links except where noted.

---

## File Structure Overview

```
app/
  fonts.ts                      (new — next/font definitions)
  globals.css                   (rewritten — DS tokens + component classes)
  layout.tsx                    (modified — fonts, scripts removed, CSP meta removed in T9)
  page.tsx                      (rewritten — server component, editorial home)
  portfolio/page.tsx            (rewritten — server shell + ProjectIndex client island)
  portfolio/environmental-justice-prisons/page.tsx (de-carded)
  resume/page.tsx               (rewritten — server component)
  interests/page.tsx            (rewritten — server component)
  not-found.tsx                 (re-skinned)
components/
  ui/ContourBackdrop.tsx        (new — single client entry for the background)
  ui/AnimatedContourBackground.tsx (modified — theme-aware overlay src)
  layout/Header.tsx, Footer.tsx (re-skinned)
  portfolio/ProjectIndex.tsx    (new — client island: tabs + project rows)
  portfolio/LazyProjectMap.tsx  (modified — real next/dynamic)
  interests/InterestSection.tsx (rewritten — no card)
  resume/* (rewritten minimal)
scripts/
  generate-overlays.mjs         (new — emits 4 overlay SVGs)
  strip-smil.mjs                (new — one-time SMIL removal)
public/images/
  american_river_overlay_{light,dark}.svg (generated)
  upper_folsom_overlay_{light,dark}.svg   (generated)
tailwind.config.js              (rewritten theme)
```

Deletions are enumerated in Task 1.

---

### Task 1: Foundation — design-system tokens, fonts, cleanup sweep

**Goal:** Re-ground the styling system on `design_system/tokens`, load the three DS fonts via next/font, and delete all dead code, cruft files, and dead dependencies so later tasks build on a clean base.

**Files:**
- Create: `app/fonts.ts`
- Modify: `app/globals.css`, `tailwind.config.js`, `app/layout.tsx`, `package.json`, `netlify.toml`, `.gitignore`, `components/ui/ThemeToggle.tsx`, `components/ui/icons/common-icons.tsx`, `app/portfolio/environmental-justice-prisons/page.tsx` (dead chart code only), `app/page.tsx` + `app/portfolio/page.tsx` (remove `CardFooter` from imports only)
- Delete: `debug.js`, `debug-build.js`, `simple-server.js`, `start-dev.js`, `netlify.js`, `test-interests-page.js`, `verify-dark-mode.js`, `bash.exe.stackdump`, `interests-light.png`, `interests-dark.png`, `accessibility-report.md`, `bun.lock`, `tsconfig.tsbuildinfo`, `pages/_document.js` (and `pages/` if then empty), `components/Loading.tsx`, `components/portfolio/ProjectMapOriginal.tsx`, `lib/accessibility.tsx`, `lib/performance.ts`, `lib/maps/index.ts`, `app/icons-demo/` (directory), `components/ui/icons/IconsDemo.tsx`, `components/ui/icons/index.tsx`, `components/ui/icons/Icon.tsx`, and in `public/icons/`: `InBug-Black.png`, `book.svg`, `close.svg`, `database.svg`, `document.svg`, `download.svg`, `email.svg`, `external-link.svg`, `fishing-pole-svgrepo.svg`, `fishing-pole.svg`, `geometry.svg`, `lightbulb.svg`, `map.svg`, `menu.svg`, `sprite.svg` (keep `InBug-White.png`, `github-mark.svg`, `github-mark-white.svg`)

**Acceptance Criteria:**
- [ ] `npm run build` succeeds; site renders with paper background (light) and night-field `#14130f` (dark)
- [ ] Inter is gone; computed body font is Hanken Grotesk; `font-display`/`font-mono` utilities resolve to Newsreader/JetBrains Mono
- [ ] ThemeToggle still works (inline sun/moon icons, no sprite request in network tab)
- [ ] `npm ls next-intl chart.js react-chartjs-2` errors (not installed); jest stack still installed
- [ ] None of the deleted files exist; `git status` clean of stackdump/png artifacts
- [ ] `npx jest --ci` passes

**Verify:** `npm run build && npx jest --ci` → both exit 0. `grep -r "next-intl\|ProjectMapOriginal\|icons/sprite" app components lib --include=*.ts*` → no matches.

**Steps:**

- [ ] **Step 1: Delete cruft and dead code** — remove every file in the Delete list above. In `package.json` scripts set `"netlify-build": "next build"`. In `app/portfolio/environmental-justice-prisons/page.tsx` delete the `PercentileHistogram` component definition, its commented-out call site (lines ~585–591), and the `chart.js` / `react-chartjs-2` imports + `ChartJS.register(...)` block. Remove `CardFooter` from the import lists in `app/page.tsx` and `app/portfolio/page.tsx`.

- [ ] **Step 2: Dependency prune** — `npm uninstall next-intl chart.js react-chartjs-2 playwright axe-core`. In `netlify.toml` delete the `[[plugins]] package = "@netlify/plugin-nextjs"` block. Append to `.gitignore`: `out/`, `tsconfig.tsbuildinfo`, `bash.exe.stackdump`.

- [ ] **Step 3: Inline theme icons.** Add to `components/ui/icons/common-icons.tsx` (Lucide sun/moon, 24×24, 2px stroke — matches DS icon spec):

```tsx
export function SunIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

export function MoonIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
```

Rewrite `components/ui/ThemeToggle.tsx` to use `SunIcon`/`MoonIcon` instead of `Icon name="sun|moon"`; keep the mounted-placeholder behavior and aria-label. Then delete `Icon.tsx`, `icons/index.tsx`, `IconsDemo.tsx`, `app/icons-demo/`.

- [ ] **Step 4: Fonts.** Create `app/fonts.ts`:

```ts
import { Newsreader, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';

export const newsreader = Newsreader({
  subsets: ['latin'], style: ['normal', 'italic'],
  weight: ['400', '500', '600'], variable: '--font-display', display: 'swap',
});
export const hanken = Hanken_Grotesk({
  subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans', display: 'swap',
});
export const jetbrains = JetBrains_Mono({
  subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap',
});
```

In `app/layout.tsx`: remove the `Inter` import/instantiation; set
`<body className={`${newsreader.variable} ${hanken.variable} ${jetbrains.variable} font-sans overflow-x-hidden bg-background text-foreground antialiased`}>`.

- [ ] **Step 5: Rewrite `app/globals.css`.** Structure: `@tailwind` directives first, then tokens, then component classes, then the retained app rules. Tokens (DS primitives + semantics; dark `--text-body` is stone-300 per approved DS-6, a deliberate one-step deviation from DS's stone-200; `--text-eyebrow` and `--text-link-hover` are new semantic aliases derived from DS primitives):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Paper (light) — design_system/tokens/colors.css */
    --paper-base: #f7f4ec; --paper-raised: #fdfbf6; --paper-sunken: #efe9dc;
    --surface-page: var(--paper-base);
    --surface-card: var(--paper-raised);
    --surface-sunken: var(--paper-sunken);
    --text-strong: #122114;        /* forest-950 */
    --text-body: #3f3a30;          /* stone-800 */
    --text-muted: #6a624f;         /* stone-600 */
    --text-faint: #847b64;         /* stone-500 */
    --text-link: #495f74;          /* river-700 */
    --text-link-hover: #2f3a47;    /* river-900 */
    --text-eyebrow: #8f5732;       /* earth-700 */
    --brand-primary: #315a34;      /* forest-700 */
    --brand-accent: #c08843;       /* earth-500 */
    --border-hairline: #ddd9cc;    /* stone-200 */
    --border-default: #c4bda9;     /* stone-300 */
    --border-contour: rgba(143, 87, 50, 0.35);
    --ring-focus: #3d733f;         /* forest-600 */
  }
  .dark {
    /* Night field */
    --surface-page: #14130f; --surface-card: #1d1c16; --surface-sunken: #100f0c;
    --text-strong: #f3f1e8;
    --text-body: #c4bda9;          /* stone-300 — DS-6 */
    --text-muted: #a39a82;         /* stone-400 */
    --text-faint: #847b64;
    --text-link: #b3c2cf;          /* river-300 */
    --text-link-hover: #d2dbe3;    /* river-200 */
    --text-eyebrow: #cb9a59;       /* earth-400 */
    --brand-primary: #57935c;      /* forest-500 */
    --brand-accent: #cb9a59;
    --border-hairline: #2c2a22;
    --border-default: #3a372c;
    --border-contour: rgba(203, 154, 89, 0.3);
    --ring-focus: #7bb17f;         /* forest-400 */
  }
  html { text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; }
}

@layer components {
  .eyebrow { @apply font-mono text-xs font-normal uppercase tracking-caps text-eyebrow; }
  .display { @apply font-display font-medium tracking-display leading-tight-display text-ink-strong; }
  .lead { @apply text-lg leading-relaxed text-ink-body; }
  .link-quiet { @apply font-mono text-xs uppercase tracking-caps text-link underline decoration-1 underline-offset-[0.5em] transition-colors duration-200 hover:text-link-hover; }
}
```

Retain (move below the layers): the `prefers-reduced-motion` block and scrollbar rules (re-pointed at stone/forest vars). Delete: `.loading-pulse`, `.skeleton`, `.hover-lift`, `.ripple-hover`, `.animate-in`, the old shadcn HSL variable blocks. Move the six `.maplibregl-popup` rule blocks verbatim into a new `components/portfolio/project-map.css`, imported at the top of `components/portfolio/ProjectMap.tsx`. Keep `slide-in-from-top-2` (Header still uses it; removed in Task 3).

- [ ] **Step 6: Rewrite `tailwind.config.js` theme.** Keep `darkMode: ["class"]`, content globs, container. Replace `theme.extend` with:

```js
extend: {
  colors: {
    forest: { 50:'#f2f7f2',100:'#e4efe4',200:'#c8e0c9',300:'#a5cba7',400:'#7bb17f',500:'#57935c',600:'#3d733f',700:'#315a34',800:'#29472c',900:'#233c25',950:'#122114' },
    earth:  { 50:'#faf6ef',100:'#f2eada',200:'#e6d3b3',300:'#d9b988',400:'#cb9a59',500:'#c08843',600:'#ac7039',700:'#8f5732',800:'#74472f',900:'#613c2b',950:'#351e16' },
    river:  { 50:'#f5f7f9',100:'#e8edf1',200:'#d2dbe3',300:'#b3c2cf',400:'#91aabf',500:'#738ea6',600:'#5b748c',700:'#495f74',800:'#3b4c5d',900:'#2f3a47',950:'#1d242c' },
    stone:  { 50:'#f7f6f2',100:'#eeece4',200:'#ddd9cc',300:'#c4bda9',400:'#a39a82',500:'#847b64',600:'#6a624f',700:'#554e40',800:'#3f3a30',900:'#2b2822',950:'#1a1814' },
    background: 'var(--surface-page)',
    foreground: 'var(--text-body)',
    card: { DEFAULT: 'var(--surface-card)', foreground: 'var(--text-body)' },
    ink: { strong:'var(--text-strong)', body:'var(--text-body)', muted:'var(--text-muted)', faint:'var(--text-faint)' },
    link: { DEFAULT:'var(--text-link)', hover:'var(--text-link-hover)' },
    eyebrow: 'var(--text-eyebrow)',
    accent: { DEFAULT:'var(--brand-accent)' },
    primary: { DEFAULT:'var(--brand-primary)', foreground:'#f2f7f2' },
    border: 'var(--border-hairline)',
    input: 'var(--border-default)',
    ring: 'var(--ring-focus)',
    muted: { DEFAULT:'var(--surface-sunken)', foreground:'var(--text-muted)' },
    secondary: { DEFAULT:'var(--surface-sunken)', foreground:'var(--text-body)' },
    destructive: { DEFAULT:'#a8472f', foreground:'#faf6ef' },
    popover: { DEFAULT:'var(--surface-card)', foreground:'var(--text-body)' },
    contour: 'var(--border-contour)',
  },
  fontFamily: {
    sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
    display: ['var(--font-display)', 'Iowan Old Style', 'Georgia', 'serif'],
    mono: ['var(--font-mono)', 'SF Mono', 'Consolas', 'monospace'],
  },
  letterSpacing: { caps: '0.14em', display: '-0.02em', mono: '0.02em' },
  lineHeight: { 'tight-display': '1.08' },
  borderRadius: { lg: '10px', md: '10px', sm: '6px' },
  keyframes: {
    'slide-in-from-top-2': { from: { transform: 'translateY(-8px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
    rise: { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
  },
  animation: { rise: 'rise 0.8s ease-out forwards' },
}
```

Delete the surface-elevation and text-shadow plugins, the custom zIndex scale, spacing 18/88/128, `2xs`, and the accordion/fade/slide/scale keyframes. Keep only the `tailwindcss-animate` plugin.

- [ ] **Step 7: Verify and commit.** `npm run build && npx jest --ci` → exit 0. Visual smoke: `npm run dev`, confirm paper/night ground + new fonts on `/`. Commit: `feat(foundation): re-ground tokens on design system, swap fonts, remove dead code and cruft`.

---

### Task 2: Background engine — overlay generator + ContourBackdrop

**Goal:** Generate the drafted-key-contours + comet-ignition overlays for both watersheds and both themes, strip the legacy SMIL defs, and expose the whole background as one client component so pages can be server components.

**Files:**
- Create: `scripts/generate-overlays.mjs`, `scripts/strip-smil.mjs`, `components/ui/ContourBackdrop.tsx`
- Modify: `hooks/useThemeBackground.ts`, `components/ui/AnimatedContourBackground.tsx`, `package.json` (script), `__tests__/AnimatedContourBackground.test.tsx`
- Generated: `public/images/american_river_overlay_light.svg`, `american_river_overlay_dark.svg`, `upper_folsom_overlay_light.svg`, `upper_folsom_overlay_dark.svg`

**Acceptance Criteria:**
- [ ] `node scripts/generate-overlays.mjs` emits 4 SVGs, each containing 16 (american river) / N (upper folsom) `.route` paths and per-route comet groups (1 head + 12 followers), speeds clamped 70–150 u/s, fade period ≈8s locked to an integer divisor of travel duration
- [ ] `american_river_contour_bwn.svg` contains zero `glow-trace` occurrences after strip; file shrinks
- [ ] Each page's background renders: static wash + drafted routes + ignition comets in BOTH themes (dark = earth routes/slate comets per treatment D; light = earth-ink routes, deeper-slate comets on paper)
- [ ] `prefers-reduced-motion` still suppresses the overlay entirely
- [ ] Jest passes including updated tests

**Verify:** `node scripts/generate-overlays.mjs && npm run build && npx jest --ci` → exit 0; `grep -c "glow-trace" public/images/american_river_contour_bwn.svg` → 0.

**Steps:**

- [ ] **Step 1: `scripts/strip-smil.mjs`** (run once, idempotent):

```js
import fs from 'node:fs';
const p = 'public/images/american_river_contour_bwn.svg';
let s = fs.readFileSync(p, 'utf8');
const before = s.length;
s = s.replace(/<defs>[\s\S]*?<\/defs>/, '<defs/>');
fs.writeFileSync(p, s);
console.log(`stripped ${(before - s.length)} bytes from ${p}`);
```

Run it; confirm the file still renders (open in browser) and `glow-trace` count is 0.

- [ ] **Step 2: `scripts/generate-overlays.mjs`.** Port `style-explorations/build.js` logic (route parsing, path length, speed clamp, comet sprites, ignition fade) into a generator that loops `WATERSHEDS = ['american_river', 'upper_folsom']` × `THEMES`:

```js
const THEMES = {
  dark: {
    route: { stroke: '#cb9a59', opacity: 0.3 },                      // earth-400 = --border-contour dark
    comet: { headCore: '#d2dbe3', halo: '#91aabf', headPeak: 0.85 }, // river-200 / river-400
  },
  light: {
    route: { stroke: '#8f5732', opacity: 0.35 },                     // earth-700 ink on paper
    comet: { headCore: '#495f74', halo: '#738ea6', headPeak: 0.6 },  // river-700 / river-500 — dark glow reads as ink on paper
  },
};
const COMET = { headR: 5, tailRMax: 4.5, tailRMin: 2, tailN: 12, gapU: 3.5, minSpeed: 70, maxSpeed: 150, fadePeriod: 8 };
```

For each watershed read `public/images/<w>_pulses.svg` (route source of truth), parse `.pN` rules with the regex from build.js, compute path lengths, clamp speeds, and emit `public/images/<w>_overlay_<theme>.svg` containing: `<style>` with `pmove`/`pfade`/`draft` keyframes + per-route classes (fade duration = dur / max(1, round(dur/8)); same negative scatter delay on both animations), a `<g class="routes">` of `pathLength="1"` drafted paths (`stroke-dasharray:1; stroke-dashoffset:1; animation: draft 3s cubic-bezier(.25,.1,.25,1) forwards; animation-delay: i*0.18s`), and the comet `<g>` (head + 12 followers, radius taper 4.5→2, opacity taper `0.7*(1-(k+1)/13)^1.25`, follower delay `scatter + (k+1)*gapU/speed`). pfade keyframes: `0%{opacity:0}14%{opacity:PEAK}45%{opacity:PEAK}62%{opacity:0}100%{opacity:0}`. Copy the exact working implementation from `style-explorations/build.js` — it is the verified reference; only the theming table and dual-watershed loop are new. Add `"generate:overlays": "node scripts/generate-overlays.mjs"` to package.json scripts. The old `*_pulses.svg` files remain as generator inputs but are no longer referenced at runtime.

- [ ] **Step 3: Theme-aware hook.** In `hooks/useThemeBackground.ts` change presets to:

```ts
export const BACKGROUND_PRESETS = {
  americanRiver: {
    lightImage: '/images/american_river_contour_bwn.svg',
    darkImage: '/images/american_river_contour_dark.svg',
    overlayLight: '/images/american_river_overlay_light.svg',
    overlayDark: '/images/american_river_overlay_dark.svg',
  },
  upperFolsom: {
    lightImage: '/images/upper_folsom_contour_bwn.svg',
    darkImage: '/images/upper_folsom_contour_dark.svg',
    overlayLight: '/images/upper_folsom_overlay_light.svg',
    overlayDark: '/images/upper_folsom_overlay_dark.svg',
  },
} as const;
```

Return `animatedSrc: !mounted ? undefined : isDark ? options.overlayDark : options.overlayLight` (replaces `animatedLightSrc`). Keep the mobile detection and `backgroundImage` logic unchanged.

- [ ] **Step 4: `components/ui/ContourBackdrop.tsx`:**

```tsx
'use client';

import { BACKGROUND_PRESETS, useThemeBackground } from '@/hooks/useThemeBackground';
import { AnimatedContourBackground } from '@/components/ui/AnimatedContourBackground';

interface ContourBackdropProps {
  preset: keyof typeof BACKGROUND_PRESETS;
  dual?: boolean;
}

/** Single client-side entry point for the page background so pages stay server components. */
export function ContourBackdrop({ preset, dual = false }: ContourBackdropProps) {
  const { isMobile, backgroundImage, mounted, animatedSrc } = useThemeBackground(BACKGROUND_PRESETS[preset]);
  return (
    <AnimatedContourBackground
      backgroundImage={backgroundImage}
      isMobile={isMobile}
      mounted={mounted}
      animatedSrc={animatedSrc}
      dualBackground={dual}
    />
  );
}
```

`AnimatedContourBackground` needs no structural change (it already fetches+inlines `animatedSrc`); update its props/docs to drop the now-unused `isDark` and rename mentions of "pulse" SVG to "overlay". Update `__tests__/AnimatedContourBackground.test.tsx` for the rename and add a test asserting the overlay re-fetches when `animatedSrc` changes (theme flip):

```tsx
it('refetches when animatedSrc changes', async () => {
  const fetchMock = global.fetch as jest.Mock;
  const { rerender } = render(<AnimatedContourBackground backgroundImage="url(/x.svg)" isMobile={false} mounted animatedSrc="/images/a_overlay_light.svg" />);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/images/a_overlay_light.svg'));
  rerender(<AnimatedContourBackground backgroundImage="url(/x.svg)" isMobile={false} mounted animatedSrc="/images/a_overlay_dark.svg" />);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/images/a_overlay_dark.svg'));
});
```

- [ ] **Step 5: Wire pages minimally.** In the four pages that call `useAmericanRiverBackground`/`useUpperFolsomBackground`, replace the hook + `<AnimatedContourBackground …/>` pair with `<ContourBackdrop preset="americanRiver" />` (resume: `dual`; portfolio: `preset="upperFolsom" dual`). Do NOT remove `'use client'` from pages yet — that happens as each page is rewritten (Tasks 4–8). Delete the now-unused `useAmericanRiverBackground`/`useUpperFolsomBackground` convenience exports.

- [ ] **Step 6: Verify and commit.** Run generator, build, jest. In the browser check both themes on `/` (drafted ochre routes + ignition comets, light and dark). Commit: `feat(background): generated key-contour + comet ignition overlays, theme-aware, single client entry`.

---

### Task 3: Header and Footer re-skin

**Goal:** Quiet, DS-native chrome: translucent paper header with mono nav and ochre active underline; footer compressed to a single hairline-topped band with all existing copy.

**Files:**
- Modify: `components/layout/Header.tsx`, `components/layout/Footer.tsx`, `app/globals.css` (remove `slide-in-from-top-2` after Header stops using it)
- Delete: `components/ui/separator.tsx`; `npm uninstall @radix-ui/react-separator`

**Acceptance Criteria:**
- [ ] Header: `backdrop-blur` paper at 88% (`bg-[color-mix(in_srgb,var(--surface-page)_88%,transparent)]`), hairline bottom border, brand "Devin Hunt" in `font-display`, nav links in `.eyebrow` style with active state = `text-ink-strong` + 2px ochre underline (`decoration-accent underline-offset-8`), NASA EEJ dropdown and mobile menu retained, ThemeToggle retained
- [ ] Footer: one band, `border-t border-border`, all existing strings preserved (about sentences, nav links, contact email, GitHub/LinkedIn, © line), no Separator component, no card chrome
- [ ] No `slide-in-from-top-2` anywhere; mobile menu uses `animate-rise`
- [ ] Build + jest pass

**Verify:** `npm run build && npx jest --ci` → exit 0; `grep -rn "separator\|slide-in-from-top-2" components app --include=*.tsx --include=*.css` → no matches; sentinel `grep -c "Based in California" components/layout/Footer.tsx` → 1.

**Steps:**

- [ ] **Step 1: Header.** Keep `usePathname` active-link logic, dropdown, hamburger, ThemeToggle placement. Replace the visual classes: bar = `fixed top-0 inset-x-0 z-50 border-b border-border bg-[color-mix(in_srgb,var(--surface-page)_88%,transparent)] backdrop-blur-[10px]`; brand link = `font-display text-lg font-medium text-ink-strong`; `NavLink` = `eyebrow transition-colors hover:text-ink-strong` + active: `text-ink-strong underline decoration-accent decoration-2 underline-offset-8`. Mobile panel: `bg-background border-b border-border animate-rise`.
- [ ] **Step 2: Footer.** Single `<footer className="border-t border-border mt-24">` containing a container row (`flex flex-col gap-6 md:flex-row md:items-start md:justify-between py-10`): block 1 = name (`font-display text-ink-strong`) + the two about sentences (`text-sm text-ink-muted max-w-xs`); block 2 = nav links as `.link-quiet` column (Home / Resume / Portfolio / Personal Interests); block 3 = `contact@devinhunt.com` as `.link-quiet` + GitHub/LinkedIn icons (existing components, `text-ink-muted hover:text-ink-strong`). Below: `© {year} Devin Hunt. All rights reserved.` in `font-mono text-2xs… ` — `2xs` was removed; use `text-[0.6875rem] text-ink-faint`. Remove `Separator` import/usage, then delete the component file and uninstall the Radix dep.
- [ ] **Step 3:** Remove the `slide-in-from-top-2` keyframe from globals.css. Verify, then commit: `feat(chrome): editorial header and single-band footer on DS tokens`.

---

### Task 4: Home page

**Goal:** Server-component home: treatment-D hero (DS-6), expertise as three quiet text columns, passions as two plain linked entries, photo + Muir quote kept with a caption instead of a gradient overlay.

**Files:**
- Modify: `app/page.tsx` (full rewrite; copy preserved)

**Acceptance Criteria:**
- [ ] No `'use client'` in `app/page.tsx`; only client child is `ContourBackdrop`
- [ ] Hero: eyebrow "Water Resources Engineer & Explorer" (`.eyebrow`), `h1` "Devin Hunt" (`.display`, `clamp(3rem,7vw,5.25rem)`), intro paragraph (`.lead`, max-w-[34rem]), links "Explore Portfolio" + "View Resume" as `.link-quiet` — no Button, no Card anywhere on the page
- [ ] All copy strings from the current page present verbatim (hero paragraph, 3 expertise titles+bodies, 2 passion titles+descriptions+bodies, Muir quote, image alt)
- [ ] Muir quote rendered as a `font-display italic` caption under the photo, not a gradient overlay
- [ ] Staggered `animate-rise` load-in on hero children only; honors reduced motion (animation, not opacity-hiding, so content visible without JS)
- [ ] Build + jest pass

**Verify:** `npm run build && npx jest --ci`; `grep -c "use client" app/page.tsx` → 0; sentinels: `grep -c "Passionate about understanding" app/page.tsx` → 1, `grep -c "First Generation Tundra" app/page.tsx` → 1, `grep -c "good look at it before it gets dark" app/page.tsx` → 1.

**Steps:**

- [ ] **Step 1: Rewrite.** Skeleton (every string below already exists in the current file — carry them over exactly; long bodies elided here with `…existing copy…` markers meaning copy the current literal):

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <ContourBackdrop preset="americanRiver" />
      <div className="container relative z-10 mx-auto px-6">
        <section className="flex min-h-[82vh] flex-col justify-center max-w-3xl">
          <p className="eyebrow mb-6 animate-rise">Water Resources Engineer &amp; Explorer</p>
          <h1 className="display mb-9 text-[clamp(3rem,7vw,5.25rem)] animate-rise [animation-delay:120ms] opacity-0 motion-reduce:opacity-100">Devin Hunt</h1>
          <p className="lead mb-12 max-w-[34rem] animate-rise [animation-delay:260ms] opacity-0 motion-reduce:opacity-100">…existing hero paragraph…</p>
          <nav className="flex gap-12 animate-rise [animation-delay:400ms] opacity-0 motion-reduce:opacity-100">
            <Link href="/portfolio" className="link-quiet">Explore Portfolio</Link>
            <Link href="/resume" className="link-quiet">View Resume</Link>
          </nav>
        </section>

        <section className="grid gap-12 py-24 md:grid-cols-[1fr_1fr] md:items-center">
          <div className="relative h-[320px] md:h-[380px]">
            <Image src="/images/profile.jpg" alt="…existing alt…" fill priority className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw" placeholder="blur" blurDataURL="…existing blurDataURL…" />
          </div>
          <figure>
            <blockquote className="font-display italic text-xl leading-snug text-ink-strong">
              “The world is big, and I want to have a good look at it before it gets dark.”
            </blockquote>
            <figcaption className="eyebrow mt-4">John Muir</figcaption>
          </figure>
        </section>

        <section className="py-24">
          <h2 className="eyebrow mb-10">Professional Expertise</h2>
          <div className="grid gap-12 md:grid-cols-3">
            {/* one block per expertise item — no Card */}
            <div>
              <h3 className="font-display text-xl text-ink-strong mb-3">Water Resources Engineering</h3>
              <p className="text-ink-body leading-relaxed">…existing body…</p>
            </div>
            {/* Geospatial Analysis, Data-Driven Approaches — same pattern */}
          </div>
        </section>

        <section className="pb-28">
          <h2 className="eyebrow mb-10">Personal Passions</h2>
          <div className="grid gap-12 md:grid-cols-2">
            <Link href="/interests#exploration" className="group block">
              <h3 className="font-display text-xl text-ink-strong mb-1 group-hover:text-eyebrow transition-colors">Exploration</h3>
              <p className="font-mono text-xs tracking-mono text-ink-muted mb-3">Discovering remote natural places</p>
              <p className="text-ink-body leading-relaxed">…existing body…</p>
            </Link>
            {/* Fishing — same pattern, href="/interests#fishing" */}
          </div>
        </section>
      </div>
    </div>
  );
}
```

Note the section-2 change: the Muir quote moves from photo-overlay to an adjacent `figure` (content preserved, gradient overlay and `text-shadow` removed). MapIcon/FishIcon decorations are dropped (gratuitous). The `animate-rise`+`opacity-0` pattern must include `motion-reduce:opacity-100 motion-reduce:animate-none`.

- [ ] **Step 2:** Build, jest, visual check both themes against `style-explorations/d-night-drafting.html`. Commit: `feat(home): editorial server-component home on treatment D`.

---

### Task 5: Portfolio index

**Goal:** Replace the card grid with an editorial project index (eyebrow · Newsreader title · prose · mono tech line · quiet links), tabs restyled as understated mono filters in a small client island; maps load via real dynamic import; harvest-water stops rendering a wrong-basin placeholder map.

**Files:**
- Create: `components/portfolio/ProjectIndex.tsx` (client)
- Modify: `app/portfolio/page.tsx` (server shell), `components/portfolio/LazyProjectMap.tsx`, `lib/portfolio-data.ts` (displayType only), `lib/maps/mapConfigurations.ts` (drop configs pointing at missing geojson)
- Test: extend `__tests__` only if existing tests break

**Acceptance Criteria:**
- [ ] `app/portfolio/page.tsx` is a server component rendering header copy + `<ProjectIndex projects={PROJECTS} />` + `<ContourBackdrop preset="upperFolsom" dual />`
- [ ] Each project row: `.eyebrow` line `{description} · {year}` (mono, uppercase), `font-display` title, existing paragraphs, technologies as one `font-mono text-xs text-ink-muted` line joined with " · ", links as `.link-quiet` — zero Card/badge/pill components
- [ ] Tabs: Radix Tabs retained for a11y but restyled — `TabsList` transparent, triggers `.eyebrow` with active `text-ink-strong underline decoration-accent decoration-2 underline-offset-8`; counts kept
- [ ] `harvest-water` has `displayType: 'image'`→ no map (it has no image either: set `displayType: 'none'` and render text-only row; add `'none'` to the Project type union); map configs referencing `cuyama_subbasin.geojson`, `yuba_subbasins.geojson`, `i03_WaterDistricts_seasonality.geojson` removed
- [ ] `LazyProjectMap` uses `next/dynamic(() => import('./ProjectMap'), { ssr: false, loading })` so maplibre is code-split out of the main bundle
- [ ] prison-ej and watershed-hub maps still render and interact
- [ ] Build + jest pass

**Verify:** `npm run build && npx jest --ci`; `grep -c "use client" app/portfolio/page.tsx` → 0; `grep -c "next/dynamic" components/portfolio/LazyProjectMap.tsx` → 1; sentinels `grep -c "Caitlin Mothes" lib/portfolio-data.ts` → ≥1, `grep -c "8 million records" lib/portfolio-data.ts` → 1. After build, confirm maplibre chunk is separate: `grep -L maplibre out/_next/static/chunks/app/page*.js` (home chunk has none).

**Steps:**

- [ ] **Step 1: LazyProjectMap → real dynamic import:**

```tsx
'use client';
import dynamic from 'next/dynamic';

const ProjectMap = dynamic(() => import('./ProjectMap'), {
  ssr: false,
  loading: () => <div className="h-[420px] w-full bg-surface-sunken" aria-label="Loading map" />,
});

export default ProjectMap;
```

(Adjust `ProjectMap` to a default export; keep the existing `MapErrorBoundary` by wrapping inside `ProjectMap` itself or re-exporting the boundary here — preserve current error fallback behavior.) Note `bg-surface-sunken` requires the Task 1 color `muted.DEFAULT`; use `bg-muted`.

- [ ] **Step 2: Data hygiene.** In `lib/portfolio-data.ts` add `'none'` to the `displayType` union and set `harvest-water` to `displayType: 'none'`. In `lib/maps/mapConfigurations.ts` delete the entries whose `data` paths do not exist in `public/data/` (`cuyama_subbasin.geojson`, `yuba_subbasins.geojson`, `i03_WaterDistricts_seasonality.geojson`) and any `PROJECT_CONFIGS` keys that only pointed at them; keep `prison-ej` and `watershed-hub` (HUC8) intact.

- [ ] **Step 3: ProjectIndex client island.** `components/portfolio/ProjectIndex.tsx`: `'use client'`; props `{ projects: Project[] }`; owns the Tabs state (reuse current category filtering via `getProjectsByCategory`). Row layout per project:

```tsx
<article key={project.id} className="border-t border-border py-12 first:border-t-0">
  <p className="eyebrow mb-2">{project.description} · {project.year}</p>
  <h2 className="font-display text-2xl text-ink-strong mb-4">{project.title}</h2>
  {project.content.map((para) => (
    <p key={para.slice(0, 24)} className="text-ink-body leading-relaxed mb-4 max-w-[40rem]">{para}</p>
  ))}
  <p className="font-mono text-xs tracking-mono text-ink-muted mb-4">{project.technologies.join(' · ')}</p>
  {project.displayType === 'map' && <LazyProjectMap projectId={project.id} />}
  {project.displayType === 'image' && (
    <figure className="my-6 max-w-[40rem]">
      <img src={project.image} alt={project.imageAlt} className="w-full" loading="lazy" />
      {project.imageCaption && <figcaption className="eyebrow mt-2">{project.imageCaption}</figcaption>}
    </figure>
  )}
  <nav className="flex gap-8">{project.links?.map((l) => <a key={l.url} href={l.url} className="link-quiet">{l.label}</a>)}</nav>
</article>
```

(Adapt prop names to the actual `Project` interface fields — read `lib/portfolio-data.ts` first; the interface field names there are authoritative.) One hairline `border-t` between rows is the only line on the page — it separates repeating content entries, which the content requires.

- [ ] **Step 4: Server shell.** `app/portfolio/page.tsx`: no `'use client'`; render `<ContourBackdrop preset="upperFolsom" dual />`, `h1` "Portfolio" as `.display text-4xl`, existing subhead paragraph as `.lead`, then `<ProjectIndex projects={PROJECTS} />`.

- [ ] **Step 5:** Build, jest, browser check (tabs filter, both maps work, no pills/cards). Commit: `feat(portfolio): editorial project index, dynamic maplibre, prune dead map configs`.

---

### Task 6: Resume page

**Goal:** Print-like editorial resume: no wrapping Card, no focus-ring/tabIndex on prose, valid download link, all resume copy verbatim.

**Files:**
- Modify: `app/resume/page.tsx`, `components/resume/ResumeSection.tsx`, `components/resume/ExperienceItem.tsx`, `components/resume/SkillsList.tsx`

**Acceptance Criteria:**
- [ ] Server component; `<ContourBackdrop preset="americanRiver" dual />`
- [ ] No Card; sections are plain `<section>` with `.eyebrow` section titles; no `tabIndex`, no focus-ring classes on non-interactive elements
- [ ] Download is `<a href="/data/devin_hunt_resume_june2025.pdf" download className="link-quiet">Download PDF</a>` — no Button-wrapping-anchor
- [ ] ExperienceItem: `font-display` job title, `font-mono text-xs` company · period line, responsibilities as `list-disc` with `marker:text-eyebrow` (no manual `•` spans); SkillsList same list treatment
- [ ] Every job, bullet, education line, skill, and achievement string preserved verbatim
- [ ] Build + jest pass

**Verify:** `npm run build && npx jest --ci`; `grep -c "tabIndex" app/resume/page.tsx components/resume/*.tsx` → 0; sentinels: `grep -c "Woodard" app/resume/page.tsx` → ≥1, `grep -c "EAGLE SCOUT AWARD" app/resume/page.tsx` → 1, `grep -c "Fraser Experimental Forest" app/resume/page.tsx` → ≥1.

**Steps:**

- [ ] **Step 1:** Rewrite `ResumeSection` to `<section className="py-10"><h2 className="eyebrow mb-6">{title}</h2>{children}</section>`. Rewrite `ExperienceItem`: heading `font-display text-xl text-ink-strong`, meta line `font-mono text-xs tracking-mono text-ink-muted` (`{company} · {period}`), `<ul className="mt-3 list-disc pl-5 space-y-1 text-ink-body leading-relaxed marker:text-eyebrow">`. `SkillsList` → same `ul` recipe.
- [ ] **Step 2:** Rewrite the page: header row with `h1` "Resume" (`.display text-4xl`) and the download link; name + title + italic summary as a lead block (`font-display italic` for the summary, per DS pull-quote voice); then the three sections via the rewritten components. Remove all `focus-within:*`/`tabIndex` props.
- [ ] **Step 3:** Build, jest, sentinel greps, visual check both themes. Commit: `feat(resume): print-like editorial resume, valid download link`.

---

### Task 7: Interests page

**Goal:** De-carded alternating editorial sections with Newsreader italic pull-quotes; the 2-image carousel replaced by both contour plates shown plainly.

**Files:**
- Modify: `app/interests/page.tsx`, `components/interests/InterestSection.tsx`

**Acceptance Criteria:**
- [ ] Server component; `<ContourBackdrop preset="americanRiver" />`; no `useState` anywhere on the page
- [ ] `InterestSection`: no Card, no hover-shadow, no `tabIndex`; layout alternates image left/right (`md:flex-row` / `md:flex-row-even:flex-row-reverse` via an `index` prop or `odd:`/`even:` utilities); image captions in `.eyebrow`; quotes in `font-display italic text-xl text-ink-strong` with attribution in `.eyebrow`
- [ ] GIS section: heading + both paragraphs verbatim; the two contour SVGs rendered side-by-side (`grid md:grid-cols-2 gap-6`, plain `<img>` with existing alts) — carousel, its state, handlers, chevron buttons, and dot indicators deleted
- [ ] All 7 sections' copy verbatim incl. quotes, attributions, alts, captions; "Get Involved" external link as `.link-quiet`
- [ ] Anchors `#exploration` … `#gis` preserved (home links + EJ links depend on them)
- [ ] Build + jest pass

**Verify:** `npm run build && npx jest --ci`; `grep -c "useState" app/interests/page.tsx` → 0; sentinels: `grep -c "Shafer Trail" app/interests/page.tsx` → 1, `grep -c "Fishbrain" app/interests/page.tsx` → 1, `grep -c "lets collaborate" app/interests/page.tsx` → 1.

**Steps:**

- [ ] **Step 1:** Rewrite `InterestSection` (keep its props interface compatible with the `interestSections` data array):

```tsx
export function InterestSection({ id, title, image, imageAlt, imageCaption, quote, quoteAuthor, paragraphs, link, flip }: InterestSectionProps) {
  return (
    <section id={id} className={`flex flex-col gap-10 py-16 md:items-center ${flip ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
      <figure className="md:w-5/12">
        <img src={image} alt={imageAlt} loading="lazy" className="w-full" />
        {imageCaption && <figcaption className="eyebrow mt-3">{imageCaption}</figcaption>}
      </figure>
      <div className="md:w-7/12">
        <h2 className="font-display text-2xl text-ink-strong mb-4">{title}</h2>
        {quote && (
          <blockquote className="font-display italic text-xl leading-snug text-ink-strong mb-2">{quote}</blockquote>
        )}
        {quoteAuthor && <p className="eyebrow mb-6">{quoteAuthor}</p>}
        {paragraphs.map((p) => <p key={p.slice(0, 24)} className="text-ink-body leading-relaxed mb-4">{p}</p>)}
        {link && <a href={link.url} className="link-quiet" target="_blank" rel="noopener noreferrer">{link.label}</a>}
      </div>
    </section>
  );
}
```

(Field names must match the existing `interestSections` array — read the current file first and adapt prop names, not the data.) Pass `flip={index % 2 === 1}` from the page map.

- [ ] **Step 2:** Page rewrite: drop `'use client'`, `useState`, carousel handlers and chevrons; `h1` "Personal Interests" as `.display text-4xl`; map sections; GIS block renders heading, the two existing paragraphs, then the two contour `<img>`s in a 2-col grid with their existing alt texts.
- [ ] **Step 3:** Build, jest, anchors check (`/interests#fishing` scrolls), visual check. Commit: `feat(interests): alternating editorial sections, carousel removed`.

---

### Task 8: EJ-prisons deep dive

**Goal:** Keep the flagship's depth and all substantive copy, remove the chrome: no card stacks, no auto-popup, one GitHub CTA, contour backdrop instead of the gradient, indicator browser as a quiet client island.

**Files:**
- Modify: `app/portfolio/environmental-justice-prisons/page.tsx`
- Create: `components/portfolio/IndicatorBrowser.tsx` (client island: tabs + indicator list + map + detail panel, extracted from the page)

**Acceptance Criteria:**
- [ ] Page is a server component; interactive map/indicator logic lives in `IndicatorBrowser` (`'use client'`), receiving `COMPONENT_CONFIGS` as a plain data import
- [ ] `<ContourBackdrop preset="upperFolsom" />` replaces the `bg-gradient-to-br` wrapper; hero is a text block (eyebrow `GEOSPATIAL ANALYSIS · NASA GRANT · 2022-2023`-style line built from existing strings, `.display` title, existing subtitle, two hero links as `.link-quiet`)
- [ ] Deleted (approved removals — UI chrome, not content): the auto-showing `MapInstructionsPopup` card and its 5 instruction bullets, replaced by one existing-derived caption? NO — replaced by nothing; the map keeps its native controls. Also deleted: the duplicate footer CTA "Access Repository" (hero already links the repo) and the blue active-dot tab decoration
- [ ] Kept verbatim: overview paragraphs, key objectives list, all 12 indicator names/descriptions + data-source/methodology text, team entries, role bullets, impact paragraphs, blockquote, acknowledgment, "Explore the Research" + its paragraph + "Back to Portfolio"
- [ ] Sections are plain prose blocks with `.eyebrow` section titles; indicator list = text rows with active state `text-ink-strong` + ochre underline (no shadow-md cards); map container has a hairline border only
- [ ] Build + jest pass

**Verify:** `npm run build && npx jest --ci`; `grep -c "use client" app/portfolio/environmental-justice-prisons/page.tsx` → 0; sentinels: `grep -c "1,865" app/portfolio/environmental-justice-prisons/page.tsx components/portfolio/IndicatorBrowser.tsx` → ≥2, `grep -c "Carrie Chennault" app/portfolio/environmental-justice-prisons/page.tsx` → 1; `grep -c "Select a tab to view indicators" components/portfolio/IndicatorBrowser.tsx app/portfolio/environmental-justice-prisons/page.tsx` → 0 (popup removed).

**Steps:**

- [ ] **Step 1:** Extract `COMPONENT_CONFIGS`, tab state, indicator selection, and `LazyProjectMap` usage into `components/portfolio/IndicatorBrowser.tsx`. Restyle: Radix Tabs triggers = `.eyebrow` + active ochre underline (same recipe as Task 5); indicator rows = `<button className="block w-full text-left py-2 font-mono text-xs uppercase tracking-caps text-ink-muted data-[active=true]:text-ink-strong data-[active=true]:underline data-[active=true]:decoration-accent data-[active=true]:decoration-2 data-[active=true]:underline-offset-4">`; detail panel = plain prose under the list (`.eyebrow` label + body text). Delete `MapInstructionsPopup` and `showInstructions` state. Map wrapper: `border border-border`.
- [ ] **Step 2:** Rewrite the page shell as server component: hero text block, overview section, `<IndicatorBrowser />`, team/role/impact as prose sections (`.eyebrow` titles, `font-display` subheads, lists as `list-disc marker:text-eyebrow`), blockquote in `font-display italic`, final CTA section with the existing heading/paragraph and only "Back to Portfolio" as `.link-quiet` (plus keep "Access Repository"? No — hero's "Published Dataset" already points there; keep only "Back to Portfolio").
- [ ] **Step 3:** Build, jest, browser check: tabs, indicator switching, hover popups on the map, both themes. Commit: `feat(ej-prisons): de-carded deep dive on contour backdrop, single repo CTA`.

---

### Task 9: Finale — 404, metadata, performance pass, config single-sourcing

**Goal:** Re-skin 404, compress heavy assets, code-split sanity, one CSP source, remove proxy scripts if tiles verify, final sweep.

**Files:**
- Modify: `app/not-found.tsx`, `app/layout.tsx`, `netlify.toml`, `public/_headers`, `next.config.js` (comment only), `package.json`
- Create: `scripts/compress-images.mjs`
- Delete (conditional): `public/map-proxy.js`, `public/map-library-helper.js`, `public/netlify-config.js`, `netlify/functions/map-proxy.js`
- Modify: `public/images/*` (5 photos → .webp; contour SVGs precision-reduced), `lib/portfolio-data.ts` + `app/interests/page.tsx` + `app/page.tsx` (image extensions)

**Acceptance Criteria:**
- [ ] 404 re-skinned: `.display` "404", existing copy verbatim, links as `.link-quiet`, no Card
- [ ] `map-library-helper.js` deleted unconditionally (verified no-op). With dev server running and those scripts removed from `layout.tsx`, the prison-ej map loads tiles from `tiles.openfreemap.org` (check network tab) → then delete `map-proxy.js`, `netlify-config.js`, and `netlify/functions/map-proxy.js`; if tiles fail, keep `map-proxy.js` + function and load the script only on map pages — record which branch happened
- [ ] CSP defined exactly once (in `public/_headers`); inline `<meta httpEquiv>` removed from layout; `[[headers]]` CSP block removed from netlify.toml; `font-src 'self'` retained (next/font self-hosts)
- [ ] The 5 photos >800KB (`antelope_valley_LACPW_district40.png`, `yuba_recharge_suitability_index_preview.png`, `modesto_infiltration_snyderWest.jpg`, `photography.jpg`, `bicycle_kitchen.jpg`) converted to WebP ≤300KB each, references updated, originals deleted
- [ ] Contour SVGs pass `svgo` with `--config` setting `cleanupNumericValues` precision 1 (test render before/after — no visible change at 10–35% opacity); combined size of the two `_bwn` + two `_dark` SVGs reduced ≥30%
- [ ] `npm run build` output: no maplibre code in the home-page chunk; total `out/` size reported in the commit message
- [ ] Full manual pass: all 6 routes × both themes × reduced-motion render correctly
- [ ] Build + jest pass

**Verify:** `npm run build && npx jest --ci`; `grep -rc "Content-Security-Policy" app/layout.tsx netlify.toml` → 0 each, `grep -c "Content-Security-Policy" public/_headers` → 1; `ls public/images/*.webp | wc -l` → 5; `node -e "const fs=require('fs');for (const f of ['american_river_contour_bwn.svg','american_river_contour_dark.svg','upper_folsom_contour_bwn.svg','upper_folsom_contour_dark.svg']) console.log(f, fs.statSync('public/images/'+f).size)"` → all smaller than the Task-0 sizes (851K/781K/542K/~500K).

**Steps:**

- [ ] **Step 1: 404.** Rewrite `app/not-found.tsx`: `.display` "404" + "Page Not Found", existing card copy as plain prose (`"Looks like this stream dried up!"` as `font-display` subhead, both body paragraphs, Frost blockquote in `font-display italic`), links Return Home / View Portfolio / Resume / Interests / email as `.link-quiet` row. No Card/Button.
- [ ] **Step 2: Image compression.** `scripts/compress-images.mjs` using `sharp` (devDep): read the 5 listed photos, `.webp({ quality: 82 })`, max width 1600px, write alongside, then delete originals and update the referencing string literals (extensions only) in `lib/portfolio-data.ts`, `app/interests/page.tsx`, `app/page.tsx` if profile.jpg is over budget (it isn't — leave it). `npm i -D sharp`, run, `npm un sharp` after (or keep as devDep — keep, the script is reusable).
- [ ] **Step 3: SVG precision.** `npx svgo public/images/american_river_contour_bwn.svg public/images/american_river_contour_dark.svg public/images/upper_folsom_contour_bwn.svg public/images/upper_folsom_contour_dark.svg --multipass -p 1 -o <same paths>` — then re-run `node scripts/generate-overlays.mjs` ONLY if svgo touched the pulses inputs (it must not — do not pass `*_pulses.svg` or `*_overlay_*.svg` to svgo; routes must keep matching the backdrop geometry). Visual before/after check at both themes.
- [ ] **Step 4: Scripts + CSP.** Remove the three `<Script>` tags and the CSP `<meta>` from `app/layout.tsx`. Run the tile verification described in AC; delete or scope accordingly. Single-source CSP in `public/_headers`; delete the `[[headers]]` CSP block in netlify.toml (keep the other security headers there or move them into `_headers` too — pick `_headers` as the single home for all of them and strip netlify.toml to build settings + redirects).
- [ ] **Step 5: Final sweep.** All routes × themes × `prefers-reduced-motion` emulation; confirm comet ignition on every contour page; record `out/` total size. Commit: `feat(finale): 404 re-skin, asset compression, single-source CSP, proxy removal`.

---

## Self-Review Notes

- Spec coverage: brief's signature element (T2), minimalist constraints (T3–T8 ACs), copy preservation (sentinel greps every page task), performance budget (T2 composited-only + T9 asset pass), remove-don't-add (T1 + per-task deletions) — covered.
- Type consistency: `ContourBackdrop` props (`preset`, `dual`) used identically in T2/T4/T5/T6/T7/T8; `displayType: 'none'` introduced in T5 and only used there; `animatedSrc` rename (T2) is reflected in the T2 test code and component props.
- Known judgment calls for the Opus reviewer to scrutinize: home photo/quote re-composition (T4), EJ instructions-popup deletion (T8), harvest-water `displayType: 'none'` (T5), dark body stone-300 vs DS stone-200 (T1, user-approved via DS-6).
