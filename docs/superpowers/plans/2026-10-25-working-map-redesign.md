# The Working Map Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio pages of devinhunt.com (home, portfolio, résumé, EEJ project page, outdoors, 404) in the approved "Working Map" design: Public Sans, a readout strip, the breathing contour plate cleared behind the hero, and projects drawn as spatial glyphs, with the Stan Scribe pages left exactly as they are.

**Architecture:** Next.js route groups split the app into `app/(site)` (portfolio, new chrome) and `app/(stanscribe)` (legacy chrome) without changing URLs. The new system is scoped to a `.site` wrapper that remaps the existing semantic CSS tokens, so every existing component (the contour backdrop's glow included) takes the new palette inside the portfolio and the old one outside it. Glyphs and the résumé map are computed from `public/data` geometry at build time on the server and drawn by small client components that feed a shared readout context.

**Tech Stack:** Next.js 14 App Router (static export), React 18, TypeScript, Tailwind 3.4, next/font (Public Sans), Jest 29 + React Testing Library (jsdom).

**Spec:** `DESIGN.md` (approved design system, tokens, page blueprints) and `PRODUCT.md` (product truth). Reference prototypes: `.taste-skill/proto/c3/` (gitignored) and https://claude.ai/artifact/NKpPGPwhhGFPPXEC1eN8GV.

## Global Constraints

- Values come from `DESIGN.md`: colours, the six type roles, `clamp(16px, 3vw, 40px)` margins, `clamp(64px, 9vw, 128px)` section rhythm, 860px and 520px breakpoints, square corners, no shadows at rest, no gradients, no monospace, sentence case.
- Stan Scribe pages (`/stanscribe`, `/stanscribe-light`, their legal pages) must not change visually: legacy `Header`/`Footer`, Newsreader/Hanken, legacy tokens. All existing Stan Scribe tests keep passing.
- URLs do not change. The site stays a static export; `npm run build` must produce `out/index.html`, `out/portfolio.html`, `out/portfolio/environmental-justice-prisons.html`, `out/resume.html`, `out/interests.html`, `out/404.html`, `out/stanscribe/index.html`, `out/stanscribe-light/index.html`.
- Copy comes only from `lib/portfolio-data.ts`, the résumé page, `PRODUCT.md`, or this plan. No new claims, metrics, testimonials or locations. Approximate coordinates stay commented as approximate.
- No new dependencies.
- After every task: `npx jest --ci` and `npm run build` both pass.
- Accessibility: visible focus (2px, 3px offset), keyboard path to every interactive element including map pins, `prefers-reduced-motion` respected (the existing global rule and the backdrop's own gating), alt text on every image.
- One commit per task on branch `dev/redesign_1026`, conventional message (`feat(site): …`, `refactor(site): …`), ending with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. `.md` files are gitignored except the exceptions in `.gitignore`; plan files need `git add -f`.
- The dev server for browser checks runs on port 3100 (`npx next dev -p 3100`); port 3000 belongs to another project.

**User decisions (already made):**
- "I really like the look of direction C" combined with "the original website with background contours and its intricate effects."
- "Not a fan of the A and B image presentation"; "take photos out of the main focus"; project items "clean and minimal"; "I do not like the Table format."
- "The interactive map is too much for the hero… move that to the header of the resume page."
- "Move the 'where the work is' of projects to the portfolio page."
- Home highlights: "Environmental Justice for Prisons, Yuba Subbasins Recharge Analysis, AIIWFM, the ZBudget Dashboards (coming soon), and Stan Scribe."
- "The spatial visual icon of the Work projects is cool and should be preserved."
- ZBudget Dashboards: "A fast, powerful IWFM model diagnostic and results viewing dashboard with interactive map and charts. 'Streamlining model review and report generation'."
- B118 subbasins come from local data (recovered from git history: `7d9b0b9^`).
- Résumé title: keep or "incorporate AI Specialist… title can be mixed"; ideal position "AI development and company operations." This plan uses "AI Specialist and Groundwater Modeler".
- Light-theme plates: "keep light as is."
- Stan Scribe gets its own direction later, as a separate product.

---

## File Structure

| Path | Responsibility |
| --- | --- |
| `app/layout.tsx` | Root html/body, fonts, theme provider, skip link. No header/footer. |
| `app/(site)/layout.tsx` | Portfolio pages: wraps them in `SiteChrome`. |
| `app/(stanscribe)/layout.tsx` | Stan Scribe pages: legacy `Header` + `main` + `Footer`. |
| `app/(site)/page.tsx`, `portfolio/…`, `resume/…`, `interests/…` | The portfolio pages (moved, then rebuilt). |
| `app/not-found.tsx` | 404, wrapped in `SiteChrome` itself (root not-found sits outside route groups). |
| `app/fonts.ts` | Adds Public Sans as `--font-site`. |
| `app/globals.css` | `.site` token scope, dark and print variants, band/halo/clearing, glyph tones, map styles. |
| `tailwind.config.js` | `site` colours, `font-site`, `text-site-*` sizes, `gutter`/`section` spacing. |
| `components/site/type.ts` | `SITE_TYPE` roles, `SITE_BUTTON`, `SITE_LINK`, `SITE_SOON`. |
| `components/site/Readout.tsx` | Readout context, strip, page default, pointer/focus handlers. |
| `components/site/SiteHeader.tsx`, `SiteFooter.tsx`, `SiteChrome.tsx` | The portfolio frame. |
| `components/site/Glyph.tsx` | Draws a `GlyphShape`. |
| `components/site/WorkList.tsx`, `ProjectsIndex.tsx` | Portfolio entries (expandable) and filters. |
| `components/site/Highlights.tsx` | Home lead project and highlight list. |
| `components/site/WatershedMap.tsx` | Résumé header map. |
| `lib/site/reading.ts` | Readout data types, coordinate formatting, plate and place readings. |
| `lib/site/geo.ts` | Projection, point-in-polygon, fitting, SVG path data. |
| `lib/site/glyphs.ts` | Glyph builders (pure). |
| `lib/site/geodata.ts` | Reads `public/data` geometry (server, build time). |
| `lib/site/work.ts` | Project/tool view models with glyphs and readings. |
| `lib/site/map.ts` | Résumé map data. |
| `lib/portfolio-data.ts` | Adds summary, place, glyph, location, readout per project; `TOOLS`; `HIGHLIGHTS`. |
| `public/data/cuyama_subbasin.geojson`, `yuba_subbasins.geojson` | DWR Bulletin 118 polygons, restored. |
| `__tests__/site/*` | Tests for all of the above. |

---

### Task 1: Split the app into route groups

**Goal:** Move the portfolio routes into `app/(site)` and the Stan Scribe routes into `app/(stanscribe)`, each with its own layout, so the two can carry different chrome; URLs and rendering stay the same.

**Files:**
- Move: `app/page.tsx` → `app/(site)/page.tsx`; `app/portfolio/` → `app/(site)/portfolio/`; `app/resume/` → `app/(site)/resume/`; `app/interests/` → `app/(site)/interests/`
- Move: `app/stanscribe/` → `app/(stanscribe)/stanscribe/`; `app/stanscribe-light/` → `app/(stanscribe)/stanscribe-light/`
- Create: `app/(site)/layout.tsx`, `app/(stanscribe)/layout.tsx`
- Modify: `app/layout.tsx`, `app/not-found.tsx`
- Modify (imports): `__tests__/stanscribe/HomePanel.test.tsx`, `__tests__/stanscribe/StanScribePage.test.tsx`, `__tests__/stanscribe/StanScribeLightPage.test.tsx`

**Acceptance Criteria:**
- [ ] `npx jest --ci` passes with the same test count as before the move.
- [ ] `npm run build` exits 0 and `out/` contains every file listed in Global Constraints.
- [ ] The second-line path comment in each moved file names its new path.
- [ ] Every page renders the legacy header and footer exactly as before (both layouts use them in this task).

**Verify:** `npx jest --ci && npm run build && ls out/index.html out/portfolio.html out/portfolio/environmental-justice-prisons.html out/resume.html out/interests.html out/404.html out/stanscribe/index.html out/stanscribe-light/index.html`

**Steps:**

- [ ] **Step 1: Move the routes**

```bash
mkdir -p "app/(site)" "app/(stanscribe)"
git mv app/page.tsx "app/(site)/page.tsx"
git mv app/portfolio "app/(site)/portfolio"
git mv app/resume "app/(site)/resume"
git mv app/interests "app/(site)/interests"
git mv app/stanscribe "app/(stanscribe)/stanscribe"
git mv app/stanscribe-light "app/(stanscribe)/stanscribe-light"
```

In each moved file, change the second line (`// app/page.tsx` and so on) to the new path, e.g. `// app/(site)/page.tsx`.

- [ ] **Step 2: Create the two group layouts**

`app/(stanscribe)/layout.tsx`:

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(stanscribe)/layout.tsx
// The Stan Scribe pages keep the June 2026 site chrome until they get their own product site.

import type { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function StanScribeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </>
  );
}
```

`app/(site)/layout.tsx` (Task 4 replaces the body with `SiteChrome`):

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(site)/layout.tsx
// The portfolio pages' layout.

import type { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Strip the chrome from the root layout**

In `app/layout.tsx` delete the imports of `Header` and `Footer`, and replace

```tsx
              <Header />
              <main id="main" className="flex-grow pt-16">
                {children}
              </main>
              <Footer />
```

with

```tsx
              {/* Each route group's layout (and app/not-found.tsx) renders the <main id="main"> the skip link targets. */}
              {children}
```

- [ ] **Step 4: Give the root 404 its own chrome for now**

`app/not-found.tsx` sits outside both groups. Add `import Header from '@/components/layout/Header';` and `import Footer from '@/components/layout/Footer';`, then wrap the returned element:

```tsx
  return (
    <>
      <Header />
      <main id="main" className="flex-grow pt-16">
        {/* existing <div className="relative min-h-svh"> … </div> unchanged */}
      </main>
      <Footer />
    </>
  );
```

- [ ] **Step 5: Point the tests at the new paths**

```bash
sed -i '' "s#'@/app/page'#'@/app/(site)/page'#" __tests__/stanscribe/HomePanel.test.tsx
sed -i '' "s#'@/app/stanscribe-light/page'#'@/app/(stanscribe)/stanscribe-light/page'#" __tests__/stanscribe/StanScribeLightPage.test.tsx
sed -i '' "s#'@/app/stanscribe/page'#'@/app/(stanscribe)/stanscribe/page'#" __tests__/stanscribe/StanScribePage.test.tsx
```

- [ ] **Step 6: Run the verify command** — expected: all suites pass; every listed `out/` file exists.

- [ ] **Step 7: Commit**

```bash
git add -A app __tests__
git commit -m "refactor(site): split portfolio and Stan Scribe into route groups

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Site tokens, Public Sans and the CSS foundation

**Goal:** Add the `.site` token scope (light, dark, print), Public Sans, the Tailwind roles and the shared CSS pieces (band, halo, clearing, glyph tones, map), and wrap the portfolio pages in `.site`.

**Files:**
- Modify: `app/fonts.ts`, `app/layout.tsx`, `app/globals.css`, `tailwind.config.js`, `app/(site)/layout.tsx`
- Create: `components/site/type.ts`
- Test: `__tests__/site/tokens.test.ts`

**Acceptance Criteria:**
- [ ] `globals.css` defines `.site` with `--site-ground: #eef1f3`, `--surface-page: var(--site-ground)`, `--font-display: var(--font-site)`; `.dark .site` sets `--site-ground: #111517`.
- [ ] `app/fonts.ts` exports `publicSans` with variable `--font-site`, and `app/layout.tsx` adds `publicSans.variable` to `<body>`.
- [ ] Every portfolio page renders inside `<div class="site">`; Stan Scribe pages do not.
- [ ] `npx jest --ci` and `npm run build` pass.

**Verify:** `npx jest __tests__/site/tokens.test.ts --ci && npx jest --ci && npm run build`

**Steps:**

- [ ] **Step 1: Write the failing test** — `__tests__/site/tokens.test.ts`

```ts
import fs from 'node:fs';
import path from 'node:path';
import { render } from '@testing-library/react';
import SiteLayout from '@/app/(site)/layout';

jest.mock('@/components/layout/Header', () => () => null);
jest.mock('@/components/layout/Footer', () => () => null);

const css = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8');
const block = (selector: string) => {
  const start = css.indexOf(`${selector} {`);
  return start < 0 ? '' : css.slice(start, css.indexOf('}', start));
};

test('the .site scope remaps the semantic tokens to the Working Map palette', () => {
  const site = block('.site');
  expect(site).toContain('--site-ground: #eef1f3');
  expect(site).toContain('--surface-page: var(--site-ground)');
  expect(site).toContain('--text-body: #0d1114');
  expect(site).toContain('--font-display: var(--font-site)');
  expect(block('.dark .site')).toContain('--site-ground: #111517');
});

test('Public Sans is loaded as --font-site', () => {
  const fonts = fs.readFileSync(path.join(process.cwd(), 'app/fonts.ts'), 'utf8');
  expect(fonts).toMatch(/Public_Sans\(/);
  expect(fonts).toMatch(/variable: '--font-site'/);
});

test('portfolio pages render inside the .site scope', () => {
  const { container } = render(<SiteLayout><p>page</p></SiteLayout>);
  expect(container.querySelector('.site')).not.toBeNull();
});
```

- [ ] **Step 2: Run it** — `npx jest __tests__/site/tokens.test.ts --ci` → FAIL (no `.site` block).

- [ ] **Step 3: Add Public Sans** — `app/fonts.ts`: change the import line to `import { Newsreader, Hanken_Grotesk, JetBrains_Mono, Public_Sans } from 'next/font/google';` and append:

```ts
/** The portfolio's one typeface (DESIGN.md). Exposed as --font-site; .site maps the other font tokens to it. */
export const publicSans = Public_Sans({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-site', display: 'swap',
});
```

`app/layout.tsx`: import `publicSans` alongside the other fonts and add `${publicSans.variable}` to the `<body>` className list.

- [ ] **Step 4: Add the token scope** — in `app/globals.css`, inside `@layer base`, after the `.dark { … }` block:

```css
  /* ── The portfolio system (DESIGN.md, "The Working Map") ─────────────────────
     Scoped to .site, the wrapper the portfolio pages render in, so the Stan Scribe pages keep the June
     2026 tokens. Inside .site the existing semantic tokens are remapped, so every component already
     built on them (the backdrop's glow strokes in var(--surface-page)) takes the new palette and type. */
  .site {
    --site-ground: #eef1f3;
    --site-band: rgb(238 241 243 / 0.92);
    --site-basin: #ffffff;
    --site-basin-edge: #cdd6dd;
    --site-hover: #e2edf5;
    --site-worked: #c6dcec;
    --site-worked-deep: #9cc1dc;
    --site-selected: #1c5a85;
    --site-strip: #0d1114;
    --site-strip-ink: #e6eaed;
    --site-strip-label: #9aa7b1;
    --surface-page: var(--site-ground);
    --surface-card: var(--site-basin);
    --surface-sunken: #e3e8eb;
    --surface-header: var(--site-ground);
    --text-strong: #0d1114;
    --text-body: #0d1114;
    --text-muted: #4d5962;
    --text-faint: #4d5962;
    --text-link: #1c5a85;
    --text-link-hover: #123d5c;
    --text-eyebrow: #4d5962;
    --brand-primary: #0d1114;
    --brand-accent: #1c5a85;
    --border-hairline: #cdd6dd;
    --border-default: #cdd6dd;
    --border-contour: rgb(28 90 133 / 0.3);
    --ring-focus: #1c5a85;
    --font-display: var(--font-site);
    --font-sans: var(--font-site);
    --font-mono: var(--font-site);
  }
  .dark .site {
    --site-ground: #111517;
    --site-band: rgb(17 21 23 / 0.9);
    --site-basin: #1c2429;
    --site-basin-edge: #3a4851;
    --site-hover: #243440;
    --site-worked: #1f3a4f;
    --site-worked-deep: #2f5a7a;
    --site-selected: #6fb1de;
    --site-strip: #06090b;
    --surface-sunken: #0b0e10;
    --text-strong: #e9edef;
    --text-body: #e9edef;
    --text-muted: #a2adb5;
    --text-faint: #a2adb5;
    --text-link: #6fb1de;
    --text-link-hover: #a9d2ee;
    --text-eyebrow: #a2adb5;
    --brand-primary: #e9edef;
    --brand-accent: #6fb1de;
    --border-hairline: #3a4851;
    --border-default: #3a4851;
    --border-contour: rgb(111 177 222 / 0.3);
    --ring-focus: #6fb1de;
  }
  /* Overscroll and the area outside the wrapper match the portfolio ground. */
  body:has(.site) { background-color: #eef1f3; }
  .dark body:has(.site) { background-color: #111517; }
```

Also change the existing focus rule's selector to include `summary`:
`:where(a, button, summary, [role="button"], [role="region"][tabindex]):focus-visible { … }`

- [ ] **Step 5: Add the shared pieces** — in `@layer components`, append:

```css
  /* The wrapper: a stacking context so the fixed contour plate paints above its ground, below content. */
  .site { isolation: isolate; display: flex; flex: 1 1 auto; min-height: 100svh; flex-direction: column; background: var(--surface-page); color: var(--text-body); font-family: var(--font-site), system-ui, sans-serif; }
  /* The Band Rule: below the first screen, content sits on a near-opaque full-width band. */
  .site .band { background: var(--site-band); padding-block: clamp(64px, 9vw, 128px); }
  .site .band + .band { padding-top: 0; }
  /* The Label Halo Rule: a ground-coloured halo for text over contours (hero only). */
  .site .halo { text-shadow: 0 0 3px var(--surface-page), 0 0 10px var(--surface-page); }
  /* The clearing: contours fade out behind the hero words, as a map clears lines behind a label. */
  .site [data-contour-plate] {
    -webkit-mask-image: radial-gradient(50% 78% at 18% 40%, transparent 30%, #000 74%);
            mask-image: radial-gradient(50% 78% at 18% 40%, transparent 30%, #000 74%);
  }
  @media (max-width: 860px) {
    .site [data-contour-plate] {
      -webkit-mask-image: linear-gradient(to bottom, transparent 0 34%, #000 62%);
              mask-image: linear-gradient(to bottom, transparent 0 34%, #000 62%);
    }
  }

  /* Glyphs (DESIGN.md › Glyphs). Tones are set per part by components/site/Glyph.tsx. */
  .glyph { display: block; overflow: visible; }
  .glyph .g-fill { fill: var(--site-worked); transition: fill 150ms; }
  .glyph .g-deep { fill: var(--site-worked-deep); }
  .glyph .g-zone { fill: var(--site-selected); fill-opacity: 0.4; }
  .glyph .g-strong { fill: var(--site-selected); fill-opacity: 0.9; }
  .glyph :is(.g-fill, .g-deep, .g-zone, .g-strong, .g-line) { stroke: var(--text-strong); stroke-width: 1.1; vector-effect: non-scaling-stroke; }
  .glyph .g-line { fill: none; }
  .glyph :is(.g-thin, .g-ghost) { fill: none; stroke: var(--text-muted); stroke-width: 0.75; vector-effect: non-scaling-stroke; }
  .glyph .g-dot { fill: var(--text-strong); transition: fill 200ms; }
  .glyph .g-accent { fill: var(--site-selected); }
  .glyph-dense .g-fill { stroke-width: 0.5; }
  /* A glyph's host (an entry or a link) lights the glyph and underlines its name when pointed at. */
  .glyph-host:is(:hover, :focus-visible, [data-active='true']) .glyph .g-fill { fill: var(--site-selected); fill-opacity: 0.45; }
  .glyph-host:is(:hover, :focus-visible) .entry-name { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 0.18em; }
  .lead-figure:is(:hover, :focus-visible) .glyph .g-dot { fill: var(--site-selected); }

  /* The résumé's watershed map (DESIGN.md › Watershed map). */
  .site path.basin { fill: var(--site-basin); fill-opacity: 0.94; stroke: var(--site-basin-edge); stroke-width: 0.6; vector-effect: non-scaling-stroke; transition: fill 120ms; }
  .site path.basin-worked { fill: var(--site-worked); fill-opacity: 1; }
  .site path.basin:hover { fill: var(--site-hover); fill-opacity: 1; }
  .site path.basin-selected { fill: var(--site-selected); fill-opacity: 0.45; stroke: var(--site-selected); }
  .site .pin { cursor: pointer; outline: none; }
  .site .pin circle { fill: var(--text-strong); stroke: var(--surface-page); stroke-width: 2; vector-effect: non-scaling-stroke; }
  .site .pin-home { cursor: default; }
  .site .pin-home circle { fill: var(--surface-page); stroke: var(--text-strong); }
  .site .pin-selected circle { fill: var(--site-selected); }
  .site .pin:focus-visible circle { stroke: var(--site-selected); stroke-width: 4; }
  .site .pin text { font-family: var(--font-site), system-ui, sans-serif; font-weight: 600; fill: var(--text-strong); paint-order: stroke; stroke: var(--surface-page); stroke-linejoin: round; }
```

At the end of the existing `@media print { … }` block, add:

```css
  .site, .dark .site {
    --surface-page: #ffffff; --surface-card: #ffffff; --site-band: #ffffff;
    --text-strong: #111111; --text-body: #222222; --text-muted: #444444;
  }
```

- [ ] **Step 6: Tailwind roles** — in `tailwind.config.js` `theme.extend`:
  - in `colors`, add `site: { band: 'var(--site-band)', basin: 'var(--site-basin)', edge: 'var(--site-basin-edge)', worked: 'var(--site-worked)', 'worked-deep': 'var(--site-worked-deep)', selected: 'var(--site-selected)', strip: 'var(--site-strip)', 'strip-ink': 'var(--site-strip-ink)', 'strip-label': 'var(--site-strip-label)' },`
  - in `fontFamily`, add `site: ['var(--font-site)', 'system-ui', 'sans-serif'],`
  - add:

```js
      fontSize: {
        'site-display': ['clamp(3.5rem, 2rem + 5vw, 6.25rem)', { lineHeight: '0.95', letterSpacing: '-0.035em', fontWeight: '700' }],
        'site-headline': ['clamp(1.875rem, 1.5rem + 1.2vw, 2.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'site-title': ['clamp(1.375rem, 1.15rem + 0.8vw, 1.875rem)', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'site-lead': ['clamp(1.25rem, 1.1rem + 0.45vw, 1.4375rem)', { lineHeight: '1.45' }],
        'site-body': ['1.0625rem', { lineHeight: '1.55' }],
        'site-label': ['0.9375rem', { lineHeight: '1.45' }],
      },
      spacing: { gutter: 'clamp(16px, 3vw, 40px)', section: 'clamp(64px, 9vw, 128px)' },
```

- [ ] **Step 7: Type roles and controls** — `components/site/type.ts`:

```ts
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/type.ts
// The portfolio's six type roles and its controls (DESIGN.md › Typography, Components). Public Sans only;
// no size outside these roles, no monospace, no tracked capitals.

export const SITE_TYPE = {
  /** The page's h1: the name or the page title. */
  display: 'font-site text-site-display text-ink-strong',
  /** Section h2s and the lead project's name. */
  headline: 'font-site text-site-headline text-ink-strong',
  /** Project, tool and role names. */
  title: 'font-site text-site-title text-ink-strong',
  /** The opening statement, max 30ch. */
  lead: 'font-site text-site-lead text-ink-body',
  body: 'font-site text-site-body text-ink-body',
  /** Meta lines, filters, captions, the readout. */
  label: 'font-site text-site-label tabular-nums text-ink-muted',
} as const;

/** The one primary button: ink fill, ground text, square, 44px tall. Never haloed. */
export const SITE_BUTTON =
  'inline-flex min-h-11 items-center bg-ink-strong px-5 font-site text-site-body font-medium text-background no-underline transition-opacity duration-150 [text-shadow:none] hover:opacity-[0.88]';

/** A text link: water blue, underlined, thicker on hover. */
export const SITE_LINK = 'text-link underline decoration-1 underline-offset-[0.2em] hover:decoration-2';

/** The "Coming soon" label after a name. */
export const SITE_SOON = 'ml-2.5 align-[0.3em] font-site text-site-label font-medium tracking-normal text-site-selected';
```

- [ ] **Step 8: Wrap the portfolio pages** — in `app/(site)/layout.tsx` wrap the fragment's contents in `<div className="site"> … </div>` (Header, main, Footer stay inside for now).

- [ ] **Step 9: Run the verify command** — expected PASS and a clean build.

- [ ] **Step 10: Commit**

```bash
git add app/fonts.ts app/layout.tsx app/globals.css tailwind.config.js "app/(site)/layout.tsx" components/site/type.ts __tests__/site/tokens.test.ts
git commit -m "feat(site): Working Map tokens, Public Sans and CSS foundation scoped to .site

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

```json:metadata
{"modelTier": "mechanical"}
```

---

### Task 3: The readout (context, strip, readings)

**Goal:** Build the readout: a context any component can feed, the sticky strip that shows it, a per-page default, and the reading builders (plates, places, labels).

**Files:**
- Create: `lib/site/reading.ts`, `components/site/Readout.tsx`
- Test: `__tests__/site/reading.test.ts`, `__tests__/site/Readout.test.tsx`

**Acceptance Criteria:**
- [ ] `formatLat(38.58)` → `"38.58° N"`, `formatLon(-121.49)` → `"121.49° W"`.
- [ ] `placeReading` for a subbasin yields fields Lat, Lon, Subbasin, B118 (B118 marked wide) and the note "DWR Bulletin 118 groundwater subbasins"; for a watershed, Watershed and HUC8 with "California watersheds · USGS HUC8".
- [ ] The strip shows the page default after `ReadoutDefault` mounts, switches to a reading on pointer enter or focus, and returns to the default on leave or blur.
- [ ] Wide fields carry `hidden min-[861px]:inline`.

**Verify:** `npx jest __tests__/site/reading.test.ts __tests__/site/Readout.test.tsx --ci`

**Steps:**

- [ ] **Step 1: Write the failing tests**

`__tests__/site/reading.test.ts`:

```ts
import { formatLat, formatLon, placeReading, plateReading, labelReading, HOME_BASE } from '@/lib/site/reading';

test('coordinates read as degrees with a hemisphere', () => {
  expect(formatLat(38.58)).toBe('38.58° N');
  expect(formatLon(-121.49)).toBe('121.49° W');
  expect(formatLat(-33.9)).toBe('33.90° S');
  expect(formatLon(7.21)).toBe('7.21° E');
});

test('a subbasin reading names the subbasin and its B118 number', () => {
  const r = placeReading({ lat: 34.95, lon: -119.7, kind: 'subbasin', name: 'Cuyama Valley', code: '3-013' });
  expect(r.fields.map((f) => f.label)).toEqual(['Lat', 'Lon', 'Subbasin', 'B118']);
  expect(r.fields[3]).toEqual({ label: 'B118', value: '3-013', wide: true });
  expect(r.note).toBe('DWR Bulletin 118 groundwater subbasins');
});

test('a watershed reading names the HUC8 watershed', () => {
  const r = placeReading({ lat: 34.65, lon: -118.15, kind: 'watershed', name: 'Antelope-Fremont Valleys', code: '18090206' });
  expect(r.fields.map((f) => f.label)).toEqual(['Lat', 'Lon', 'Watershed', 'HUC8']);
  expect(r.note).toBe('California watersheds · USGS HUC8');
});

test('plate, label and home-base readings', () => {
  expect(plateReading('home').fields[0]).toEqual({ label: 'Plate', value: 'Big Sur, California' });
  expect(plateReading('home').note).toBe('Contours drawn by Devin Hunt');
  expect(labelReading('Tool', 'PyPEST').fields).toEqual([{ label: 'Tool', value: 'PyPEST' }]);
  expect(HOME_BASE.fields[0]).toEqual({ label: 'Home base', value: 'Sacramento, California' });
});
```

`__tests__/site/Readout.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { ReadoutDefault, ReadoutProvider, ReadoutStrip, useReadingHandlers } from '@/components/site/Readout';
import { labelReading, plateReading } from '@/lib/site/reading';

function Pointer() {
  const handlers = useReadingHandlers(labelReading('Tool', 'PyPEST'));
  return <button {...handlers}>PyPEST</button>;
}

function Harness() {
  return (
    <ReadoutProvider>
      <ReadoutStrip />
      <ReadoutDefault reading={plateReading('portfolio')} />
      <Pointer />
    </ReadoutProvider>
  );
}

test('the strip shows the page default, then what is pointed at, then the default again', () => {
  render(<Harness />);
  const strip = screen.getByTestId('readout');
  expect(strip).toHaveTextContent('Grand Canyon, Arizona');
  fireEvent.mouseEnter(screen.getByRole('button', { name: 'PyPEST' }));
  expect(strip).toHaveTextContent('Tool');
  expect(strip).not.toHaveTextContent('Grand Canyon');
  fireEvent.mouseLeave(screen.getByRole('button', { name: 'PyPEST' }));
  expect(strip).toHaveTextContent('Grand Canyon, Arizona');
});

test('focus works like pointing', () => {
  render(<Harness />);
  fireEvent.focus(screen.getByRole('button', { name: 'PyPEST' }));
  expect(screen.getByTestId('readout')).toHaveTextContent('PyPEST');
  fireEvent.blur(screen.getByRole('button', { name: 'PyPEST' }));
  expect(screen.getByTestId('readout')).toHaveTextContent('Grand Canyon, Arizona');
});

test('wide fields hide on phones', () => {
  render(<Harness />);
  expect(screen.getByText('Lat').parentElement).toHaveClass('hidden', 'min-[861px]:inline');
});

test('handlers are inert without a provider', () => {
  render(<Pointer />);
  fireEvent.mouseEnter(screen.getByRole('button', { name: 'PyPEST' }));
});
```

- [ ] **Step 2: Run them** — FAIL (modules missing).

- [ ] **Step 3: Implement `lib/site/reading.ts`**

```ts
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/site/reading.ts
// What the readout strip says (DESIGN.md › Readout strip): label/value fields, an optional note on the
// right, and builders for the page plates, places and plain labels.

export interface ReadingField {
  label: string;
  value: string;
  /** Hidden on phones (≤860px). */
  wide?: boolean;
}

export interface Reading {
  fields: ReadingField[];
  note?: string;
}

export const formatLat = (v: number) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? 'N' : 'S'}`;
export const formatLon = (v: number) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? 'E' : 'W'}`;

export interface Place {
  lat: number;
  lon: number;
  kind: 'subbasin' | 'watershed';
  name: string;
  code: string;
}

export function placeReading(p: Place): Reading {
  const subbasin = p.kind === 'subbasin';
  return {
    fields: [
      { label: 'Lat', value: formatLat(p.lat) },
      { label: 'Lon', value: formatLon(p.lon) },
      { label: subbasin ? 'Subbasin' : 'Watershed', value: p.name },
      { label: subbasin ? 'B118' : 'HUC8', value: p.code, wide: true },
    ],
    note: subbasin ? 'DWR Bulletin 118 groundwater subbasins' : 'California watersheds · USGS HUC8',
  };
}

export const labelReading = (label: string, value: string, note?: string): Reading => ({
  fields: [{ label, value }],
  ...(note ? { note } : {}),
});

/** The terrain each page's contour plate shows (scripts/build-plates.mjs). Coordinates are approximate. */
export const PLATES = {
  home: { place: 'Big Sur, California', lat: 36.27, lon: -121.81 },
  portfolio: { place: 'Grand Canyon, Arizona', lat: 36.06, lon: -112.14 },
  ej: { place: 'Great Smoky Mountains, Tennessee', lat: 35.61, lon: -83.49 },
  interests: { place: 'Badlands, South Dakota', lat: 43.86, lon: -102.34 },
  notFound: { place: 'Santorini, Greece', lat: 36.39, lon: 25.46 },
} as const;

export function plateReading(page: keyof typeof PLATES): Reading {
  const p = PLATES[page];
  return {
    fields: [
      { label: 'Plate', value: p.place },
      { label: 'Lat', value: formatLat(p.lat), wide: true },
      { label: 'Lon', value: formatLon(p.lon), wide: true },
    ],
    note: 'Contours drawn by Devin Hunt',
  };
}

/** The résumé's resting reading. */
export const HOME_BASE: Reading = {
  fields: [
    { label: 'Home base', value: 'Sacramento, California' },
    { label: 'Lat', value: formatLat(38.58), wide: true },
    { label: 'Lon', value: formatLon(-121.49), wide: true },
  ],
  note: 'California watersheds · USGS HUC8',
};
```

- [ ] **Step 4: Implement `components/site/Readout.tsx`**

```tsx
'use client';

// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/Readout.tsx
// The readout strip (DESIGN.md › Readout strip): a context any entry, pin or map can feed, the sticky
// strip that shows it, and the page's resting reading. aria-live is off: the same facts are on the page.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Reading } from '@/lib/site/reading';

interface ReadoutApi {
  reading: Reading | null;
  show: (reading: Reading) => void;
  clear: () => void;
  setDefault: (reading: Reading) => void;
}

const ReadoutContext = createContext<ReadoutApi | null>(null);
const INERT: ReadoutApi = { reading: null, show: () => {}, clear: () => {}, setDefault: () => {} };

export function ReadoutProvider({ children }: { children: ReactNode }) {
  const [resting, setResting] = useState<Reading | null>(null);
  const [current, setCurrent] = useState<Reading | null>(null);
  const show = useCallback((r: Reading) => setCurrent(r), []);
  const clear = useCallback(() => setCurrent(null), []);
  const setDefault = useCallback((r: Reading) => setResting(r), []);
  const api = useMemo(() => ({ reading: current ?? resting, show, clear, setDefault }), [current, resting, show, clear, setDefault]);
  return <ReadoutContext.Provider value={api}>{children}</ReadoutContext.Provider>;
}

export function useReadout(): ReadoutApi {
  return useContext(ReadoutContext) ?? INERT;
}

/** Sets the page's resting reading. Renders nothing. */
export function ReadoutDefault({ reading }: { reading: Reading }) {
  const { setDefault } = useReadout();
  useEffect(() => setDefault(reading), [reading, setDefault]);
  return null;
}

/** Pointer and focus handlers that show `reading` while an element is pointed at or focused. */
export function useReadingHandlers(reading?: Reading) {
  const { show, clear } = useReadout();
  return useMemo(
    () =>
      reading
        ? { onMouseEnter: () => show(reading), onMouseLeave: clear, onFocus: () => show(reading), onBlur: clear }
        : {},
    [reading, show, clear],
  );
}

export function ReadoutStrip() {
  const { reading } = useReadout();
  return (
    <div
      data-testid="readout"
      aria-live="off"
      className="sticky top-0 z-30 flex min-h-10 gap-4 overflow-hidden whitespace-nowrap bg-site-strip px-gutter py-[9px] font-site text-site-label tabular-nums text-site-strip-ink print:hidden min-[861px]:gap-7"
    >
      {reading?.fields.map((f) => (
        <span key={f.label} className={f.wide ? 'hidden min-[861px]:inline' : undefined}>
          <span className="mr-1.5 font-medium text-site-strip-label">{f.label}</span>
          {f.value}
        </span>
      ))}
      {reading?.note && <span className="ml-auto hidden text-site-strip-label min-[861px]:inline">{reading.note}</span>}
    </div>
  );
}
```

- [ ] **Step 5: Run the verify command** — expected PASS. Then `npx jest --ci`.

- [ ] **Step 6: Commit**

```bash
git add lib/site/reading.ts components/site/Readout.tsx __tests__/site/reading.test.ts __tests__/site/Readout.test.tsx
git commit -m "feat(site): readout strip, context and readings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Site chrome (header, footer, frame)

**Goal:** Replace the portfolio pages' chrome with the readout strip, the new header (wordmark, Portfolio, Résumé, Outdoors, theme toggle, Email me) and the one-line footer.

**Files:**
- Create: `components/site/SiteHeader.tsx`, `components/site/SiteFooter.tsx`, `components/site/SiteChrome.tsx`
- Modify: `components/ui/ThemeToggle.tsx` (optional `className`), `app/(site)/layout.tsx`
- Test: `__tests__/site/SiteChrome.test.tsx`

**Acceptance Criteria:**
- [ ] The header has a "Devin Hunt" link to `/`, nav links Portfolio `/portfolio`, Résumé `/resume`, Outdoors `/interests`, and an "Email me" link to `mailto:contact@devinhunt.com`.
- [ ] On `/portfolio/environmental-justice-prisons` the Portfolio link has `aria-current="page"`; no other link does.
- [ ] The footer shows "Devin Hunt · Sacramento, California", the email, GitHub (`https://github.com/dhunt22`) and LinkedIn (`https://www.linkedin.com/in/devinthunt`).
- [ ] `SiteChrome` renders `.site` > strip, header, `main#main`, footer, in that order.
- [ ] Stan Scribe pages still render the legacy header (their tests pass unchanged).

**Verify:** `npx jest __tests__/site/SiteChrome.test.tsx --ci && npx jest --ci && npm run build`

**Steps:**

- [ ] **Step 1: Write the failing test** — `__tests__/site/SiteChrome.test.tsx`

```tsx
import { render, screen, within } from '@testing-library/react';
import { SiteChrome } from '@/components/site/SiteChrome';

jest.mock('next/navigation', () => ({ usePathname: () => '/portfolio/environmental-justice-prisons' }));

test('the frame is strip, header, main and footer inside .site', () => {
  const { container } = render(<SiteChrome><p>content</p></SiteChrome>);
  const site = container.querySelector('.site')!;
  const order = Array.from(site.querySelectorAll('[data-testid="readout"], header, main, footer')).map((el) => el.tagName);
  expect(order).toEqual(['DIV', 'HEADER', 'MAIN', 'FOOTER']);
  expect(site.querySelector('main')).toHaveAttribute('id', 'main');
});

test('the header names the site, three pages and one action', () => {
  render(<SiteChrome><p>content</p></SiteChrome>);
  const header = screen.getByRole('banner');
  expect(within(header).getByRole('link', { name: 'Devin Hunt' })).toHaveAttribute('href', '/');
  const nav = within(header).getByRole('navigation', { name: 'Main' });
  expect(within(nav).getAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
    ['Portfolio', '/portfolio'],
    ['Résumé', '/resume'],
    ['Outdoors', '/interests'],
  ]);
  expect(within(nav).getByRole('link', { name: 'Portfolio' })).toHaveAttribute('aria-current', 'page');
  expect(within(nav).getByRole('link', { name: 'Résumé' })).not.toHaveAttribute('aria-current');
  expect(within(header).getByRole('link', { name: 'Email me' })).toHaveAttribute('href', 'mailto:contact@devinhunt.com');
});

test('the footer is one quiet line', () => {
  render(<SiteChrome><p>content</p></SiteChrome>);
  const footer = screen.getByRole('contentinfo');
  expect(footer).toHaveTextContent('Devin Hunt · Sacramento, California');
  expect(within(footer).getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/dhunt22');
  expect(within(footer).getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/devinthunt');
  expect(within(footer).getByRole('link', { name: 'contact@devinhunt.com' })).toHaveAttribute('href', 'mailto:contact@devinhunt.com');
});
```

- [ ] **Step 2: Run it** — FAIL.

- [ ] **Step 3: Let the theme toggle take classes** — in `components/ui/ThemeToggle.tsx`: add `import { cn } from '@/lib/utils';`, change the signature to `export function ThemeToggle({ className }: { className?: string } = {})`, and wrap the button's className: `className={cn('relative inline-flex items-center justify-center rounded-md p-2 text-forest-700 dark:text-forest-300 hover:bg-forest-100 dark:hover:bg-forest-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500', className)}`. The legacy header passes nothing, so it is unchanged.

- [ ] **Step 4: `components/site/SiteHeader.tsx`**

```tsx
'use client';

// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/SiteHeader.tsx
// The portfolio's header (DESIGN.md › Navigation): wordmark, three plain links, the theme toggle and one
// action. No dropdowns.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SITE_BUTTON } from '@/components/site/type';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/resume', label: 'Résumé' },
  { href: '/interests', label: 'Outdoors' },
] as const;

export function SiteHeader() {
  const pathname = usePathname() ?? '';
  return (
    <header className="flex items-center justify-between gap-6 px-gutter py-[18px] print:hidden">
      <Link href="/" className="font-site text-lg font-bold tracking-[-0.01em] text-ink-strong no-underline">
        Devin Hunt
      </Link>
      <nav aria-label="Main">
        <ul className="m-0 flex list-none gap-[18px] p-0 min-[861px]:gap-7">
          {LINKS.map(({ href, label }) => {
            const current = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={current ? 'page' : undefined}
                  className="font-site text-site-body text-ink-strong no-underline decoration-2 underline-offset-[0.35em] hover:underline aria-[current=page]:underline"
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex items-center gap-2">
        <ThemeToggle className="rounded-none text-ink-strong hover:bg-site-band focus-visible:ring-ring dark:text-ink-strong dark:hover:bg-site-band" />
        <a href="mailto:contact@devinhunt.com" className={cn(SITE_BUTTON, 'hidden min-[521px]:inline-flex')}>
          Email me
        </a>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: `components/site/SiteFooter.tsx`**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/SiteFooter.tsx
// The portfolio's footer (DESIGN.md › Footer): one quiet line on a band.

const LINK = 'text-ink-strong underline decoration-1 underline-offset-[0.2em] hover:decoration-2';

export function SiteFooter() {
  return (
    <footer className="flex flex-wrap gap-x-7 gap-y-2 bg-site-band px-gutter pb-12 pt-10 font-site text-site-label text-ink-muted print:hidden">
      <span>Devin Hunt · Sacramento, California</span>
      <a href="mailto:contact@devinhunt.com" className={LINK}>contact@devinhunt.com</a>
      <a href="https://github.com/dhunt22" target="_blank" rel="noopener noreferrer" className={LINK}>GitHub</a>
      <a href="https://www.linkedin.com/in/devinthunt" target="_blank" rel="noopener noreferrer" className={LINK}>LinkedIn</a>
    </footer>
  );
}
```

- [ ] **Step 6: `components/site/SiteChrome.tsx`**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/SiteChrome.tsx
// The portfolio's frame: the .site token scope, the readout strip, header, main and footer. Used by the
// (site) route group's layout and by the root 404.

import type { ReactNode } from 'react';
import { ReadoutProvider, ReadoutStrip } from '@/components/site/Readout';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="site">
      <ReadoutProvider>
        <ReadoutStrip />
        <SiteHeader />
        <main id="main" className="flex-grow">
          {children}
        </main>
        <SiteFooter />
      </ReadoutProvider>
    </div>
  );
}
```

- [ ] **Step 7: Use it** — replace the body of `app/(site)/layout.tsx`:

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(site)/layout.tsx
// The portfolio pages' layout: the Working Map frame (DESIGN.md).

import type { ReactNode } from 'react';
import { SiteChrome } from '@/components/site/SiteChrome';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
```

Update `__tests__/site/tokens.test.ts`: replace the two `jest.mock('@/components/layout/…')` lines with `jest.mock('next/navigation', () => ({ usePathname: () => '/' }));`.

- [ ] **Step 8: Run the verify command** — expected PASS.

- [ ] **Step 9: Commit**

```bash
git add components/site components/ui/ThemeToggle.tsx "app/(site)/layout.tsx" __tests__/site
git commit -m "feat(site): readout strip, header and footer frame the portfolio pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Foundation check in the browser (gate)

**Goal:** Confirm in a real browser that the foundation (tokens, Public Sans, strip, header, footer, clearing, breathing glow) matches the approved C3 prototype before any page is rebuilt, and that Stan Scribe is unchanged.

> **USER-ORDERED GATE — NON-SKIPPABLE.** This task was requested by the user in the current conversation. It MUST NOT be closed by walking around it, by declaring it "verified inline", or by substituting a cheaper check. Close only after every item in `acceptanceCriteria` has been re-validated independently, with output captured.

**Files:**
- No source changes expected. Fixes, if needed, go in the Task 2–4 files with their own commit.

**Acceptance Criteria:**
- [ ] On `http://localhost:3100/portfolio`, `getComputedStyle(document.querySelector('.site h1')).fontFamily` contains "Public Sans" and `getComputedStyle(document.querySelector('.site')).backgroundColor` is `rgb(238, 241, 243)` in light theme and `rgb(17, 21, 23)` in dark.
- [ ] On `http://localhost:3100/stanscribe`, `getComputedStyle(document.querySelector('h1')).fontFamily` contains "Newsreader" and the legacy header (nav with "HOME"-style links) is present.
- [ ] `[data-testid="readout"]` is present on `/portfolio`, has `position: sticky`, and shows "Plate"-less content until pages set defaults (empty strip of 40px is acceptable at this stage).
- [ ] After 4 s, `document.querySelectorAll('.site [data-contour-plate] g[data-band]').length` is 9 on `/portfolio` (glow inlined), and the plate's computed `mask-image` (or `-webkit-mask-image`) is a `radial-gradient` at 1440px wide.
- [ ] Screenshots of `/portfolio` at 1440×900 and 390×844 in light and dark are captured and compared side by side with `.taste-skill/proto/shots/c3-*.jpg`: strip, header and type match; differences are listed in the close note.
- [ ] The browser console on both pages shows no errors from app code.

**Verify:** `npx next dev -p 3100` (background), then the JS checks above in Chrome (`mcp__claude-in-chrome__javascript_tool`) and screenshots (`node .claude/skills/design-taste-frontend/scripts/inspect.mjs http://localhost:3100/portfolio --widths 1440,390 --out .taste-skill/gate-foundation`).

**Steps:**

- [ ] **Step 1:** Start the dev server on 3100 and open `/portfolio` and `/stanscribe`.
- [ ] **Step 2:** Run each JS check and paste the outputs into the task's close note.
- [ ] **Step 3:** Capture the four screenshots; read them; list any mismatch with the C3 prototype shots.
- [ ] **Step 4:** If anything fails, fix it in the owning file, commit (`fix(site): …`), and re-run every check.

```json:metadata
{"userGate": true, "tags": ["user-gate"], "modelTier": "standard"}
```

---

### Task 6: Geometry and glyphs

**Goal:** Restore the B118 subbasins and build the glyph library: geometry helpers, the glyph builders for every project type, the server-side data readers and the `Glyph` component.

**Files:**
- Create: `public/data/cuyama_subbasin.geojson`, `public/data/yuba_subbasins.geojson` (restored)
- Create: `lib/site/geo.ts`, `lib/site/glyphs.ts`, `lib/site/geodata.ts`, `components/site/Glyph.tsx`
- Test: `__tests__/site/geo.test.ts`, `__tests__/site/glyphs.test.tsx`

**Acceptance Criteria:**
- [ ] `featureAt(huc8Features(), -121.49, 38.58)` is "Lower Sacramento" (`18020163`); `(-119.7, 34.95)` is "Cuyama" (`18060007`).
- [ ] `outlineGlyph(b118Features('cuyama_subbasin.geojson'))` is one path inside the 72×72 box; the Yuba file gives two paths.
- [ ] `contiguousPrisonPoints()` returns 1,838 points and `pointsGlyph` draws one dot per point.
- [ ] Mesh variants: plain has 19 cells all `fill`; zoned uses `fill`, `zone`, `strong`; subset uses only `strong` and `ghost`.
- [ ] `captionsGlyph()` colours its three dots `#2f7ed8`, `#d9822b`, `#2e9a68`.
- [ ] `<Glyph>` renders an `aria-hidden` svg with one element per part and `g-<tone>` classes.

**Verify:** `npx jest __tests__/site/geo.test.ts __tests__/site/glyphs.test.tsx --ci`

**Steps:**

- [ ] **Step 1: Restore the subbasins**

```bash
git show 7d9b0b9^:public/data/cuyama_subbasin.geojson > public/data/cuyama_subbasin.geojson
git show 7d9b0b9^:public/data/yuba_subbasins.geojson > public/data/yuba_subbasins.geojson
```

- [ ] **Step 2: Write the failing tests**

`__tests__/site/geo.test.ts`:

```ts
import { featureAt, fitTo, pathData, project, unproject } from '@/lib/site/geo';
import { huc8Features } from '@/lib/site/geodata';

test('project and unproject are inverses', () => {
  const [lon, lat] = unproject(project([-121.49, 38.58]));
  expect(lon).toBeCloseTo(-121.49, 6);
  expect(lat).toBeCloseTo(38.58, 6);
});

test('featureAt finds the HUC8 watershed under a point', () => {
  const huc = huc8Features();
  expect(huc).toHaveLength(140);
  expect(featureAt(huc, -121.49, 38.58)?.properties).toMatchObject({ Name: 'Lower Sacramento', HUC8: '18020163' });
  expect(featureAt(huc, -119.7, 34.95)?.properties).toMatchObject({ Name: 'Cuyama', HUC8: '18060007' });
  expect(featureAt(huc, -130, 38)).toBeUndefined();
});

test('fitTo centres a shape inside the box with its padding', () => {
  const fit = fitTo([[0, 0], [10, 5]], 72, 72, 6);
  expect(fit([0, 0])).toEqual([6, 21]);
  expect(fit([10, 5])).toEqual([66, 51]);
});

test('pathData rounds and drops repeated points', () => {
  const d = pathData([[[[0, 0], [0.01, 0], [1, 0], [1, 1]]]], ([x, y]) => [x * 10, y * 10], 0);
  expect(d).toBe('M0,0L10,0L10,10Z');
});
```

`__tests__/site/glyphs.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { Glyph } from '@/components/site/Glyph';
import { b118Features, contiguousPrisonPoints, huc8Features } from '@/lib/site/geodata';
import {
  boreholesGlyph, calibrationGlyph, captionsGlyph, householdsGlyph, meshGlyph, outlineGlyph, pointsGlyph,
  SPEAKER_COLOURS, wellsGlyph, type GlyphShape,
} from '@/lib/site/glyphs';

const absoluteNumbers = (s: GlyphShape) =>
  s.parts.flatMap((p) => (p.t === 'path' ? (p.d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number) : p.t === 'circle' ? [p.cx, p.cy] : [p.x, p.y]));
const inside = (s: GlyphShape) => absoluteNumbers(s).every((n) => n >= 0 && n <= Math.max(s.w, s.h));

test('Cuyama Valley is one B118 outline inside the box', () => {
  const g = outlineGlyph(b118Features('cuyama_subbasin.geojson'));
  expect(g.parts).toHaveLength(1);
  expect(inside(g)).toBe(true);
});

test('Yuba draws North and South Yuba together', () => {
  expect(outlineGlyph(b118Features('yuba_subbasins.geojson')).parts).toHaveLength(2);
});

test('the statewide glyph draws every California watershed, thinly', () => {
  const g = outlineGlyph(huc8Features(), { dense: true });
  expect(g.parts).toHaveLength(140);
  expect(g.dense).toBe(true);
});

test('one dot per prison in the contiguous United States', () => {
  const pts = contiguousPrisonPoints();
  expect(pts).toHaveLength(1838);
  const g = pointsGlyph(pts);
  expect(g.parts).toHaveLength(1838);
  expect(inside(g)).toBe(true);
});

test('the model mesh and its variants', () => {
  const plain = meshGlyph('plain');
  expect(plain.parts).toHaveLength(19);
  expect(new Set(plain.parts.map((p) => p.tone))).toEqual(new Set(['fill']));
  expect(new Set(meshGlyph('zoned').parts.map((p) => p.tone))).toEqual(new Set(['fill', 'zone', 'strong']));
  expect(new Set(meshGlyph('subset').parts.map((p) => p.tone))).toEqual(new Set(['strong', 'ghost']));
  expect(inside(plain)).toBe(true);
});

test('drawn subjects stay inside the box', () => {
  for (const g of [calibrationGlyph(), boreholesGlyph(), householdsGlyph(), captionsGlyph()]) expect(inside(g)).toBe(true);
  expect(wellsGlyph().parts.filter((p) => p.t === 'circle')).toHaveLength(6);
});

test('captions use the speaker colours', () => {
  const colours = captionsGlyph().parts.flatMap((p) => (p.t === 'circle' && p.color ? [p.color] : []));
  expect(colours).toEqual([...SPEAKER_COLOURS]);
});

test('<Glyph> draws one element per part, hidden from assistive tech', () => {
  const { container } = render(<Glyph shape={meshGlyph('zoned')} />);
  const svg = container.querySelector('svg')!;
  expect(svg).toHaveAttribute('aria-hidden', 'true');
  expect(svg).toHaveClass('glyph');
  expect(svg.querySelectorAll('path')).toHaveLength(19);
  expect(svg.querySelector('.g-zone')).not.toBeNull();
});
```

- [ ] **Step 3: Run them** — FAIL (modules missing).

- [ ] **Step 4: `lib/site/geo.ts`**

```ts
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/site/geo.ts
// Geometry shared by the project glyphs and the résumé map: one projection, point-in-polygon, fitting a
// shape into a box, and SVG path data.

export type LonLat = [number, number];
export type XY = [number, number];
export type Ring = LonLat[];
export type Polygon = Ring[];

export interface Geometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: unknown;
}

export interface Feature<P = Record<string, unknown>> {
  properties: P;
  geometry: Geometry;
}

/** Equirectangular, scaled for 37.5°N (mid-California). */
export const COS_LAT = Math.cos((37.5 * Math.PI) / 180);
export const project = ([lon, lat]: LonLat): XY => [lon * COS_LAT, -lat];
export const unproject = ([x, y]: XY): LonLat => [x / COS_LAT, -y];

export function polygonsOf(geometry: Geometry): Polygon[] {
  return (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates) as Polygon[];
}

export function ringContains(ring: Ring, lon: number, lat: number): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function featureAt<P>(features: Feature<P>[], lon: number, lat: number): Feature<P> | undefined {
  return features.find((f) =>
    polygonsOf(f.geometry).some(
      (poly) => ringContains(poly[0], lon, lat) && !poly.slice(1).some((hole) => ringContains(hole, lon, lat)),
    ),
  );
}

/** A transform fitting projected points into a w × h box with `pad` on every side, centred. */
export function fitTo(points: XY[], w: number, h: number, pad: number): (p: XY) => XY {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of points) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  const s = Math.min((w - 2 * pad) / (x1 - x0 || 1), (h - 2 * pad) / (y1 - y0 || 1));
  const ox = (w - (x1 - x0) * s) / 2;
  const oy = (h - (y1 - y0) * s) / 2;
  return ([x, y]) => [ox + (x - x0) * s, oy + (y - y0) * s];
}

/** SVG path data for polygons through `tx`, rounded to `digits`, with repeated points dropped. */
export function pathData(polygons: Polygon[], tx: (c: LonLat) => XY, digits = 1): string {
  const f = 10 ** digits;
  const r = (n: number) => Math.round(n * f) / f;
  return polygons
    .map((poly) =>
      poly
        .map((ring) => {
          const pts: string[] = [];
          for (const c of ring) {
            const [x, y] = tx(c);
            const s = `${r(x)},${r(y)}`;
            if (s !== pts[pts.length - 1]) pts.push(s);
          }
          return `M${pts.join('L')}Z`;
        })
        .join(''),
    )
    .join('');
}
```

- [ ] **Step 5: `lib/site/glyphs.ts`**

```ts
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/site/glyphs.ts
// Project glyphs (DESIGN.md › Glyphs): each project drawn in a 72 × 72 box from its own geometry, its own
// data, or a drawing of the thing it measured. Pure: the geometry is passed in.

import { fitTo, pathData, polygonsOf, project, type Feature, type LonLat, type XY } from '@/lib/site/geo';

export type Tone = 'fill' | 'deep' | 'zone' | 'strong' | 'line' | 'thin' | 'dot' | 'accent' | 'ghost';

export type Part =
  | { t: 'path'; d: string; tone: Tone }
  | { t: 'circle'; cx: number; cy: number; r: number; tone: Tone; color?: string }
  | { t: 'rect'; x: number; y: number; w: number; h: number; rx?: number; tone: Tone };

export interface GlyphShape {
  w: number;
  h: number;
  parts: Part[];
  /** Many small outlines (the statewide glyph): drawn with thinner strokes. */
  dense?: boolean;
}

const BOX = 72;
const PAD = 6;
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Outlines, fitted together: Bulletin 118 subbasins, a watershed, or every watershed in the state. */
export function outlineGlyph(features: Feature[], { dense = false } = {}): GlyphShape {
  const all: XY[] = features.flatMap((f) => polygonsOf(f.geometry).flatMap((poly) => poly[0].map(project)));
  const fit = fitTo(all, BOX, BOX, PAD);
  return {
    w: BOX,
    h: BOX,
    dense,
    parts: features.map((f) => ({ t: 'path' as const, d: pathData(polygonsOf(f.geometry), (c) => fit(project(c))), tone: 'fill' as const })),
  };
}

/** Points from a project's own data, one dot each. */
export function pointsGlyph(points: LonLat[], { w = BOX, h = BOX, r = 0.9, pad = 4 } = {}): GlyphShape {
  const xy = points.map(project);
  const fit = fitTo(xy, w, h, pad);
  return {
    w,
    h,
    parts: xy.map((p) => {
      const [cx, cy] = fit(p);
      return { t: 'circle' as const, cx: r1(cx), cy: r1(cy), r, tone: 'dot' as const };
    }),
  };
}

interface Cell { i: number; j: number; d: string }

/** IWFM's finite-element grid, drawn as an organic domain of quads. */
function meshCells(): Cell[] {
  const node = (i: number, j: number): XY => [
    10 + i * 10.4 + 2.6 * Math.sin(j * 0.9 + 1),
    10 + j * 10.4 + 2.6 * Math.sin(i * 0.8 + 0.5),
  ];
  const skip = new Set(['0,0', '4,0', '0,4', '4,4', '3,4', '4,3']);
  const cells: Cell[] = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (skip.has(`${i},${j}`)) continue;
      const q = [node(i, j), node(i + 1, j), node(i + 1, j + 1), node(i, j + 1)];
      cells.push({ i, j, d: `M${q.map(([x, y]) => `${r1(x)},${r1(y)}`).join('L')}Z` });
    }
  }
  return cells;
}

export type MeshVariant = 'plain' | 'zoned' | 'subset';

/** The model family: the mesh (AIIWFM), in zones (ZBudget Dashboards), or with one region cut out for its own run (IWFM workflow suite). */
export function meshGlyph(variant: MeshVariant): GlyphShape {
  const tone = (c: Cell): Tone => {
    if (variant === 'zoned') return c.i < 2 ? 'fill' : c.j < 2 ? 'zone' : 'strong';
    if (variant === 'subset') return c.i >= 2 && c.j >= 1 && c.j <= 3 ? 'strong' : 'ghost';
    return 'fill';
  };
  return { w: BOX, h: BOX, parts: meshCells().map((c) => ({ t: 'path' as const, d: c.d, tone: tone(c) })) };
}

/** Calibration (PyPEST): simulated against observed, around the 1:1 line. */
export function calibrationGlyph(): GlyphShape {
  const pts: XY[] = [[14, 58], [19, 51], [24, 49], [27, 43], [31, 45], [33, 40], [37, 33], [41, 34], [44, 31], [46, 27], [50, 24], [55, 18], [58, 15]];
  return {
    w: BOX,
    h: BOX,
    parts: [
      { t: 'path', d: 'M8,8V64H64', tone: 'thin' },
      { t: 'path', d: 'M8,64L64,8', tone: 'line' },
      ...pts.map(([cx, cy]) => ({ t: 'circle' as const, cx, cy, r: 2.2, tone: 'dot' as const })),
    ],
  };
}

/** Stan Scribe's own speaker colours. */
export const SPEAKER_COLOURS = ['#2f7ed8', '#d9822b', '#2e9a68'] as const;

/** Live captions (Stan Scribe): three caption lines, each with its speaker's colour. */
export function captionsGlyph(): GlyphShape {
  const rows: [number, number][] = [[18, 44], [34, 32], [50, 40]];
  return {
    w: BOX,
    h: BOX,
    parts: rows.flatMap(([y, len], i) => [
      { t: 'circle' as const, cx: 13, cy: y, r: 4, tone: 'dot' as const, color: SPEAKER_COLOURS[i] },
      { t: 'rect' as const, x: 22, y: y - 4, w: len, h: 8, rx: 4, tone: 'fill' as const },
    ]),
  };
}

/** Infiltration: three boreholes, the layer that stops deep percolation marked in each. */
export function boreholesGlyph(): GlyphShape {
  const holes: [number, number][] = [[14, 30], [31, 36], [48, 33]];
  return {
    w: BOX,
    h: BOX,
    parts: [
      { t: 'path', d: 'M6,12H66', tone: 'line' },
      ...holes.flatMap(([x, band]) => [
        { t: 'rect' as const, x, y: 12, w: 10, h: 52, tone: 'fill' as const },
        { t: 'rect' as const, x, y: band, w: 10, h: 8, tone: 'strong' as const },
      ]),
    ],
  };
}

/** Groundwater conditions: six wells across groundwater contours, with the horizontal gradient. */
export function wellsGlyph(): GlyphShape {
  const wells: XY[] = [[16, 22], [40, 14], [58, 26], [22, 46], [46, 40], [36, 60]];
  return {
    w: BOX,
    h: BOX,
    parts: [
      { t: 'path', d: 'M6,30C24,22 44,24 66,14M6,46C26,38 46,40 66,30M6,62C28,54 48,56 66,46', tone: 'thin' },
      { t: 'path', d: 'M24,30L46,56M46,56L45,49M46,56L39,54', tone: 'line' },
      ...wells.map(([cx, cy]) => ({ t: 'circle' as const, cx, cy, r: 3.2, tone: 'accent' as const })),
    ],
  };
}

/** Seasonal population: households on a grid, the seasonal ones filled. */
export function householdsGlyph(): GlyphShape {
  const parts: Part[] = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      const seasonal = (i * 3 + j * 5) % 7 < 2;
      parts.push({ t: 'circle', cx: 12 + i * 8, cy: 12 + j * 8, r: seasonal ? 2.6 : 1.4, tone: seasonal ? 'accent' : 'dot' });
    }
  }
  return { w: BOX, h: BOX, parts };
}
```

- [ ] **Step 6: `lib/site/geodata.ts`**

```ts
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/site/geodata.ts
// Reads the geometry in public/data. Server only: the pages are statically exported, so this runs at
// build time and the browser receives drawn glyphs, not GeoJSON.

import fs from 'node:fs';
import path from 'node:path';
import type { Feature, LonLat } from '@/lib/site/geo';

const cache = new Map<string, unknown>();

function read<T>(file: string): T {
  if (!cache.has(file)) {
    cache.set(file, JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'data', file), 'utf8')));
  }
  return cache.get(file) as T;
}

export type Huc8Props = { Name: string; HUC8: string };
export type B118Props = { Basin_Subbasin_Number: string; Basin_Subbasin_Name: string };

export const huc8Features = () => read<{ features: Feature<Huc8Props>[] }>('HUC8_CA_simple.geojson').features;

/** DWR Bulletin 118 subbasins, ordered by subbasin number. */
export const b118Features = (file: string) =>
  [...read<{ features: Feature<B118Props>[] }>(file).features].sort((a, b) =>
    a.properties.Basin_Subbasin_Number.localeCompare(b.properties.Basin_Subbasin_Number),
  );

/** Prisons in the study (EEJ): 1,865 in all. */
export const PRISON_COUNT = 1865;

/** The study's prisons in the contiguous United States (1,838 of the 1,865), for drawing. */
export function contiguousPrisonPoints(): LonLat[] {
  const { features } = read<{ features: { geometry: { type: string; coordinates: number[] } | null }[] }>(
    'nasa_eej_prisons_pts_pctl_simple.geojson',
  );
  return features
    .flatMap((f) => (f.geometry?.type === 'Point' ? [[f.geometry.coordinates[0], f.geometry.coordinates[1]] as LonLat] : []))
    .filter(([lon, lat]) => lon > -125 && lon < -66 && lat > 24 && lat < 50);
}
```

- [ ] **Step 7: `components/site/Glyph.tsx`**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/Glyph.tsx
// Draws a GlyphShape. Decorative: the entry beside it carries the meaning.

import type { GlyphShape, Part } from '@/lib/site/glyphs';
import { cn } from '@/lib/utils';

function draw(p: Part, key: number) {
  const className = `g-${p.tone}`;
  if (p.t === 'path') return <path key={key} className={className} d={p.d} />;
  if (p.t === 'circle') {
    return <circle key={key} className={className} cx={p.cx} cy={p.cy} r={p.r} style={p.color ? { fill: p.color } : undefined} />;
  }
  return <rect key={key} className={className} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.rx} />;
}

export function Glyph({ shape, className }: { shape: GlyphShape; className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${shape.w} ${shape.h}`}
      className={cn('glyph', shape.dense && 'glyph-dense', className)}
      aria-hidden="true"
      focusable="false"
    >
      {shape.parts.map(draw)}
    </svg>
  );
}
```

- [ ] **Step 8: Run the verify command** — expected PASS. Then `npx jest --ci && npm run build`.

- [ ] **Step 9: Commit**

```bash
git add public/data/cuyama_subbasin.geojson public/data/yuba_subbasins.geojson lib/site components/site/Glyph.tsx __tests__/site
git commit -m "feat(site): project glyphs from B118 subbasins, watersheds, data and drawn subjects

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Work data and view models

**Goal:** Give every project a one-line summary, place, glyph, location or readout; add the tools and the home highlights; and resolve them into serializable view models with glyphs and readings.

**Files:**
- Modify: `lib/portfolio-data.ts`
- Create: `lib/site/work.ts`
- Test: `__tests__/site/work.test.ts`

**Acceptance Criteria:**
- [ ] `projectEntries()` returns 9 entries in `PROJECTS` order, each with a non-empty glyph, summary and reading.
- [ ] Cuyama's reading: Subbasin "Cuyama Valley", B118 "3-013". Yuba's: "North Yuba and South Yuba", "5-021.60, 5-021.61". Antelope's: Watershed "Antelope-Fremont Valleys". Harvest's: Watershed "Upper Cosumnes".
- [ ] `toolEntries()` returns AIIWFM, ZBudget Dashboards (`soon: true`, no href), IWFM workflow suite, PyPEST, Stan Scribe (`href: '/stanscribe'`).
- [ ] `highlightEntries()` returns, in order: Environmental Justice For Prisons (href `/portfolio/environmental-justice-prisons`), Yuba Subbasins Recharge Analysis (`/portfolio#yuba-recharge`), AIIWFM (`/portfolio#aiiwfm`), ZBudget Dashboards (no href), Stan Scribe (`/stanscribe`).
- [ ] `formatYears('2023-Present')` → "2023 to present"; `formatYears('2022-2023')` → "2022 to 2023".
- [ ] No banned Stan Scribe copy in the Stan Scribe tool text (`findCopyViolations` returns `[]`).

**Verify:** `npx jest __tests__/site/work.test.ts --ci`

**Steps:**

- [ ] **Step 1: Write the failing test** — `__tests__/site/work.test.ts`

```ts
import { formatYears, highlightEntries, projectEntries, toolEntries } from '@/lib/site/work';
import { findCopyViolations } from '@/test-utils/stanscribe';

const field = (entry: { reading: { fields: { label: string; value: string }[] } }, label: string) =>
  entry.reading.fields.find((f) => f.label === label)?.value;

test('years read as words', () => {
  expect(formatYears('2023-Present')).toBe('2023 to present');
  expect(formatYears('2022-2023')).toBe('2022 to 2023');
  expect(formatYears('2024')).toBe('2024');
  expect(formatYears(undefined)).toBe('');
});

test('every project has a glyph, a summary and a reading', () => {
  const entries = projectEntries();
  expect(entries.map((e) => e.id)).toEqual([
    'prison-ej', 'cuyama-basin', 'yuba-recharge', 'seasonal-population', 'harvest-water',
    'modesto-infiltration', 'antelope-wells', 'watershed-hub', 'sanitary-district',
  ]);
  for (const e of entries) {
    expect(e.glyph.parts.length).toBeGreaterThan(0);
    expect(e.summary.length).toBeGreaterThan(20);
    expect(e.reading.fields.length).toBeGreaterThan(0);
  }
});

test('places read from Bulletin 118 or the HUC8 watersheds', () => {
  const byId = Object.fromEntries(projectEntries().map((e) => [e.id, e]));
  expect(field(byId['cuyama-basin'], 'Subbasin')).toBe('Cuyama Valley');
  expect(field(byId['cuyama-basin'], 'B118')).toBe('3-013');
  expect(field(byId['yuba-recharge'], 'Subbasin')).toBe('North Yuba and South Yuba');
  expect(field(byId['yuba-recharge'], 'B118')).toBe('5-021.60, 5-021.61');
  expect(field(byId['antelope-wells'], 'Watershed')).toBe('Antelope-Fremont Valleys');
  expect(field(byId['harvest-water'], 'Watershed')).toBe('Upper Cosumnes');
  expect(byId['prison-ej'].href).toBe('/portfolio/environmental-justice-prisons');
  expect(byId['prison-ej'].meta).toBe('United States · 2022 to 2023');
});

test('the tools', () => {
  const tools = toolEntries();
  expect(tools.map((t) => t.name)).toEqual(['AIIWFM', 'ZBudget Dashboards', 'IWFM workflow suite', 'PyPEST', 'Stan Scribe']);
  const zbudget = tools[1];
  expect(zbudget.soon).toBe(true);
  expect(zbudget.href).toBeUndefined();
  expect(zbudget.summary).toBe('A fast, powerful IWFM model diagnostic and results viewing dashboard with interactive map and charts. Streamlining model review and report generation.');
  const stan = tools[4];
  expect(stan.href).toBe('/stanscribe');
  expect(findCopyViolations([stan.summary, ...stan.content].join(' '))).toEqual([]);
});

test('the five home highlights, in order, with where each one goes', () => {
  expect(highlightEntries().map((h) => [h.name, h.href])).toEqual([
    ['Environmental Justice For Prisons', '/portfolio/environmental-justice-prisons'],
    ['Yuba Subbasins Recharge Analysis', '/portfolio#yuba-recharge'],
    ['AIIWFM', '/portfolio#aiiwfm'],
    ['ZBudget Dashboards', undefined],
    ['Stan Scribe', '/stanscribe'],
  ]);
});
```

- [ ] **Step 2: Run it** — FAIL.

- [ ] **Step 3: Extend `lib/portfolio-data.ts`** — add above `interface Project`:

```ts
/** How a project or tool is drawn (DESIGN.md › Glyphs). */
export type GlyphSpec =
  | { kind: 'subbasin'; file: string } // DWR Bulletin 118 polygons in public/data
  | { kind: 'watershed' } // the HUC8 watershed under `location`
  | { kind: 'statewide' } // every California HUC8 watershed
  | { kind: 'prisons' } // the EEJ prison points
  | { kind: 'mesh'; variant: 'plain' | 'zoned' | 'subset' }
  | { kind: 'calibration' }
  | { kind: 'captions' }
  | { kind: 'boreholes' }
  | { kind: 'wells' }
  | { kind: 'households' };
```

Add to `interface Project`:

```ts
  /** One line for lists. */
  summary: string;
  /** Where the work is, for the meta line; omitted when the place isn't stated. */
  place?: string;
  glyph: GlyphSpec;
  /** A point inside the project's area, for the readout and the résumé map. Approximate. */
  location?: { lat: number; lon: number };
  /** What the readout says for a project without a location. */
  readout?: { label: string; value: string };
```

Add these fields to each project object (keep every existing field and string unchanged):

| id | fields to add |
| --- | --- |
| `prison-ej` | `summary: 'Climate, exposure and proximity percentile scores for U.S. prisons, combined into one vulnerability score each, for a NASA grant.', place: 'United States', glyph: { kind: 'prisons' }, readout: { label: 'Prisons', value: '1,865 across the United States' },` |
| `cuyama-basin` | `summary: 'Figures for the 2025 Groundwater Sustainability Plan, and yearly land use and ET updates to the basin’s IWFM model.', place: 'Cuyama Valley', glyph: { kind: 'subbasin', file: 'cuyama_subbasin.geojson' }, location: { lat: 34.95, lon: -119.7 },` |
| `yuba-recharge` | `summary: 'A Recharge Suitability Index showing where recharge projects would work best.', place: 'Yuba County', glyph: { kind: 'subbasin', file: 'yuba_subbasins.geojson' }, location: { lat: 39.13, lon: -121.49 },` |
| `seasonal-population` | `summary: 'An R script that estimated seasonal populations from over 8 million metering records across 21,000 households.', glyph: { kind: 'households' }, readout: { label: 'Records', value: 'Over 8 million, from 21,000 households' },` |
| `harvest-water` | `summary: 'Project figures and geospatial data for Title 22 water delivery to local farmers.', place: 'Sacramento County', glyph: { kind: 'watershed' }, location: { lat: 38.33, lon: -121.3 },` (approximate: a point in the program area until the South American subbasin, B118 5-021.65, is added) |
| `modesto-infiltration` | `summary: 'Drainage basins screened with SAGBI and SSURGO soil data, then three boreholes logged to find the layers that stop deep percolation.', glyph: { kind: 'boreholes' }, readout: { label: 'Boreholes', value: 'Three, logged at 5-foot intervals' },` |
| `antelope-wells` | `summary: 'Parcel-level suitability scores for new well sites, from over ten weighted datasets.', place: 'Palmdale and Lancaster', glyph: { kind: 'watershed' }, location: { lat: 34.65, lon: -118.15 },` (approximate until Antelope Valley, B118 6-044, is added) |
| `watershed-hub` | `summary: 'Watershed metrics fetched from public APIs, cleaned and processed for upload to ArcGIS Online.', place: 'California', glyph: { kind: 'statewide' }, readout: { label: 'Extent', value: 'California, 140 HUC8 watersheds' },` |
| `sanitary-district` | `summary: 'NPDES groundwater conditions reports from monitoring data at six wells: groundwater elevation and horizontal gradient.', glyph: { kind: 'wells' }, readout: { label: 'Monitoring', value: 'Six wells, every quarter' },` |

Append after `PROJECTS`:

```ts
/** Software Devin builds around the models, and one app outside them. Copy from the résumé and PRODUCT.md. */
export interface Tool {
  id: string;
  title: string;
  meta: string;
  summary: string;
  content: string[];
  glyph: GlyphSpec;
  readout: { label: string; value: string };
  href?: string;
  soon?: boolean;
}

export const TOOLS: Tool[] = [
  {
    id: 'aiiwfm',
    title: 'AIIWFM',
    meta: 'Woodard & Curran · 2023 to present',
    summary: 'An internal AI application that grounds language models in the IWFM user manual and modeling theory, to answer groundwater modeling questions accurately.',
    content: ['Develop and maintain AIIWFM, an internal AI application that grounds language models in the IWFM user manual and modeling theory to answer groundwater modeling questions accurately.'],
    glyph: { kind: 'mesh', variant: 'plain' },
    readout: { label: 'Tool', value: 'AIIWFM, grounded in the IWFM manual and modeling theory' },
  },
  {
    id: 'zbudget-dashboards',
    title: 'ZBudget Dashboards',
    meta: '',
    summary: 'A fast, powerful IWFM model diagnostic and results viewing dashboard with interactive map and charts. Streamlining model review and report generation.',
    content: [],
    glyph: { kind: 'mesh', variant: 'zoned' },
    readout: { label: 'Tool', value: 'ZBudget Dashboards, coming soon' },
    soon: true,
  },
  {
    id: 'iwfm-workflows',
    title: 'IWFM workflow suite',
    meta: 'Woodard & Curran',
    summary: 'Python tools that subset a model domain and run automated file linting, QA/QC and water-budget reporting.',
    content: [
      'Build a Python suite of tools that automates common IWFM model workflows, including sub-setting a model domain and running automated file linting, QA/QC, and water-budget reporting.',
      'Automate post-processing of IWFM groundwater models, replacing slow manual steps with tested, reusable tools.',
    ],
    glyph: { kind: 'mesh', variant: 'subset' },
    readout: { label: 'Tool', value: 'IWFM workflow suite, sub-setting a model domain' },
  },
  {
    id: 'pypest',
    title: 'PyPEST',
    meta: 'Woodard & Curran',
    summary: 'A Python port of DWR’s IWFM PEST calibration suite, validated against the original Fortran tools.',
    content: ['Develop PyPEST, a Python port of the DWR IWFM PEST calibration suite, validated against the original Fortran tools to support automated model calibration.'],
    glyph: { kind: 'calibration' },
    readout: { label: 'Tool', value: 'PyPEST, validated against the Fortran tools' },
  },
  {
    id: 'stan-scribe',
    title: 'Stan Scribe',
    meta: 'iPhone and iPad',
    summary: 'Live captions in color, built for my grandpa, who is hard of hearing, and for anyone who needs them.',
    content: ['My grandpa Stan is hard of hearing. Live captions changed the conversations my family could have with him, but the apps we found all charged a monthly fee. So I used AI to build one that reaches as many people as possible: live captions in color, a free edition, and no subscription.'],
    glyph: { kind: 'captions' },
    readout: { label: 'App', value: 'Stan Scribe, on its own site' },
    href: '/stanscribe',
  },
];

/** The home page's Selected work, in order (owner, 2026-10-25). */
export const HIGHLIGHTS = ['prison-ej', 'yuba-recharge', 'aiiwfm', 'zbudget-dashboards', 'stan-scribe'] as const;
```

- [ ] **Step 4: `lib/site/work.ts`**

```ts
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/site/work.ts
// Projects and tools as entries for the portfolio, the home highlights and the résumé map: each with its
// glyph and its readout. Server only (reads geometry through lib/site/geodata).

import { HIGHLIGHTS, PROJECTS, TOOLS, type GlyphSpec, type Project, type Tool } from '@/lib/portfolio-data';
import { featureAt } from '@/lib/site/geo';
import { b118Features, contiguousPrisonPoints, huc8Features } from '@/lib/site/geodata';
import {
  boreholesGlyph, calibrationGlyph, captionsGlyph, householdsGlyph, meshGlyph, outlineGlyph, pointsGlyph, wellsGlyph,
  type GlyphShape,
} from '@/lib/site/glyphs';
import { labelReading, placeReading, type Reading } from '@/lib/site/reading';

export interface WorkEntry {
  id: string;
  name: string;
  meta: string;
  summary: string;
  glyph: GlyphShape;
  reading: Reading;
  categories: string[];
  content: string[];
  links: { href: string; label: string }[];
  image?: { src: string; alt: string; caption?: string };
  href?: string;
  soon?: boolean;
}

export function formatYears(year?: string): string {
  if (!year) return '';
  return year.replace(/-present$/i, ' to present').replace(/^(\d{4})-(\d{4})$/, '$1 to $2');
}

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
/** "SACRAMENTO VALLEY - NORTH YUBA" → "North Yuba". */
const subbasinName = (name: string) => titleCase(name.includes(' - ') ? name.split(' - ').pop()! : name);

function watershedAt(location: { lat: number; lon: number }) {
  const f = featureAt(huc8Features(), location.lon, location.lat);
  if (!f) throw new Error(`No HUC8 watershed at ${location.lat}, ${location.lon}`);
  return f;
}

export function glyphFor(spec: GlyphSpec, location?: { lat: number; lon: number }): GlyphShape {
  switch (spec.kind) {
    case 'subbasin': return outlineGlyph(b118Features(spec.file));
    case 'watershed':
      if (!location) throw new Error('A watershed glyph needs a location');
      return outlineGlyph([watershedAt(location)]);
    case 'statewide': return outlineGlyph(huc8Features(), { dense: true });
    case 'prisons': return pointsGlyph(contiguousPrisonPoints());
    case 'mesh': return meshGlyph(spec.variant);
    case 'calibration': return calibrationGlyph();
    case 'captions': return captionsGlyph();
    case 'boreholes': return boreholesGlyph();
    case 'wells': return wellsGlyph();
    case 'households': return householdsGlyph();
  }
}

function projectReading(p: Project): Reading {
  if (p.glyph.kind === 'subbasin' && p.location) {
    const subbasins = b118Features(p.glyph.file);
    return placeReading({
      ...p.location,
      kind: 'subbasin',
      name: subbasins.map((f) => subbasinName(f.properties.Basin_Subbasin_Name)).join(' and '),
      code: subbasins.map((f) => f.properties.Basin_Subbasin_Number).join(', '),
    });
  }
  if (p.location) {
    const f = watershedAt(p.location);
    return placeReading({ ...p.location, kind: 'watershed', name: f.properties.Name, code: f.properties.HUC8 });
  }
  return labelReading(p.readout?.label ?? 'Project', p.readout?.value ?? p.title);
}

function projectEntry(p: Project): WorkEntry {
  const internal = p.links?.find((l) => l.href.startsWith('/'));
  return {
    id: p.id,
    name: p.title,
    meta: [p.place, formatYears(p.year)].filter(Boolean).join(' · '),
    summary: p.summary,
    glyph: glyphFor(p.glyph, p.location),
    reading: projectReading(p),
    categories: p.categories.filter((c) => c !== 'all'),
    content: p.content,
    links: (p.links ?? []).filter((l) => !l.href.startsWith('/')).map(({ href, label }) => ({ href, label })),
    image: p.displayType === 'image' && p.imagePath ? { src: p.imagePath, alt: p.imageAlt ?? '', caption: p.imageCaption } : undefined,
    href: internal?.href,
  };
}

function toolEntry(t: Tool): WorkEntry {
  return {
    id: t.id,
    name: t.title,
    meta: t.meta,
    summary: t.summary,
    glyph: glyphFor(t.glyph),
    reading: labelReading(t.readout.label, t.readout.value),
    categories: [],
    content: t.content,
    links: [],
    href: t.href,
    soon: t.soon,
  };
}

export const projectEntries = (): WorkEntry[] => PROJECTS.map(projectEntry);
export const toolEntries = (): WorkEntry[] => TOOLS.map(toolEntry);

/** The home page's Selected work. Entries without their own page open on the portfolio. */
export function highlightEntries(): WorkEntry[] {
  const all = [...projectEntries(), ...toolEntries()];
  return HIGHLIGHTS.map((id) => {
    const entry = all.find((e) => e.id === id);
    if (!entry) throw new Error(`Unknown highlight: ${id}`);
    return { ...entry, href: entry.soon ? undefined : entry.href ?? `/portfolio#${entry.id}` };
  });
}

/** The prisons drawn large for the home page's lead. */
export const prisonsFigure = (): GlyphShape => pointsGlyph(contiguousPrisonPoints(), { w: 640, h: 380, r: 1.5, pad: 6 });
```

- [ ] **Step 5: Run the verify command** — expected PASS. Then `npx jest --ci && npm run build` (TypeScript must accept the new required fields on every project).

- [ ] **Step 6: Commit**

```bash
git add lib/portfolio-data.ts lib/site/work.ts __tests__/site/work.test.ts
git commit -m "feat(site): project summaries, glyph specs, tools and home highlights

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: The portfolio page

**Goal:** Rebuild `/portfolio` as "Where the work is": every project as an expandable glyph entry with filters, then the tools; no table, no photos in the list.

**Files:**
- Create: `components/site/WorkList.tsx`, `components/site/ProjectsIndex.tsx`
- Modify: `app/(site)/portfolio/page.tsx`
- Test: `__tests__/site/PortfolioPage.test.tsx`

**Acceptance Criteria:**
- [ ] The page has one h1 "Where the work is", h2s "Projects" and "Tools".
- [ ] Nine project entries and five tool entries render, each with a glyph, its name, its meta (when present) and its summary.
- [ ] Filter buttons read "All 9", "Water resources 8", "Geospatial 6", "Research 1"; pressing Research leaves only Environmental Justice For Prisons visible and sets `aria-pressed="true"` on it.
- [ ] Each entry's full content (existing paragraphs) and external links are inside its `<details>`; EEJ's details link to `/portfolio/environmental-justice-prisons`.
- [ ] Pointing at the Cuyama entry puts "Cuyama Valley" and "3-013" in the readout.
- [ ] Opening `/portfolio#yuba-recharge` opens that entry.

**Verify:** `npx jest __tests__/site/PortfolioPage.test.tsx --ci`

**Steps:**

- [ ] **Step 1: Write the failing test** — `__tests__/site/PortfolioPage.test.tsx`

```tsx
import { fireEvent, render, screen, within } from '@testing-library/react';
import PortfolioPage from '@/app/(site)/portfolio/page';
import { ReadoutProvider, ReadoutStrip } from '@/components/site/Readout';

jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));

const renderPage = () =>
  render(
    <ReadoutProvider>
      <ReadoutStrip />
      <PortfolioPage />
    </ReadoutProvider>,
  );

test('headings', () => {
  renderPage();
  expect(screen.getByRole('heading', { level: 1, name: 'Where the work is' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: 'Projects' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: 'Tools' })).toBeInTheDocument();
});

test('every project and tool is an entry with a glyph', () => {
  const { container } = renderPage();
  expect(container.querySelectorAll('#projects-list > li')).toHaveLength(9);
  expect(container.querySelectorAll('#tools-list > li')).toHaveLength(5);
  expect(container.querySelectorAll('#projects-list svg.glyph')).toHaveLength(9);
  expect(container.querySelector('table')).toBeNull();
});

test('filters narrow the projects', () => {
  const { container } = renderPage();
  const filters = screen.getByRole('group', { name: 'Filter projects' });
  expect(within(filters).getAllByRole('button').map((b) => b.textContent)).toEqual([
    'All 9', 'Water resources 8', 'Geospatial 6', 'Research 1',
  ]);
  fireEvent.click(within(filters).getByRole('button', { name: 'Research 1' }));
  expect(within(filters).getByRole('button', { name: 'Research 1' })).toHaveAttribute('aria-pressed', 'true');
  const visible = Array.from(container.querySelectorAll('#projects-list > li')).filter((li) => !li.hasAttribute('hidden'));
  expect(visible).toHaveLength(1);
  expect(visible[0]).toHaveTextContent('Environmental Justice For Prisons');
});

test('details hold the full story and links', () => {
  const { container } = renderPage();
  const eej = container.querySelector('#prison-ej details')!;
  expect(within(eej as HTMLElement).getByRole('link', { name: /Open the project page/ })).toHaveAttribute('href', '/portfolio/environmental-justice-prisons');
  expect(eej).toHaveTextContent('Caitlin Mothes');
});

test('pointing at a project reads its place', () => {
  const { container } = renderPage();
  fireEvent.mouseEnter(container.querySelector('#cuyama-basin summary')!);
  const strip = screen.getByTestId('readout');
  expect(strip).toHaveTextContent('Cuyama Valley');
  expect(strip).toHaveTextContent('3-013');
});

test('a hash opens its entry', () => {
  window.location.hash = '#yuba-recharge';
  const { container } = renderPage();
  expect(container.querySelector('#yuba-recharge details')).toHaveAttribute('open');
  window.location.hash = '';
});
```

- [ ] **Step 2: Run it** — FAIL.

- [ ] **Step 3: `components/site/WorkList.tsx`**

```tsx
'use client';

// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/WorkList.tsx
// Project and tool entries (DESIGN.md › Project entry): glyph, name, meta, one line; open for the full
// story and links. Pointing at an entry puts its place in the readout.

import { useEffect } from 'react';
import { Glyph } from '@/components/site/Glyph';
import { useReadingHandlers } from '@/components/site/Readout';
import { SITE_LINK, SITE_SOON, SITE_TYPE } from '@/components/site/type';
import type { WorkEntry } from '@/lib/site/work';
import { cn } from '@/lib/utils';

function Entry({ entry, hidden }: { entry: WorkEntry; hidden?: boolean }) {
  const handlers = useReadingHandlers(entry.reading);
  const hasLinks = Boolean(entry.href) || entry.links.length > 0;
  return (
    <li id={entry.id} hidden={hidden} className="scroll-mt-24">
      <details>
        <summary
          {...handlers}
          className="glyph-host grid cursor-pointer list-none grid-cols-[52px_minmax(0,1fr)] gap-x-[18px] gap-y-1 py-[22px] min-[861px]:grid-cols-[72px_minmax(0,1fr)_auto] min-[861px]:gap-x-7 [&::-webkit-details-marker]:hidden"
        >
          <Glyph shape={entry.glyph} className="row-span-3 h-[52px] w-[52px] min-[861px]:row-span-2 min-[861px]:h-[72px] min-[861px]:w-[72px]" />
          <span className={cn(SITE_TYPE.title, 'entry-name')}>
            {entry.name}
            {entry.soon && <span className={SITE_SOON}>Coming soon</span>}
          </span>
          {entry.meta && (
            <span className={cn(SITE_TYPE.label, 'min-[861px]:col-start-3 min-[861px]:row-start-1 min-[861px]:whitespace-nowrap min-[861px]:pt-1.5 min-[861px]:text-right')}>
              {entry.meta}
            </span>
          )}
          <span className={cn(SITE_TYPE.body, 'max-w-[56ch]')}>{entry.summary}</span>
        </summary>
        <div className="grid max-w-[70ch] gap-4 pb-8 pl-[70px] min-[861px]:pl-[100px]">
          {entry.content.map((paragraph, i) => (
            <p key={i} className={SITE_TYPE.body}>{paragraph}</p>
          ))}
          {entry.image && (
            <figure className="m-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export, images unoptimized */}
              <img src={entry.image.src} alt={entry.image.alt} loading="lazy" className="block h-auto w-full max-w-[36rem]" />
              {entry.image.caption && <figcaption className={cn(SITE_TYPE.label, 'mt-2')}>{entry.image.caption}</figcaption>}
            </figure>
          )}
          {hasLinks && (
            <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
              {entry.href && (
                <li><a href={entry.href} className={SITE_LINK}>Open the project page <span aria-hidden="true">→</span></a></li>
              )}
              {entry.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className={SITE_LINK}>{link.label}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </li>
  );
}

export function WorkList({ entries, id, isHidden }: { entries: WorkEntry[]; id: string; isHidden?: (e: WorkEntry) => boolean }) {
  // A link like /portfolio#yuba-recharge opens that entry.
  useEffect(() => {
    const target = decodeURIComponent(window.location.hash.slice(1));
    const details = target ? document.getElementById(target)?.querySelector('details') : null;
    if (details) details.open = true;
  }, []);
  return (
    <ul id={id} className="m-0 mt-10 grid max-w-[72rem] list-none gap-2 p-0">
      {entries.map((e) => <Entry key={e.id} entry={e} hidden={isHidden?.(e)} />)}
    </ul>
  );
}
```

- [ ] **Step 4: `components/site/ProjectsIndex.tsx`**

```tsx
'use client';

// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/ProjectsIndex.tsx
// The portfolio's project filters and list. Categories are the ones in lib/portfolio-data.ts.

import { useState } from 'react';
import { WorkList } from '@/components/site/WorkList';
import { SITE_TYPE } from '@/components/site/type';
import type { WorkEntry } from '@/lib/site/work';
import { cn } from '@/lib/utils';

const FILTERS = [
  ['all', 'All'],
  ['water', 'Water resources'],
  ['geospatial', 'Geospatial'],
  ['research', 'Research'],
] as const;

type Filter = (typeof FILTERS)[number][0];

export function ProjectsIndex({ entries }: { entries: WorkEntry[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const count = (k: Filter) => (k === 'all' ? entries.length : entries.filter((e) => e.categories.includes(k)).length);
  return (
    <>
      <div role="group" aria-label="Filter projects" className="mt-6 flex flex-wrap gap-x-7 gap-y-2">
        {FILTERS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            aria-pressed={filter === k}
            onClick={() => setFilter(k)}
            className={cn(
              SITE_TYPE.label,
              'py-1.5 aria-pressed:font-semibold aria-pressed:text-ink-strong aria-pressed:underline aria-pressed:decoration-2 aria-pressed:underline-offset-[0.35em]',
            )}
          >
            {label} {count(k)}
          </button>
        ))}
      </div>
      <WorkList id="projects-list" entries={entries} isHidden={(e) => filter !== 'all' && !e.categories.includes(filter)} />
    </>
  );
}
```

- [ ] **Step 5: Rewrite `app/(site)/portfolio/page.tsx`**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(site)/portfolio/page.tsx
// Where the work is (DESIGN.md › Page blueprints › Portfolio): every project as its glyph, then the tools.

import type { Metadata } from 'next';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { ProjectsIndex } from '@/components/site/ProjectsIndex';
import { ReadoutDefault } from '@/components/site/Readout';
import { WorkList } from '@/components/site/WorkList';
import { SITE_TYPE } from '@/components/site/type';
import { plateReading } from '@/lib/site/reading';
import { projectEntries, toolEntries } from '@/lib/site/work';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Portfolio · Devin Hunt',
  description: 'Groundwater, recharge and geospatial projects, most of them in California, and the tools Devin Hunt builds around them.',
};

export default function PortfolioPage() {
  return (
    <>
      <ContourBackdrop page="portfolio" />
      <ReadoutDefault reading={plateReading('portfolio')} />

      <section aria-labelledby="page-title" className="grid gap-[22px] px-gutter pb-14 pt-[clamp(40px,9vh,104px)]">
        <h1 id="page-title" className={cn(SITE_TYPE.display, 'halo')}>Where the work is</h1>
        <p className={cn(SITE_TYPE.lead, 'halo max-w-[30ch]')}>
          Groundwater, recharge and geospatial projects, most of them in California, and the tools I build around them.
        </p>
      </section>

      <section aria-labelledby="projects-title" className="band px-gutter">
        <h2 id="projects-title" className={SITE_TYPE.headline}>Projects</h2>
        <p className={cn(SITE_TYPE.label, 'mt-2 max-w-[60ch]')}>
          Each project is drawn as its place, or as the thing it measured. Open one for the full story.
        </p>
        <ProjectsIndex entries={projectEntries()} />
      </section>

      <section id="tools" aria-labelledby="tools-title" className="band px-gutter">
        <h2 id="tools-title" className={SITE_TYPE.headline}>Tools</h2>
        <p className={cn(SITE_TYPE.label, 'mt-2 max-w-[60ch]')}>Software around the models, and one app outside them.</p>
        <WorkList id="tools-list" entries={toolEntries()} />
      </section>
    </>
  );
}
```

- [ ] **Step 6: Run the verify command** — expected PASS. Then `npx jest --ci && npm run build`.

- [ ] **Step 7: Commit**

```bash
git add components/site/WorkList.tsx components/site/ProjectsIndex.tsx "app/(site)/portfolio/page.tsx" __tests__/site/PortfolioPage.test.tsx
git commit -m "feat(site): portfolio as glyph entries with filters, then the tools

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: The home page

**Goal:** Rebuild `/` to the home blueprint: the name and statement on the breathing plate (no map), then Selected work led by the prisons drawn large and four highlights.

**Files:**
- Create: `components/site/Highlights.tsx`
- Modify: `app/(site)/page.tsx`, `app/layout.tsx` (metadata)
- Delete: `__tests__/stanscribe/HomePanel.test.tsx`
- Test: `__tests__/site/HomePage.test.tsx`

**Acceptance Criteria:**
- [ ] h1 "Devin Hunt"; the statement "Water resources engineer in Sacramento. I model California’s groundwater and turn the slow, manual parts of that work into tested Python and AI tools."; a "See the work" link to `/portfolio` and a "Résumé" link to `/resume`.
- [ ] h2 "Selected work"; the lead (h3 "Environmental Justice For Prisons") with a figure link and an "Explore the map" link to `/portfolio/environmental-justice-prisons`.
- [ ] Highlights in order: Yuba Subbasins Recharge Analysis (`/portfolio#yuba-recharge`), AIIWFM (`/portfolio#aiiwfm`), ZBudget Dashboards (not a link, "Coming soon"), Stan Scribe (`/stanscribe`).
- [ ] No map, no "Professional Expertise", no photos on the page; Stan Scribe text passes `findCopyViolations`.
- [ ] Root metadata title reads "Devin Hunt · Water resources engineering and AI tools".

**Verify:** `npx jest __tests__/site/HomePage.test.tsx --ci`

**Steps:**

- [ ] **Step 1: Write the failing test** — `__tests__/site/HomePage.test.tsx`; then `git rm __tests__/stanscribe/HomePanel.test.tsx` (the home panel it tested is replaced by the Stan Scribe highlight).

```tsx
import { render, screen, within } from '@testing-library/react';
import Home from '@/app/(site)/page';
import { findCopyViolations } from '@/test-utils/stanscribe';

jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));

test('the hero says who and what, with two ways in', () => {
  render(<Home />);
  expect(screen.getByRole('heading', { level: 1, name: 'Devin Hunt' })).toBeInTheDocument();
  expect(screen.getByText(/I model California’s groundwater and turn the slow, manual parts of that work into tested Python and AI tools\./)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'See the work' })).toHaveAttribute('href', '/portfolio');
  expect(screen.getByRole('link', { name: 'Résumé' })).toHaveAttribute('href', '/resume');
});

test('selected work: the lead, then four highlights in order', () => {
  render(<Home />);
  const section = screen.getByRole('heading', { level: 2, name: 'Selected work' }).closest('section')!;
  expect(within(section).getByRole('heading', { level: 3, name: 'Environmental Justice For Prisons' })).toBeInTheDocument();
  expect(within(section).getByRole('link', { name: /Explore the map/ })).toHaveAttribute('href', '/portfolio/environmental-justice-prisons');
  const items = within(section).getAllByRole('listitem');
  expect(items.map((li) => li.querySelector('.entry-name')?.firstChild?.textContent)).toEqual([
    'Yuba Subbasins Recharge Analysis', 'AIIWFM', 'ZBudget Dashboards', 'Stan Scribe',
  ]);
  expect(within(items[0]).getByRole('link')).toHaveAttribute('href', '/portfolio#yuba-recharge');
  expect(within(items[1]).getByRole('link')).toHaveAttribute('href', '/portfolio#aiiwfm');
  expect(within(items[2]).queryByRole('link')).toBeNull();
  expect(items[2]).toHaveTextContent('Coming soon');
  expect(within(items[3]).getByRole('link')).toHaveAttribute('href', '/stanscribe');
  expect(findCopyViolations(items[3].textContent ?? '')).toEqual([]);
});

test('no map, no expertise columns, no photos', () => {
  const { container } = render(<Home />);
  expect(screen.queryByRole('heading', { name: 'Professional Expertise' })).toBeNull();
  expect(container.querySelector('img')).toBeNull();
  expect(container.querySelector('path.basin')).toBeNull();
});
```

- [ ] **Step 2: Run it** — FAIL.

- [ ] **Step 3: `components/site/Highlights.tsx`**

```tsx
'use client';

// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/Highlights.tsx
// The home page's Selected work (DESIGN.md › Lead project, Project entry): the lead drawn large beside
// its text, then the highlights as glyph entries. Pointing at one puts it in the readout.

import { Glyph } from '@/components/site/Glyph';
import { useReadingHandlers } from '@/components/site/Readout';
import { SITE_LINK, SITE_SOON, SITE_TYPE } from '@/components/site/type';
import type { GlyphShape } from '@/lib/site/glyphs';
import type { WorkEntry } from '@/lib/site/work';
import { cn } from '@/lib/utils';

export function LeadProject({ entry, figure, description }: { entry: WorkEntry; figure: GlyphShape; description: string }) {
  const handlers = useReadingHandlers(entry.reading);
  return (
    <div className="mt-12 grid max-w-[76rem] items-center gap-[clamp(28px,5vw,72px)] min-[861px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <a href={entry.href} {...handlers} className="lead-figure block" aria-label={`${entry.name}: every prison in the study`}>
        <Glyph shape={figure} className="h-auto w-full" />
      </a>
      <div>
        <p className={SITE_TYPE.label}>{entry.meta}</p>
        <h3 className={cn(SITE_TYPE.headline, 'mb-3.5 mt-1.5')}>{entry.name}</h3>
        <p className={cn(SITE_TYPE.body, 'max-w-[42ch]')}>{description}</p>
        <a href={entry.href} className={cn(SITE_LINK, 'mt-[18px] inline-block')}>
          Explore the map <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  );
}

const ITEM = 'glyph-host grid grid-cols-[52px_minmax(0,1fr)] gap-x-[18px] gap-y-1 py-[22px] text-inherit no-underline min-[861px]:grid-cols-[72px_minmax(0,1fr)] min-[861px]:gap-x-7';

function Highlight({ entry }: { entry: WorkEntry }) {
  const handlers = useReadingHandlers(entry.reading);
  const body = (
    <>
      <Glyph shape={entry.glyph} className="row-span-3 h-[52px] w-[52px] min-[861px]:h-[72px] min-[861px]:w-[72px]" />
      <span className={cn(SITE_TYPE.title, 'entry-name')}>
        {entry.name}
        {entry.soon && <span className={SITE_SOON}>Coming soon</span>}
      </span>
      {entry.meta && <span className={SITE_TYPE.label}>{entry.meta}</span>}
      <span className={cn(SITE_TYPE.body, 'max-w-[56ch]')}>{entry.summary}</span>
    </>
  );
  return (
    <li>
      {entry.href ? (
        <a href={entry.href} {...handlers} className={ITEM}>{body}</a>
      ) : (
        <div {...handlers} className={ITEM}>{body}</div>
      )}
    </li>
  );
}

export function HighlightList({ entries }: { entries: WorkEntry[] }) {
  return (
    <ul className="m-0 mt-14 grid max-w-[76rem] list-none gap-x-[clamp(28px,5vw,72px)] gap-y-2 p-0 min-[861px]:grid-cols-2">
      {entries.map((e) => <Highlight key={e.id} entry={e} />)}
    </ul>
  );
}
```

- [ ] **Step 4: Rewrite `app/(site)/page.tsx`**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(site)/page.tsx
// Home (DESIGN.md › Page blueprints › Home): the name on the breathing plate, then Selected work.

import Link from 'next/link';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { HighlightList, LeadProject } from '@/components/site/Highlights';
import { ReadoutDefault } from '@/components/site/Readout';
import { SITE_BUTTON, SITE_LINK, SITE_TYPE } from '@/components/site/type';
import { plateReading } from '@/lib/site/reading';
import { highlightEntries, prisonsFigure } from '@/lib/site/work';
import { cn } from '@/lib/utils';

export default function Home() {
  const [lead, ...highlights] = highlightEntries();
  return (
    <>
      <ContourBackdrop page="home" />
      <ReadoutDefault reading={plateReading('home')} />

      <section aria-labelledby="name" className="grid min-h-[min(76svh,760px)] content-start gap-7 px-gutter pb-16 pt-[clamp(40px,10vh,120px)]">
        <h1 id="name" className={cn(SITE_TYPE.display, 'halo')}>Devin Hunt</h1>
        <p className={cn(SITE_TYPE.lead, 'halo max-w-[30ch]')}>
          Water resources engineer in Sacramento. I model California’s groundwater and turn the slow, manual parts of
          that work into tested Python and AI tools.
        </p>
        <div className="halo flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/portfolio" className={SITE_BUTTON}>See the work</Link>
          <Link href="/resume" className={cn(SITE_LINK, 'font-site text-site-body')}>Résumé</Link>
        </div>
      </section>

      <section aria-labelledby="selected-title" className="band px-gutter">
        <h2 id="selected-title" className={SITE_TYPE.headline}>Selected work</h2>
        <p className={cn(SITE_TYPE.label, 'mt-2')}>
          Two projects, two tools, and an app. More on the <Link href="/portfolio" className={SITE_LINK}>portfolio</Link>.
        </p>
        <LeadProject
          entry={lead}
          figure={prisonsFigure()}
          description="Climate, exposure and proximity percentile scores for every prison in the study, combined into one vulnerability score per facility. Each dot is a prison."
        />
        <HighlightList entries={highlights} />
      </section>
    </>
  );
}
```

- [ ] **Step 5: Root metadata** — in `app/layout.tsx` set `title` (top level, `openGraph.title`, `twitter.title`) to `'Devin Hunt · Water resources engineering and AI tools'` and `description` (all three) to `'Devin Hunt models California’s groundwater and builds the Python and AI tools around that work.'`. Leave `keywords` and the rest unchanged.

- [ ] **Step 6: Run the verify command** — expected PASS. Then `npx jest --ci && npm run build`.

- [ ] **Step 7: Commit**

```bash
git add -A components/site/Highlights.tsx "app/(site)/page.tsx" app/layout.tsx __tests__
git commit -m "feat(site): home is the name on the plate, then Selected work

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: The résumé page and its watershed map

**Goal:** Put the interactive California watershed map in the résumé's header beside the résumé's opening, and set the rest of the résumé in the site type on a band.

**Files:**
- Create: `lib/site/map.ts`, `components/site/WatershedMap.tsx`
- Modify: `app/(site)/resume/page.tsx`, `components/resume/ExperienceItem.tsx`, `components/resume/ResumeSection.tsx`, `components/resume/SkillsList.tsx`
- Test: `__tests__/site/map.test.ts`, `__tests__/site/ResumePage.test.tsx`

**Acceptance Criteria:**
- [ ] `resumeMap()` returns 140 basins, the four located projects as pins plus a non-interactive Sacramento pin, and marks the Cuyama, Yuba-area, Harvest-area and Antelope watersheds `worked`.
- [ ] The page: h1 "Devin Hunt", title "AI Specialist and Groundwater Modeler", the full existing summary paragraph, a "Download PDF" link to `/data/Resume_DevinHunt_Jun2026.pdf`, and the map group labelled "Map of California's watersheds with the places Devin has worked".
- [ ] Four pins are buttons; focusing the Cuyama pin and pressing Enter shows "Cuyama Valley Groundwater Basin" in the caption and "Cuyama Valley" in the readout.
- [ ] Experience, Education, Professional skills, Technical skills and Additional achievements keep every existing string.
- [ ] The map, strip, header and footer are hidden in print.

**Verify:** `npx jest __tests__/site/map.test.ts __tests__/site/ResumePage.test.tsx --ci`

**Steps:**

- [ ] **Step 1: Write the failing tests**

`__tests__/site/map.test.ts`:

```ts
import { resumeMap } from '@/lib/site/map';

test('the résumé map: every watershed, the located projects and home', () => {
  const { basins, pins, viewBox } = resumeMap();
  expect(basins).toHaveLength(140);
  expect(pins.map((p) => p.id)).toEqual(['cuyama-basin', 'yuba-recharge', 'harvest-water', 'antelope-wells', 'home']);
  expect(pins.find((p) => p.id === 'home')).toMatchObject({ home: true, label: 'Sacramento' });
  const worked = basins.filter((b) => b.worked).map((b) => b.name).sort();
  expect(worked).toEqual(['Antelope-Fremont Valleys', 'Cuyama', 'Honcut Headwaters-Lower Feather', 'Upper Cosumnes']);
  expect(viewBox).toHaveLength(4);
});
```

`__tests__/site/ResumePage.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import ResumePage from '@/app/(site)/resume/page';
import { ReadoutProvider, ReadoutStrip } from '@/components/site/Readout';

jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));

const renderPage = () =>
  render(
    <ReadoutProvider>
      <ReadoutStrip />
      <ResumePage />
    </ReadoutProvider>,
  );

test('the résumé opens with name, title, summary and the PDF', () => {
  renderPage();
  expect(screen.getByRole('heading', { level: 1, name: 'Devin Hunt' })).toBeInTheDocument();
  expect(screen.getByText('AI Specialist and Groundwater Modeler')).toBeInTheDocument();
  expect(screen.getByText(/guiding their early ideas toward production-ready solutions\./)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Download PDF/ })).toHaveAttribute('href', '/data/Resume_DevinHunt_Jun2026.pdf');
});

test('the header map: pins are buttons that name their project', () => {
  renderPage();
  expect(screen.getByRole('group', { name: "Map of California's watersheds with the places Devin has worked" })).toBeInTheDocument();
  const pins = screen.getAllByRole('button', { name: /, / });
  expect(pins).toHaveLength(4);
  const cuyama = screen.getByRole('button', { name: /Cuyama Valley Groundwater Basin/ });
  fireEvent.keyDown(cuyama, { key: 'Enter' });
  expect(screen.getByText('Cuyama Valley Groundwater Basin', { selector: 'b' })).toBeInTheDocument();
  expect(screen.getByTestId('readout')).toHaveTextContent('Cuyama Valley');
});

test('every résumé section is still there', () => {
  renderPage();
  for (const name of ['Experience', 'Education', 'Professional skills', 'Technical skills', 'Additional achievements']) {
    expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
  }
  expect(screen.getByText('Eagle Scout Award, Boy Scouts of America, August 2018')).toBeInTheDocument();
  expect(screen.getByText(/Supported a PhD dissertation on stream metabolism/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run them** — FAIL.

- [ ] **Step 3: `lib/site/map.ts`**

```ts
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/site/map.ts
// The résumé header map (DESIGN.md › Watershed map): California's HUC8 watersheds as SVG paths, the
// watersheds where the located projects sit, and their pins. Server only.

import { PROJECTS } from '@/lib/portfolio-data';
import { featureAt, pathData, polygonsOf, project, type XY } from '@/lib/site/geo';
import { huc8Features } from '@/lib/site/geodata';
import { HOME_BASE, type Reading } from '@/lib/site/reading';
import { formatYears, projectEntries } from '@/lib/site/work';

export interface MapBasin { huc: string; name: string; d: string; worked: boolean }

export type LabelSide = 'right' | 'left' | 'below';

export interface MapPin {
  id: string;
  name: string;
  label: string;
  place: string;
  years: string;
  x: number;
  y: number;
  labelSide: LabelSide;
  home?: boolean;
  huc?: string;
  reading: Reading;
}

/** Labels that would run into a neighbour or off the map go the other way. */
const LABEL_SIDE: Record<string, LabelSide> = { 'antelope-wells': 'left', 'harvest-water': 'below' };
const HOME = { lat: 38.58, lon: -121.49 };

export function resumeMap() {
  const features = huc8Features();
  const entries = projectEntries();
  const located = PROJECTS.filter((p) => p.location && p.place);
  const pins: MapPin[] = located.map((p) => {
    const { lat, lon } = p.location!;
    const [x, y] = project([lon, lat]);
    return {
      id: p.id,
      name: p.title,
      label: p.place!,
      place: p.place!,
      years: formatYears(p.year),
      x,
      y,
      labelSide: LABEL_SIDE[p.id] ?? 'right',
      huc: featureAt(features, lon, lat)?.properties.HUC8,
      reading: entries.find((e) => e.id === p.id)!.reading,
    };
  });
  const [hx, hy] = project([HOME.lon, HOME.lat]);
  pins.push({ id: 'home', name: 'Sacramento', label: 'Sacramento', place: 'Sacramento', years: '', x: hx, y: hy, labelSide: 'right', home: true, reading: HOME_BASE });

  const worked = new Set(pins.map((p) => p.huc).filter(Boolean));
  const basins: MapBasin[] = features.map((f) => ({
    huc: f.properties.HUC8,
    name: f.properties.Name,
    d: pathData(polygonsOf(f.geometry), project, 2),
    worked: worked.has(f.properties.HUC8),
  }));
  const [x0, y0]: XY = project([-124.6, 42.15]);
  const [x1, y1]: XY = project([-113.9, 32.4]);
  return { basins, pins, viewBox: [x0, y0, x1 - x0, y1 - y0] as [number, number, number, number] };
}
```

- [ ] **Step 4: `components/site/WatershedMap.tsx`**

```tsx
'use client';

// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/WatershedMap.tsx
// The résumé header map (DESIGN.md › Watershed map). Pointing reports the coordinates and watershed in the
// readout; pins are buttons (Enter or Space selects) and the caption names the selected project. Pins and
// labels keep a fixed screen size at any map scale.

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useReadout } from '@/components/site/Readout';
import { SITE_TYPE } from '@/components/site/type';
import { unproject } from '@/lib/site/geo';
import type { MapBasin, MapPin } from '@/lib/site/map';
import { formatLat, formatLon } from '@/lib/site/reading';
import { cn } from '@/lib/utils';

const LABEL = { right: [10, 5, 'start'], left: [-10, 5, 'end'], below: [8, 22, 'start'] } as const;

export function WatershedMap({ basins, pins, viewBox }: { basins: MapBasin[]; pins: MapPin[]; viewBox: [number, number, number, number] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { show, clear } = useReadout();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Map units per screen pixel; jsdom has no layout, so it keeps a sane default there.
  const [unit, setUnit] = useState(0.016);
  const selected = pins.find((p) => p.id === selectedId);

  useEffect(() => {
    const svg = svgRef.current;
    const measure = () => {
      const m = typeof svg?.getScreenCTM === 'function' ? svg.getScreenCTM() : null;
      if (m && m.a) setUnit(1 / m.a);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const select = (pin: MapPin) => {
    setSelectedId(pin.id);
    show(pin.reading);
  };

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const m = svgRef.current?.getScreenCTM?.();
    if (!m) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const [lon, lat] = unproject([pt.x, pt.y]);
    const huc = (e.target as Element).getAttribute?.('data-huc');
    const basin = huc ? basins.find((b) => b.huc === huc) : undefined;
    show({
      fields: [
        { label: 'Lat', value: formatLat(lat) },
        { label: 'Lon', value: formatLon(lon) },
        { label: 'Watershed', value: basin ? basin.name : 'Outside California' },
        { label: 'HUC8', value: basin ? basin.huc : '—', wide: true },
      ],
      note: 'California watersheds · USGS HUC8',
    });
  };

  const onLeave = () => (selected ? show(selected.reading) : clear());

  return (
    <figure className="m-0 print:hidden">
      <svg
        ref={svgRef}
        viewBox={viewBox.join(' ')}
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label="Map of California's watersheds with the places Devin has worked"
        className="block aspect-[0.86] h-auto w-full min-[861px]:aspect-auto min-[861px]:h-[min(72svh,680px)]"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <g>
          {basins.map((b) => (
            <path key={b.huc} data-huc={b.huc} d={b.d} className={cn('basin', b.worked && 'basin-worked', selected?.huc === b.huc && 'basin-selected')} />
          ))}
        </g>
        <g>
          {pins.map((p) => {
            const [dx, dy, anchor] = LABEL[p.labelSide];
            const interactive = !p.home;
            return (
              <g
                key={p.id}
                className={cn('pin', p.home && 'pin-home', selectedId === p.id && 'pin-selected')}
                {...(interactive && {
                  role: 'button',
                  tabIndex: 0,
                  'aria-label': `${p.name}, ${p.place}`,
                  'aria-pressed': selectedId === p.id,
                  onClick: () => select(p),
                  onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      select(p);
                    }
                  },
                })}
              >
                <circle cx={p.x} cy={p.y} r={5 * unit} />
                <text x={p.x + dx * unit} y={p.y + dy * unit} fontSize={15 * unit} textAnchor={anchor} style={{ strokeWidth: 4 * unit }}>
                  {p.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <figcaption aria-live="polite" className={cn(SITE_TYPE.label, 'mt-2 min-h-[3em]')}>
        {selected ? (
          <>
            <b className="font-semibold text-ink-strong">{selected.name}</b> · {selected.years} · {selected.place}
          </>
        ) : (
          'Choose a place to see the project there.'
        )}
      </figcaption>
    </figure>
  );
}
```

- [ ] **Step 5: Restyle the résumé components**

`components/resume/ResumeSection.tsx` — keep the header comment and props; replace the return with:

```tsx
    <section className="resume-section pt-12 first:pt-0">
      <h2 className={SITE_TYPE.headline}>{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
```

and add `import { SITE_TYPE } from '@/components/site/type';`.

`components/resume/ExperienceItem.tsx` — replace the return with:

```tsx
    <div className="resume-item grid grid-cols-1 gap-x-6 gap-y-1 border-0 py-6 first:pt-0 min-[861px]:grid-cols-[minmax(0,1fr)_auto]">
      <h3 className={SITE_TYPE.title}>{title}</h3>
      <p className={cn(SITE_TYPE.label, 'min-[861px]:col-start-2 min-[861px]:row-start-1 min-[861px]:whitespace-nowrap min-[861px]:pt-1.5')}>{period}</p>
      <p className={cn(SITE_TYPE.body, 'text-ink-muted')}>{company}</p>
      <ul className="col-span-full mt-3 grid max-w-[70ch] list-disc gap-2 pl-5">
        {responsibilities.map((responsibility, index) => (
          <li key={index} className={SITE_TYPE.body}>{responsibility}</li>
        ))}
      </ul>
    </div>
```

and add `import { SITE_TYPE } from '@/components/site/type';` and `import { cn } from '@/lib/utils';`.

`components/resume/SkillsList.tsx` — replace the `<ul>` className with `cn(SITE_TYPE.body, 'list-disc pl-5 sm:columns-2 sm:gap-x-10 [&>li]:mb-1 [&>li]:break-inside-avoid')` and add the two imports.

- [ ] **Step 6: Rewrite `app/(site)/resume/page.tsx`** — keep the `professionalSkills` and `technicalSkills` arrays and every `ExperienceItem` (titles, companies, periods, responsibilities) and the Education and Additional achievements content exactly as they are; replace the page shell around them:

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(site)/resume/page.tsx
// Résumé (DESIGN.md › Page blueprints › Résumé): the working map is the header beside the résumé's opening.

import type { Metadata } from 'next';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import ResumeSection from '@/components/resume/ResumeSection';
import ExperienceItem from '@/components/resume/ExperienceItem';
import SkillsList from '@/components/resume/SkillsList';
import { ReadoutDefault } from '@/components/site/Readout';
import { WatershedMap } from '@/components/site/WatershedMap';
import { SITE_BUTTON, SITE_LINK, SITE_TYPE } from '@/components/site/type';
import { resumeMap } from '@/lib/site/map';
import { HOME_BASE } from '@/lib/site/reading';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Résumé · Devin Hunt',
  description: 'AI specialist and groundwater modeler in Sacramento: tested Python automation, AI-grounded applications and IWFM modeling.',
};

export default function ResumePage() {
  const professionalSkills = [/* unchanged */];
  const technicalSkills = [/* unchanged */];
  const map = resumeMap();

  return (
    <>
      <ContourBackdrop page="resume" />
      <ReadoutDefault reading={HOME_BASE} />

      <section aria-labelledby="name" className="grid items-start gap-[clamp(24px,4vw,64px)] px-gutter pb-12 pt-[clamp(32px,6vh,72px)] min-[861px]:grid-cols-2">
        <div className="grid content-start gap-5">
          <h1 id="name" className={cn(SITE_TYPE.display, 'halo')}>Devin Hunt</h1>
          <p className={cn(SITE_TYPE.lead, 'halo font-semibold text-ink-strong')}>AI Specialist and Groundwater Modeler</p>
          <p className={cn(SITE_TYPE.label, 'halo')}>Sacramento, CA · contact@devinhunt.com · devinhunt.com · github.com/dhunt22</p>
          <p className={cn(SITE_TYPE.body, 'halo max-w-[58ch]')}>
            {/* the existing summary paragraph, word for word */}
          </p>
          <div className="halo flex flex-wrap items-center gap-x-6 gap-y-3 print:hidden">
            <a href="/data/Resume_DevinHunt_Jun2026.pdf" target="_blank" rel="noopener noreferrer" className={SITE_BUTTON} aria-label="Download PDF (opens in a new tab)">
              Download PDF
            </a>
            <a href="#experience" className={cn(SITE_LINK, 'font-site text-site-body')}>Experience</a>
          </div>
        </div>
        <WatershedMap basins={map.basins} pins={map.pins} viewBox={map.viewBox} />
      </section>

      <section id="experience" aria-label="Résumé" className="band px-gutter">
        <div className="max-w-[72rem]">
          <ResumeSection title="Experience">{/* the three ExperienceItems, unchanged */}</ResumeSection>
          <ResumeSection title="Education">{/* the education block, restyled below */}</ResumeSection>
          <ResumeSection title="Professional skills"><SkillsList skills={professionalSkills} /></ResumeSection>
          <ResumeSection title="Technical skills"><SkillsList skills={technicalSkills} /></ResumeSection>
          <ResumeSection title="Additional achievements">
            <div className={cn(SITE_TYPE.body, 'grid gap-2')}>
              <p>Eagle Scout Award, Boy Scouts of America, August 2018</p>
              <p>Wilderness First Aid, NOLS Wilderness Medicine, May 2016</p>
            </div>
          </ResumeSection>
        </div>
      </section>
    </>
  );
}
```

Replace each `/* unchanged */` and `/* … */` comment with the existing content it names. Restyle the education block's classes: the `h3` gets `SITE_TYPE.title`, its paragraphs `SITE_TYPE.body`, the "Relevant coursework:" `h4` gets `cn(SITE_TYPE.body, 'font-semibold text-ink-strong')`, and the coursework `ul` gets `cn(SITE_TYPE.body, 'mt-2 grid list-disc gap-1 pl-5')` (drop `marker:text-eyebrow` and `font-display`). Section titles change to sentence case ("Professional skills", "Technical skills", "Additional achievements") per DESIGN.md › The Plain Words Rule.

- [ ] **Step 7: Run the verify command** — expected PASS. Then `npx jest --ci && npm run build`.

- [ ] **Step 8: Commit**

```bash
git add lib/site/map.ts components/site/WatershedMap.tsx "app/(site)/resume/page.tsx" components/resume __tests__/site/map.test.ts __tests__/site/ResumePage.test.tsx
git commit -m "feat(site): résumé header is the working watershed map

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Outdoors, the EEJ project page and the 404

**Goal:** Bring the remaining portfolio pages into the system: Outdoors (photos lead here), the EEJ project page (its live map stays), and the 404 inside `SiteChrome`.

**Files:**
- Modify: `app/(site)/interests/page.tsx`, `components/interests/InterestSection.tsx`, `app/(site)/portfolio/environmental-justice-prisons/page.tsx`, `app/not-found.tsx`
- Test: `__tests__/site/OtherPages.test.tsx`

**Acceptance Criteria:**
- [ ] Outdoors: h1 "Outdoors"; sections `#exploration`, `#fishing`, `#bicycles`, `#community`, `#mycology`, `#photography`, `#gis` each with an h2; every image keeps its existing alt; no `.panel`, no italics, no eyebrow classes.
- [ ] EEJ: h1 "Environmental Justice For Prisons"; a meta line "Geospatial analysis · NASA grant project · 2022 to 2023" below it; "Published Dataset" and "Publication" links keep their hrefs; `IndicatorBrowser` still renders; sections are bands with h2s in `SITE_TYPE.headline`; the readout default is "Prisons · 1,865 across the United States".
- [ ] 404: renders inside `.site` with the new header; h1 "Page not found"; links Home `/`, Portfolio `/portfolio`, Résumé `/resume`, Outdoors `/interests`, and the email.
- [ ] `grep -rn "panel\|eyebrow\|section-title\|link-quiet\|font-display italic" "app/(site)" app/not-found.tsx components/interests` returns nothing.

**Verify:** `npx jest __tests__/site/OtherPages.test.tsx --ci && ! grep -rnE "\\bpanel\\b|eyebrow|section-title|link-quiet|italic" "app/(site)" app/not-found.tsx components/interests`

**Steps:**

- [ ] **Step 1: Write the failing test** — `__tests__/site/OtherPages.test.tsx`

```tsx
import { render, screen, within } from '@testing-library/react';
import InterestsPage from '@/app/(site)/interests/page';
import EejPage from '@/app/(site)/portfolio/environmental-justice-prisons/page';
import NotFound from '@/app/not-found';

jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));
jest.mock('@/components/portfolio/IndicatorBrowser', () => ({ IndicatorBrowser: () => <div data-testid="indicators" /> }));
jest.mock('next/navigation', () => ({ usePathname: () => '/missing' }));

test('Outdoors keeps every interest and photo', () => {
  const { container } = render(<InterestsPage />);
  expect(screen.getByRole('heading', { level: 1, name: 'Outdoors' })).toBeInTheDocument();
  for (const id of ['exploration', 'fishing', 'bicycles', 'community', 'mycology', 'photography', 'gis']) {
    expect(container.querySelector(`#${id} h2`)).not.toBeNull();
  }
  expect(screen.getByAltText('A calm alpine lake at dusk near Winter Park, Colorado')).toBeInTheDocument();
  expect(container.querySelector('.panel, .italic, .eyebrow')).toBeNull();
});

test('the EEJ page keeps its map and links', () => {
  render(<EejPage />);
  expect(screen.getByRole('heading', { level: 1, name: 'Environmental Justice For Prisons' })).toBeInTheDocument();
  expect(screen.getByText('Geospatial analysis · NASA grant project · 2022 to 2023')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /GitHub repository/ })).toHaveAttribute('href', 'https://github.com/GeospatialCentroid/NASA-prison-EJ/releases/tag/v2023-1');
  expect(screen.getByTestId('indicators')).toBeInTheDocument();
});

test('the 404 sits in the site frame with ways back', () => {
  const { container } = render(<NotFound />);
  expect(container.querySelector('.site header')).not.toBeNull();
  const main = screen.getByRole('main');
  expect(within(main).getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  for (const [name, href] of [['Home', '/'], ['Portfolio', '/portfolio'], ['Résumé', '/resume'], ['Outdoors', '/interests']]) {
    expect(within(main).getByRole('link', { name })).toHaveAttribute('href', href);
  }
});
```

- [ ] **Step 2: Run it** — FAIL.

- [ ] **Step 3: `components/interests/InterestSection.tsx`** — keep the interfaces and the DOM order note; replace the section's return with:

```tsx
    <section id={id} className="grid scroll-mt-24 gap-[clamp(24px,4vw,56px)] py-10 first:pt-0 min-[861px]:grid-cols-12 min-[861px]:items-center">
      <div className={cn('min-[861px]:col-span-7', imagePosition === 'left' && 'min-[861px]:order-last')}>
        <h2 className={SITE_TYPE.headline}>{title}</h2>
        {quote && (
          <figure className="m-0 mt-5">
            <blockquote className={cn(SITE_TYPE.lead, 'm-0 max-w-[34rem] text-ink-strong')}>“{quote.text}”</blockquote>
            <figcaption className={cn(SITE_TYPE.label, 'mt-2')}>{quote.author}</figcaption>
          </figure>
        )}
        {paragraphs.map((paragraph, index) => (
          <p key={index} className={cn(SITE_TYPE.body, 'mt-4 max-w-[60ch]')}>{paragraph}</p>
        ))}
        {externalLink && (
          <a
            href={externalLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(SITE_LINK, 'mt-6 inline-block font-site text-site-body')}
            aria-label={externalLink.ariaLabel || `${externalLink.label} - Open in new tab`}
          >
            {externalLink.label}
          </a>
        )}
      </div>
      <figure className={cn('m-0 min-[861px]:col-span-5', imagePosition === 'left' && 'min-[861px]:order-first')}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, images unoptimized */}
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          className={cn('block aspect-[4/3] w-full object-cover', image.objectPosition === 'bottom' ? 'object-bottom' : 'object-center')}
        />
        {image.caption && <figcaption className={cn(SITE_TYPE.label, 'mt-3 max-w-[40rem]')}>{image.caption}</figcaption>}
      </figure>
    </section>
```

Add `import { SITE_LINK, SITE_TYPE } from '@/components/site/type';` and `import { cn } from '@/lib/utils';`.

- [ ] **Step 4: `app/(site)/interests/page.tsx`** — keep `interestSections` exactly; replace the page component:

```tsx
export const metadata: Metadata = {
  title: 'Outdoors · Devin Hunt',
  description: 'Exploration, fishing, bicycles, community, mycology and photography, in Devin Hunt’s own photos.',
};

export default function InterestsPage() {
  return (
    <>
      <ContourBackdrop page="interests" />
      <ReadoutDefault reading={plateReading('interests')} />
      <section aria-labelledby="page-title" className="grid gap-[22px] px-gutter pb-14 pt-[clamp(40px,9vh,104px)]">
        <h1 id="page-title" className={cn(SITE_TYPE.display, 'halo')}>Outdoors</h1>
        <p className={cn(SITE_TYPE.lead, 'halo max-w-[30ch]')}>
          What I do outside work, in my own photos.
        </p>
      </section>
      <div className="band px-gutter">
        <div className="max-w-[76rem]">
          {interestSections.map((section) => <InterestSection key={section.id} {...section} />)}
          <section id="gis" className="scroll-mt-24 py-10">
            <h2 className={SITE_TYPE.headline}>GIS</h2>
            <p className={cn(SITE_TYPE.body, 'mt-4 max-w-[60ch]')}>
              I love data visualization and deriving digital beauty from the physical world.
              See these topographic vectors I made for the website backgrounds.
            </p>
            <p className={cn(SITE_TYPE.body, 'mt-4 max-w-[60ch]')}>
              Contact me if you are planning a community event or share an interest in GIS- lets collaborate!
            </p>
            <div className="mt-6 grid gap-6 min-[861px]:grid-cols-2">
              {/* the two existing image pairs (light img + dark img each), with the wrapper div's classes
                  changed from "overflow-hidden rounded border border-border bg-card" to "overflow-hidden bg-card" */}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
```

Add imports: `import type { Metadata } from 'next';`, `ReadoutDefault`, `SITE_TYPE`, `plateReading`, `cn`. Replace the inner comment with the four existing `<img>` elements.

- [ ] **Step 5: EEJ page** — in `app/(site)/portfolio/environmental-justice-prisons/page.tsx`:
  - Replace the outer `<div className="relative min-h-svh">` and `<div className="container relative z-10 mx-auto px-6">` wrappers with a fragment, and add `<ReadoutDefault reading={labelReading('Prisons', '1,865 across the United States')} />` after `<ContourBackdrop page="ej" />`.
  - Hero: `<header className="grid gap-5 px-gutter pb-12 pt-[clamp(32px,6vh,72px)]">`; delete the eyebrow `<p>` and add, directly after the `h1`, `<p className={cn(SITE_TYPE.label, 'halo')}>Geospatial analysis · NASA grant project · 2022 to 2023</p>`; the `h1` className becomes `cn(SITE_TYPE.display, 'halo max-w-[18ch]')`; the lead `<p>` becomes `cn(SITE_TYPE.lead, 'halo max-w-[40rem]')`; both links' className `link-quiet` becomes `cn(SITE_LINK, 'font-site text-site-body')`.
  - Each `<section className="panel mb-4" …>` becomes `<section className="band px-gutter" …>`; each `className="section-title mb-6"` becomes `cn(SITE_TYPE.headline, 'mb-6')`; each `font-display text-xl text-ink-strong` h3 becomes `SITE_TYPE.title` (keep its margin classes); `leading-relaxed text-ink-body` wrappers become `SITE_TYPE.body`; `marker:text-eyebrow` is removed from lists.
  - Imports: `ReadoutDefault`, `SITE_LINK`, `SITE_TYPE`, `labelReading`, `cn`.
  - Keep every string and link exactly.

- [ ] **Step 6: `app/not-found.tsx`** — replace the file body (keep the copyright header):

```tsx
import Link from 'next/link';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { ReadoutDefault } from '@/components/site/Readout';
import { SiteChrome } from '@/components/site/SiteChrome';
import { SITE_BUTTON, SITE_LINK, SITE_TYPE } from '@/components/site/type';
import { plateReading } from '@/lib/site/reading';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <SiteChrome>
      <ContourBackdrop page="notFound" />
      <ReadoutDefault reading={plateReading('notFound')} />
      <section aria-labelledby="nf-title" className="grid min-h-[60svh] content-start gap-6 px-gutter pb-16 pt-[clamp(40px,10vh,120px)]">
        <p className={cn(SITE_TYPE.display, 'halo')} aria-hidden="true">404</p>
        <h1 id="nf-title" className={cn(SITE_TYPE.headline, 'halo')}>Page not found</h1>
        <p className={cn(SITE_TYPE.lead, 'halo max-w-[40ch]')}>
          Looks like this stream dried up. The page wandered off like water finding a new path.
        </p>
        <nav aria-label="Ways back" className="halo flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/" className={SITE_BUTTON}>Home</Link>
          <Link href="/portfolio" className={cn(SITE_LINK, 'font-site text-site-body')}>Portfolio</Link>
          <Link href="/resume" className={cn(SITE_LINK, 'font-site text-site-body')}>Résumé</Link>
          <Link href="/interests" className={cn(SITE_LINK, 'font-site text-site-body')}>Outdoors</Link>
          <a href="mailto:contact@devinhunt.com" className={cn(SITE_LINK, 'font-site text-site-body')}>contact@devinhunt.com</a>
        </nav>
      </section>
    </SiteChrome>
  );
}
```

- [ ] **Step 7: Run the verify command** — expected PASS. Then `npx jest --ci && npm run build`.

- [ ] **Step 8: Commit**

```bash
git add "app/(site)/interests" components/interests "app/(site)/portfolio/environmental-justice-prisons" app/not-found.tsx __tests__/site/OtherPages.test.tsx
git commit -m "feat(site): Outdoors, the EEJ page and the 404 in the Working Map system

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Remove what the redesign retired

**Goal:** Delete the components, CSS classes and font the portfolio no longer uses, keeping everything the Stan Scribe pages and legacy chrome still need.

**Files:**
- Delete: `components/portfolio/ProjectIndex.tsx`, `components/ui/tabs.tsx`
- Modify: `app/globals.css` (remove `.eyebrow-mono`, `.link-quiet-mono`, `.section-title`, `.display`, `.lead` if unused), `app/fonts.ts` + `app/layout.tsx` (remove JetBrains Mono)

**Acceptance Criteria:**
- [ ] `grep -rnE "ProjectIndex|components/ui/tabs|JetBrains|jetbrains" app components lib hooks` returns nothing.
- [ ] For each removed CSS class, `grep -rn "<class>" app components` returns nothing before removal (a class still used is kept and listed in the commit message).
- [ ] `.eyebrow`, `.link-quiet`, `.panel` stay (legacy header/footer and Stan Scribe use them).
- [ ] `npx jest --ci` and `npm run build` pass; Stan Scribe tests unchanged.

**Verify:** `! grep -rnE "ProjectIndex|components/ui/tabs|JetBrains|jetbrains" app components lib hooks && npx jest --ci && npm run build`

**Steps:**

- [ ] **Step 1:** `git rm components/portfolio/ProjectIndex.tsx components/ui/tabs.tsx`
- [ ] **Step 2:** For each of `eyebrow-mono`, `link-quiet-mono`, `section-title`, `display`, `lead`: run `grep -rnw "<class>" app components --include=*.tsx`; when empty, delete its rule from `app/globals.css`.
- [ ] **Step 3:** In `app/fonts.ts` remove `JetBrains_Mono` from the import and delete the `jetbrains` export; in `app/layout.tsx` remove `jetbrains` from the import and `${jetbrains.variable}` from `<body>`. `tailwind.config.js` keeps `mono: ['var(--font-mono)', 'SF Mono', 'Consolas', 'monospace']` (it falls back to system mono outside `.site`).
- [ ] **Step 4:** Run the verify command.
- [ ] **Step 5: Commit**

```bash
git add -A app components
git commit -m "chore(site): remove the retired project index, tabs, mono font and unused classes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

```json:metadata
{"modelTier": "mechanical"}
```

---

### Task 13: Critique and browser iteration

**Goal:** Review the rendered pages with Impeccable's critique and Taste-Skill's inspector at 1440, 768 and 390 in light and dark, fix the most important problems, and record decisions.

**Files:**
- Modify: whichever `components/site/*`, page or CSS files the fixes touch; `DESIGN.md` (a "Decision log" section)

**Acceptance Criteria:**
- [ ] `node .claude/skills/design-taste-frontend/scripts/inspect.mjs <url> --widths 1440,768,390` runs for `/`, `/portfolio`, `/resume`, `/interests`, `/portfolio/environmental-justice-prisons` in light and dark; every remaining FAIL is either fixed or listed in DESIGN.md's decision log as deliberate (label halo, no photos on work pages, minimal motion, no video).
- [ ] `.claude/skills/impeccable/scripts/impeccable detect --no-advisory <url>` reports no findings for each page, or each remaining one is listed as deliberate.
- [ ] Keyboard walk on each page reaches every link, filter, entry summary and map pin in reading order with a visible focus ring; captured as a list in the close note.
- [ ] No horizontal overflow at 390px: `document.documentElement.scrollWidth === window.innerWidth` on each page.
- [ ] No console errors from app code on any page.
- [ ] The top three problems per page (from the screenshots, not only the meters) are fixed and re-screenshotted.

**Verify:** `npx jest --ci && npm run build` plus the inspector and detector commands above against `npx next dev -p 3100`.

**Steps:**

- [ ] **Step 1:** Start `npx next dev -p 3100`; run the inspector and detector for every page and theme; read every screenshot.
- [ ] **Step 2:** Write the critique (what, where, why, fix, fits the direction or not) for each page in the close note; separate defects from preferences.
- [ ] **Step 3:** Fix the three most important per page; commit each fix (`fix(site): …`).
- [ ] **Step 4:** Re-run the inspector and detector and compare before and after.
- [ ] **Step 5:** Add `## Decision log` to `DESIGN.md` with each deliberate exception and the reason; commit.

```json:metadata
{"modelTier": "frontier"}
```

---

### Task 14: Final QA and handover docs (gate)

**Goal:** Verify the redesign end to end against Phase 10 of the owner's workflow and leave the documentation future sessions need.

> **USER-ORDERED GATE — NON-SKIPPABLE.** This task was requested by the user in the current conversation. It MUST NOT be closed by walking around it, by declaring it "verified inline", or by substituting a cheaper check. Close only after every item in `acceptanceCriteria` has been re-validated independently, with output captured.

**Files:**
- Create: `CLAUDE.md`
- Modify: `DESIGN.md` (implementation map reflects what shipped), `PRODUCT.md` (if facts changed)

**Acceptance Criteria:**
- [ ] `npx jest --ci` passes; the suite and test counts are pasted in the close note.
- [ ] `npm run build` exits 0 and every `out/` file in Global Constraints exists.
- [ ] `/stanscribe` and `/stanscribe-light` are visually unchanged: h1 computed font contains "Newsreader", legacy header present, screenshots at 1440 and 390 match the pre-redesign ones in `.taste-skill/before/stanscribe*/`.
- [ ] Each portfolio page at 390px: no horizontal overflow; at 1440px and 390px in light and dark: no inspector `[contrast]` findings.
- [ ] `prefers-reduced-motion: reduce` (emulated via Chrome DevTools protocol or the inspector's reduced-motion pass) leaves no animated glow bands: `document.querySelectorAll('[data-contour-plate] g[data-band]').length === 0`.
- [ ] `CLAUDE.md` exists, under 40 lines, telling future sessions to read `DESIGN.md` and `PRODUCT.md` before UI work, to keep Stan Scribe on its own system, to run `npx jest --ci` and `npm run build`, and to check changes in a browser at 1440 and 390 in both themes.
- [ ] `DESIGN.md`'s implementation map matches the shipped files (the `.site` remapping, route groups, component names).

**Verify:** `npx jest --ci && npm run build && ls out/index.html out/portfolio.html out/portfolio/environmental-justice-prisons.html out/resume.html out/interests.html out/404.html out/stanscribe/index.html out/stanscribe-light/index.html && wc -l CLAUDE.md`

**Steps:**

- [ ] **Step 1:** Run the verify command; paste outputs.
- [ ] **Step 2:** Run the browser checks above; paste outputs and screenshot paths.
- [ ] **Step 3:** Write `CLAUDE.md` and update `DESIGN.md`; `git add -f CLAUDE.md DESIGN.md PRODUCT.md` (they are allowed by `.gitignore` exceptions; `-f` is harmless).
- [ ] **Step 4: Commit**

```bash
git commit -m "docs: CLAUDE.md and the shipped design system

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

```json:metadata
{"userGate": true, "tags": ["user-gate"], "modelTier": "frontier"}
```
