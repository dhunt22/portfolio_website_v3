# Stan Scribe listing-style pages implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Stan Scribe pages as an extension of the App Store listing: a hero on the contours, one full-width see-through card under it, short lines with icons, rows that open on a click, a caption demo, a new share card and the app's own tab icon.

**Architecture:** The pages stay static server components in `app/(stanscribe)/`. Three small new components (`IconTile`, `Disclosure`, `AppIcon`) and one client component (`CaptionDemo`) carry the new patterns. The band look moves from masked `::before` layers to one plain `background` per section in `app/globals.css`. A Node script draws the share card through a headless Chromium browser.

**Tech Stack:** Next.js 16 App Router (static export), React 19, Tailwind 4 (`@theme inline` in `app/globals.css`), Jest 30 with Testing Library (jsdom), TypeScript 7, Node 24, `sharp`, `lucide-react` 1.63.0.

**Spec:** `docs/superpowers/specs/2026-11-12-stanscribe-listing-design.md`. Read it before any task. The October spec (`docs/superpowers/specs/2026-10-23-stanscribe-page-design.md`) still holds the copy rules.

## Global Constraints

- Read `DESIGN.md` and `PRODUCT.md` before UI work (project CLAUDE.md).
- Stan Scribe must not pick up portfolio styles: no `.site`, no `components/site/`, no `text-site-*` in `app/(stanscribe)/` or `components/stanscribe/`.
- Type comes only from `TYPE` in `components/stanscribe/type.ts`. No `font-mono`, `italic`, `uppercase`, `tracking-caps`, `tracking-mono` or `eyebrow*` classes (`findTypeViolations`).
- Copy rules (`test-utils/stanscribe.ts` `findCopyViolations`): no em dashes, no prices, no model names, "captions" never "transcription", no "tip", "donate", "lite", "trial". "subscription" only in a denial.
- Body text is 18px or larger. Body text and links clear 7:1 in both themes.
- Use every word of copy in this plan exactly as written. The owner approved it. Do not add claims, metrics or testimonials.
- Build Stan Scribe links with `pageHref` and canonical URLs with `pageUrl` (`lib/stanscribe.ts`), in plain `<a>`, never `next/link`.
- US spelling in page copy (color). Apple's terms as Apple writes them (iPhone, iPad, iCloud, Lock Screen).
- Every new source file starts with `// Copyright (c) 2026 Devin Hunt contact@devinhunt.com` and a path line, as the files beside it do.
- TDD: write the failing test, watch it fail, then write the code. Load `superpowers-extended-cc:test-driven-development`. For `.ts` and `.tsx` files load `typescript-best-practices`.
- Commits: one per task, message in the repo's style (`feat(stanscribe): ...`). No `Co-Authored-By` trailer and no "Generated with Claude Code" line. Commit only the task's own paths: `git commit -m "..." -- <paths>`. Other agents work in the same tree at the same time, so never `git add -A`, never `git commit -a`, and retry once if `index.lock` exists.
- New `.md` files are ignored by `.gitignore` (`*.md`). Add them with `git add -f`.
- Do not push. Do not touch `content/stanscribe-legal/`.

**User decisions (already made):**
- Share card A: "Let's do A".
- Homepage line X: "yes, option x".
- Features heading: "Features".
- How it works: "Add a 'view conversations'".
- Speakers fact: "mention names?" (the fact reads "A color and a name for each speaker").
- Themes line: "'curated' is best" (the line reads "28 themes I curated, or make your own from your photos.").
- Comparison table: "Add more table formatting that makes column dividers more apparent. Reminder this is for non-tech savvy users".
- Caption demo: a faux render that plays on scroll; "this conversation should be more neutral, like the user is an observer of three others talking."
- Screenshots: "request that the transcribe_stan repo should recreate these screenshots with text relevant to section of website".
- Execution: "approved, proceed to implementation and execute using the parallel subagent process."
- The slowness he reported is not reproduced (spec section 3). No task claims a speed fix.

## File structure

| File | Responsibility | Task |
|---|---|---|
| `app/globals.css` | `.bands`, `.band-foot`, `.band-only` as plain see-through backgrounds | 1 |
| `components/ui/ContourBackdrop.tsx` | the `quiet` veil at 40% | 1 |
| `components/stanscribe/icons.tsx` | the one place that names Lucide icons; `SpeakerDots` | 2 |
| `components/stanscribe/IconTile.tsx` | a 48px tile that holds one icon | 2 |
| `components/stanscribe/Disclosure.tsx` | a row that opens on a click (`<details>`) | 2 |
| `lib/stanscribe.ts` | `SITE_NAME`, `APP_ICONS`, `FAVICONS`, shorter shared lines, card alt text | 3 |
| `components/stanscribe/AppIcon.tsx` | an app's icon as a decorative tile | 3 |
| `components/stanscribe/ComparisonTable.tsx` | four rows, a frame, column rules, icons in the header | 3 |
| `components/stanscribe/Section.tsx`, `HelpBlock.tsx` | accept a `className` for a band's extra top padding | 3 |
| `lib/stanscribe-demo.ts` | the demo's script and colours | 4 |
| `components/stanscribe/CaptionDemo.tsx` | the caption demo (client component) | 4 |
| `components/stanscribe/Faq.tsx`, `lib/stanscribe-faq.ts` | questions as rows; the accuracy answer open | 5 |
| `app/(stanscribe)/stanscribe/page.tsx` | the main page's sections | 6 |
| `app/(stanscribe)/stanscribe-light/page.tsx` | the Light page's sections | 7 |
| `scripts/stanscribe-social.mjs`, `scripts/stanscribe-social/card.html` | draws the share card | 8 |
| `app/layout.tsx`, `app/(stanscribe)/layout.tsx`, `components/stanscribe/LegalPage.tsx` | icons through metadata; `og:site_name` | 8 |
| `lib/portfolio-data.ts` | the homepage line | 9 |
| `scripts/scroll-trace.mjs` | the scroll trace harness | 10 |
| `~/dev/transcript_stan/docs/marketing/stanscribe-page/screenshot-request.md` | the request to the app repo | 11 |
| `DESIGN.md`, the October spec | record the change | 12 |

Tasks 1, 2, 3, 4, 9, 10 and 11 touch disjoint files and can run in parallel. Task 5 needs 2. Tasks 6 and 7 need 2, 3, 4 and 5 and can run in parallel with each other. Task 8 needs 2 and 3. Task 12 needs 6, 7 and 8. Task 13 is last.

---

### Task 1: One full-width see-through card in place of the masked bands

**Goal:** Every Stan Scribe band paints one plain `background`, the two tones are see-through, the hero has no fill, and the veil is 40%.

**Files:**
- Modify: `app/globals.css` (the `.bands` block at the top of `@layer components`)
- Modify: `components/ui/ContourBackdrop.tsx` (the `quiet` veil's class)
- Modify: `components/stanscribe/Section.tsx` (comments only)
- Test: `__tests__/stanscribe/Bands.test.tsx`, `__tests__/stanscribe/palette.test.ts`

**Acceptance Criteria:**
- [ ] No Stan Scribe band rule in `app/globals.css` contains `mask-image`, `::before` or `isolation`.
- [ ] `--band-a` and `--band-b` are `color-mix(in srgb, <token> 92%, transparent)`, and 90% under `.dark`.
- [ ] `.bands > section:first-of-type` has `background: none`, and the second section blends in from `transparent`.
- [ ] `--band-blend` is still `80px`.
- [ ] The veil class is `opacity-40`.
- [ ] `palette.test.ts` proves 7:1 for `--text-strong`, `--text-body` and `--text-link-hover` over a contour line in the hero and through both tones, in both themes.

**Verify:** `npx jest --ci __tests__/stanscribe/Bands.test.tsx __tests__/stanscribe/palette.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Replace the CSS-rule tests in `__tests__/stanscribe/Bands.test.tsx`.** Replace the whole `describe('the band rules in globals.css', ...)` block at the end of the file with:

```tsx
describe('the band rules in globals.css', () => {
  const css = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  // Every rule whose selector names .bands, .band-foot or .band-only (the portfolio's .site .band is not one).
  const bandRules = (css.match(/[^{}]*\.band(?:s|-foot|-only)[^{}]*\{[^}]*\}/g) ?? []).join('\n');

  test('two tones take turns: the card’s colour and the page’s, both slightly see-through', () => {
    expect(bandRules).toMatch(/--band-a:\s*color-mix\(in srgb, var\(--surface-card\) 92%, transparent\)/);
    expect(bandRules).toMatch(/--band-b:\s*color-mix\(in srgb, var\(--surface-page\) 92%, transparent\)/);
    expect(bandRules).toMatch(/\.dark \.bands, \.dark \.band-foot \{[^}]*--band-a:\s*color-mix\(in srgb, var\(--surface-card\) 90%, transparent\)/);
    expect(bandRules).toMatch(/\.dark \.bands, \.dark \.band-foot \{[^}]*--band-b:\s*color-mix\(in srgb, var\(--surface-page\) 90%, transparent\)/);
  });

  test('each band is one plain background: no mask, no pseudo-element layer, no stacking context', () => {
    expect(bandRules).toMatch(/\.bands > section, \.band-foot \{[^}]*background: linear-gradient\(to bottom, var\(--band-from\) 0, var\(--band-to\) var\(--band-blend\)\)/);
    expect(bandRules).not.toMatch(/mask-image/);
    expect(bandRules).not.toMatch(/::before/);
    expect(bandRules).not.toMatch(/isolation/);
    expect(bandRules).not.toMatch(/--band-solid|--band-fade/);
  });

  test('the hero has no fill, and the card under it blends in from nothing', () => {
    expect(bandRules).toMatch(/\.bands > section:first-of-type \{ background: none; \}/);
    expect(bandRules).toMatch(/\.bands > section:nth-of-type\(2\) \{ --band-from: transparent; \}/);
  });

  test('each break is an 80px blend, the height the owner chose', () => {
    expect(bandRules).toMatch(/--band-blend:\s*80px/);
  });
});
```

- [ ] **Step 2: Add the contour-line contrast tests to `__tests__/stanscribe/palette.test.ts`.** Append to the end of the file:

```ts
// The hero has no fill and the band tones are see-through, so words can cross a contour line. The plate draws
// its lines at its group's opacity times a path's own, the veil covers them, and a band's tone covers both.

const parseHex = (value: string) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
const over = (under: number[], top: number[], alpha: number) => under.map((c, i) => c * (1 - alpha) + top[i] * alpha);

/** Every line colour in a plate, and the strongest opacity any line is drawn at. */
const plate = (theme: 'light' | 'dark') => {
  const svg = fs.readFileSync(path.join(process.cwd(), `public/images/plates/interests_${theme}_plate.svg`), 'utf8');
  const group = Number(svg.match(/<g[^>]*opacity="([.0-9]+)"/)?.[1] ?? 1);
  const strongest = Math.max(...Array.from(svg.matchAll(/<path[^>]*opacity="([.0-9]+)"/g), (match) => Number(match[1])));
  const lines = [...new Set(svg.match(/stroke="#[0-9a-fA-F]{6}"/g) ?? [])].map((stroke) => parseHex(stroke.slice(8, 15)));
  return { lines, opacity: group * strongest };
};

const veil = () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'components/ui/ContourBackdrop.tsx'), 'utf8');
  const strength = source.match(/bg-background opacity-(\d+)/)?.[1];
  if (!strength) throw new Error('the quiet veil has no opacity class');
  return Number(strength) / 100;
};

const bandAlpha = (selector: string) => {
  const plain = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const start = plain.indexOf(`${selector} {`);
  const strength = plain.slice(start, plain.indexOf('}', start)).match(/--band-a:\s*color-mix\(in srgb, var\(--surface-card\) (\d+)%/)?.[1];
  if (!strength) throw new Error(`${selector} sets no band tone`);
  return Number(strength) / 100;
};

describe.each([
  [':root', 'light', '.bands, .band-foot'],
  ['.dark', 'dark', '.dark .bands, .dark .band-foot'],
] as const)('%s over a contour line', (selector, theme, bands) => {
  const block = tokens(selector);
  const page = hex(block, '--surface-page');
  const card = hex(block, '--surface-card');

  test('the veil is 40%', () => {
    expect(veil()).toBe(0.4);
  });

  test.each(['--text-strong', '--text-body', '--text-link-hover'])('%s clears 7:1 in the hero and through both band tones', (name) => {
    const text = hex(block, name);
    const alpha = bandAlpha(bands);
    const { lines, opacity } = plate(theme);
    expect(lines.length).toBeGreaterThan(0);
    expect(opacity).toBeGreaterThan(0.2);
    for (const line of lines) {
      const hero = over(over(page, line, opacity), page, veil());
      expect(contrast(text, hero)).toBeGreaterThanOrEqual(7);
      expect(contrast(text, over(hero, card, alpha))).toBeGreaterThanOrEqual(7);
      expect(contrast(text, over(hero, page, alpha))).toBeGreaterThanOrEqual(7);
    }
  });
});
```

- [ ] **Step 3: Run the tests and watch them fail.**

Run: `npx jest --ci __tests__/stanscribe/Bands.test.tsx __tests__/stanscribe/palette.test.ts`
Expected: FAIL. The band-rule tests fail on `color-mix` and `mask-image`; the palette tests fail on "the veil is 40%" and "sets no band tone".

- [ ] **Step 4: Rewrite the band rules in `app/globals.css`.** In `@layer components`, replace everything from the comment that begins `/* Stan Scribe's pages are a column of bands` through the line `.bands > section.band-only { --band-from: transparent; --band-to: var(--band-a); }` with:

```css
  /* Stan Scribe: the hero sits on the contours, and everything under it is one card the full width of the
     window. The card's sections are bands in two slightly see-through tones that take turns, each blending in
     from the tone above it over --band-blend, so no break is a line. Each band is one plain background. */
  .bands, .band-foot {
    --band-a: color-mix(in srgb, var(--surface-card) 92%, transparent);
    --band-b: color-mix(in srgb, var(--surface-page) 92%, transparent);
    --band-blend: 80px;
  }
  .dark .bands, .dark .band-foot {
    --band-a: color-mix(in srgb, var(--surface-card) 90%, transparent);
    --band-b: color-mix(in srgb, var(--surface-page) 90%, transparent);
  }
  .bands > section, .band-foot { --band-from: var(--band-a); --band-to: var(--band-b); background: linear-gradient(to bottom, var(--band-from) 0, var(--band-to) var(--band-blend)); }
  .bands > section:nth-of-type(even) { --band-from: var(--band-b); --band-to: var(--band-a); }
  /* The hero is the first section. It has no fill, so the contours show behind its words. */
  .bands > section:first-of-type { background: none; }
  /* The card starts at the second section and blends in from nothing. */
  .bands > section:nth-of-type(2) { --band-from: transparent; }
  /* A page that is one band (the legal pages) is the lighter tone from the top. Every page ends on that tone,
     and the footer, which takes the shared rule above, blends from it to the ground. */
  .bands > section.band-only { --band-from: transparent; --band-to: var(--band-a); background: linear-gradient(to bottom, var(--band-from) 0, var(--band-to) var(--band-blend)); }
```

Keep the `.legal` rules that follow it unchanged.

- [ ] **Step 5: Set the veil to 40%.** In `components/ui/ContourBackdrop.tsx` change `bg-background opacity-60` to `bg-background opacity-40`.

- [ ] **Step 6: Update the comments in `components/stanscribe/Section.tsx`.** Replace the three-line header comment that begins `// A Stan Scribe page is a run of bands` with:

```tsx
// A Stan Scribe page is a hero on the contours, then one card the full width of the window. The card's
// sections are bands in two slightly see-through tones that take turns (text keeps its 7:1 contrast on both).
// Each section opens on a centred serif h2 that also labels it for screen readers.
```

- [ ] **Step 7: Run the tests.**

Run: `npx jest --ci __tests__/stanscribe/Bands.test.tsx __tests__/stanscribe/palette.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit.**

```bash
git commit -m "feat(stanscribe): one full-width see-through card under the hero, with plain fills in place of the masked bands" -- app/globals.css components/ui/ContourBackdrop.tsx components/stanscribe/Section.tsx __tests__/stanscribe/Bands.test.tsx __tests__/stanscribe/palette.test.ts
```

---

### Task 2: Icons, the icon tile and the row that opens

**Goal:** `icons.tsx`, `IconTile` and `Disclosure` exist, tested, with `lucide-react` pinned at 1.63.0.

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `components/stanscribe/icons.tsx`, `components/stanscribe/IconTile.tsx`, `components/stanscribe/Disclosure.tsx`
- Test: `__tests__/stanscribe/Disclosure.test.tsx`

**Acceptance Criteria:**
- [ ] `package.json` lists `"lucide-react": "1.63.0"` exactly (no caret).
- [ ] `Disclosure` renders a `<details>` whose `<summary>` holds the label as an `h3` and a chevron; it is closed unless `open` is passed; the icon is optional and comes before the label.
- [ ] `IconTile` renders an `aria-hidden` 48px tile; `tone="start"` and `tone="stop"` paint the app's green and red.
- [ ] Every icon name exported from `icons.tsx` renders an `<svg>`.

**Verify:** `npx jest --ci __tests__/stanscribe/Disclosure.test.tsx` → all pass

**Steps:**

- [ ] **Step 1: Install the icon library, pinned.**

Run: `npm install --save-exact lucide-react@1.63.0`
Expected: `package.json` gains `"lucide-react": "1.63.0"`. Version 1.63.0 was published 2026-10-28; do not take a newer one.

- [ ] **Step 2: Check the icon names exist in this version.**

Run:
```bash
node -e "const l=require('lucide-react');for(const n of ['Captions','WifiOff','UserRoundX','Smartphone','EyeOff','MicOff','Share','Hand','AudioLines','ALargeSmall','Lock','Search','Palette','Mic','Square','List','ChevronDown'])if(!l[n])console.log('missing',n)"
```
Expected: no output. If a name prints as missing, use its fallback in Step 4 and check the fallback the same way: `Captions` → `MessageSquareText`; `UserRoundX` → `UserX`; `ALargeSmall` → `Type`; `AudioLines` → `AudioWaveform`; `Share` → `Upload`; `Hand` → `Users`.

- [ ] **Step 3: Write the failing test `__tests__/stanscribe/Disclosure.test.tsx`.**

```tsx
import { render, screen } from '@testing-library/react';
import { Disclosure } from '@/components/stanscribe/Disclosure';
import { IconTile } from '@/components/stanscribe/IconTile';
import * as icons from '@/components/stanscribe/icons';
import { findTypeViolations } from '@/test-utils/stanscribe';

test('a row is a details whose summary holds the label as an h3', () => {
  const { container } = render(<Disclosure label="No audio is saved"><p>It keeps none of the sound.</p></Disclosure>);
  const details = container.querySelector('details')!;
  const summary = details.querySelector('summary')!;
  expect(summary.querySelector('h3')?.textContent).toBe('No audio is saved');
  expect(summary.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  expect(details.querySelector('summary + div p')?.textContent).toBe('It keeps none of the sound.');
  expect(findTypeViolations(container)).toEqual([]);
});

test('a row is closed unless it is told to start open', () => {
  const { container, rerender } = render(<Disclosure label="Closed">words</Disclosure>);
  expect(container.querySelector('details')!.open).toBe(false);
  rerender(<Disclosure label="Open" open>words</Disclosure>);
  expect(container.querySelector('details')!.open).toBe(true);
});

test('the icon is optional and comes before the label', () => {
  const { container } = render(
    <Disclosure label="With icon" icon={<IconTile><icons.LockIcon /></IconTile>}>words</Disclosure>,
  );
  const summary = container.querySelector('summary')!;
  expect(summary.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  expect(summary.firstElementChild?.querySelector('svg')).not.toBeNull();
  expect(screen.getByText('With icon').tagName).toBe('H3');
});

test('a summary is tall enough to tap', () => {
  const { container } = render(<Disclosure label="Tap me">words</Disclosure>);
  expect(container.querySelector('summary')!.className).toMatch(/\bmin-h-16\b/);
});

test('the Start and Stop tiles take the app’s green and red', () => {
  const { container } = render(<><IconTile tone="start"><icons.StartIcon /></IconTile><IconTile tone="stop"><icons.StopIcon /></IconTile></>);
  const [start, stop] = Array.from(container.querySelectorAll('span[aria-hidden="true"]'));
  expect(start.className).toMatch(/bg-\[#1c7c45\]/);
  expect(stop.className).toMatch(/bg-\[#c0352b\]/);
});

test('every icon the pages use renders', () => {
  for (const [name, Icon] of Object.entries(icons)) {
    const { container, unmount } = render(<Icon />);
    expect([name, container.querySelector('svg') !== null]).toEqual([name, true]);
    unmount();
  }
});
```

- [ ] **Step 4: Run it and watch it fail.**

Run: `npx jest --ci __tests__/stanscribe/Disclosure.test.tsx`
Expected: FAIL with "Cannot find module '@/components/stanscribe/Disclosure'".

- [ ] **Step 5: Create `components/stanscribe/icons.tsx`.**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/icons.tsx
// The one place the Stan Scribe pages name their icons. The app's tour uses Apple's SF Symbols, which Apple
// licenses for apps on its platforms and not for websites, so each icon here is the nearest Lucide drawing
// (ISC licence). The speaker dots are drawn here, in the app's colours.

export {
  Captions as CaptionsIcon,
  WifiOff as OfflineIcon,
  UserRoundX as NoAccountIcon,
  Smartphone as DeviceIcon,
  EyeOff as NoTrackingIcon,
  MicOff as NoAudioIcon,
  Share as SendIcon,
  Hand as AskIcon,
  AudioLines as VoicesIcon,
  ALargeSmall as TextSizeIcon,
  Lock as LockIcon,
  Search as SearchIcon,
  Palette as LooksIcon,
  Mic as StartIcon,
  Square as StopIcon,
  List as ConversationsIcon,
  ChevronDown as ChevronIcon,
} from 'lucide-react';

/** Two speakers, each in their own colour. */
export function SpeakerDots() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="7" cy="12" r="4.2" fill="#2b95ff" />
      <circle cx="17" cy="12" r="4.2" fill="#ff8a1f" />
    </svg>
  );
}
```

- [ ] **Step 6: Create `components/stanscribe/IconTile.tsx`.**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/IconTile.tsx
// A 48px tile that holds one icon, as the rows of the app's tour do. The tile is decoration: the words
// beside it carry the meaning, so it is hidden from screen readers.

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const TONE = {
  plain: 'border-border bg-muted text-ink-strong',
  /** The app's own Start tile. */
  start: 'border-transparent bg-[#1c7c45] text-white',
  /** The app's own Stop tile. */
  stop: 'border-transparent bg-[#c0352b] text-white',
} as const;

interface IconTileProps {
  children: ReactNode;
  tone?: keyof typeof TONE;
  className?: string;
}

export function IconTile({ children, tone = 'plain', className }: IconTileProps) {
  return (
    <span aria-hidden="true" className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-xl border [&>svg]:h-6 [&>svg]:w-6', TONE[tone], className)}>
      {children}
    </span>
  );
}
```

- [ ] **Step 7: Create `components/stanscribe/Disclosure.tsx`.**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/Disclosure.tsx
// A row that opens on a click: the label is always visible, and the words under it show when the reader asks.
// A native <details>, so it needs no script, opens from the keyboard, and opens by itself when the browser's
// find-in-page matches its words. Rows sit in a plain wrapper and draw the rule between them.

import type { ReactNode } from 'react';
import { ChevronIcon } from '@/components/stanscribe/icons';
import { TYPE } from '@/components/stanscribe/type';
import { cn } from '@/lib/utils';

interface DisclosureProps {
  label: string;
  /** An IconTile, shown before the label. */
  icon?: ReactNode;
  /** Start open. The reader can still close it. */
  open?: boolean;
  children: ReactNode;
}

export function Disclosure({ label, icon, open = false, children }: DisclosureProps) {
  return (
    <details open={open} className="group border-b border-border first:border-t">
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 py-3 [&::-webkit-details-marker]:hidden">
        {icon}
        <h3 className={cn(TYPE.heading, 'flex-1')}>{label}</h3>
        <ChevronIcon aria-hidden="true" className="h-6 w-6 shrink-0 text-ink-strong transition-transform group-open:rotate-180" />
      </summary>
      <div className={cn(TYPE.body, 'pb-6 pr-10', icon ? 'pl-16' : undefined)}>{children}</div>
    </details>
  );
}
```

- [ ] **Step 8: Run the tests.**

Run: `npx jest --ci __tests__/stanscribe/Disclosure.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 9: Commit.**

```bash
git add components/stanscribe/icons.tsx components/stanscribe/IconTile.tsx components/stanscribe/Disclosure.tsx __tests__/stanscribe/Disclosure.test.tsx
git commit -m "feat(stanscribe): icon tiles and rows that open on a click" -- package.json package-lock.json components/stanscribe/icons.tsx components/stanscribe/IconTile.tsx components/stanscribe/Disclosure.tsx __tests__/stanscribe/Disclosure.test.tsx
```

---

### Task 3: App icons, the shared lines and the framed comparison table

**Goal:** The app icons are in `public/`, `lib/stanscribe.ts` holds the new shared values, `AppIcon` exists, the comparison table has four rows with a frame and column rules, and `Section` and `HelpBlock` accept a `className`.

**Files:**
- Create: `public/images/stanscribe/app-icon.png`, `app-icon-light.png`, `app-icon-180.png`, `app-icon-32.png`
- Create: `components/stanscribe/AppIcon.tsx`
- Modify: `lib/stanscribe.ts`, `components/stanscribe/ComparisonTable.tsx`, `components/stanscribe/Section.tsx`, `components/stanscribe/HelpBlock.tsx`, `components/stanscribe/PhoneShot.tsx`
- Test: `__tests__/stanscribe/lib.test.ts`, `__tests__/stanscribe/HelpBlock.test.tsx`

**Acceptance Criteria:**
- [ ] The four icon files exist at 512, 512, 180 and 32 pixels square.
- [ ] `lib/stanscribe.ts` exports `SITE_NAME`, `APP_ICONS`, `FAVICONS`, and the new `BOTH_APPS_SHARE`, `LIGHT_NOT_SURE`, `LIGHT_SUMMARY` and `SOCIAL_IMAGE.alt` given below.
- [ ] `ComparisonTable` has exactly four row headers (Price, Speech models, Looks, Download), a 2px frame, a rule on the left of each app column, a filled header row, and each app's icon in its column header.
- [ ] The table still has real `th scope` headers, and the icons add no `<img>`.
- [ ] `Section` and `HelpBlock` pass a `className` to the `<section>`, and `PhoneShot` passes a `style` to its image.

**Verify:** `npx jest --ci __tests__/stanscribe/lib.test.ts __tests__/stanscribe/HelpBlock.test.tsx` → all pass

**Steps:**

- [ ] **Step 1: Copy the app icons from the app repo.**

Run:
```bash
node -e "
const sharp=require('sharp');
const A='/Users/dhunt/dev/transcript_stan/App';
const full=A+'/StanScribe/Assets.xcassets/AppIcon.appiconset/AppIcon.png';
const light=A+'/StanScribeLight/Assets.xcassets/AppIcon.appiconset/AppIcon.png';
const out='public/images/stanscribe/';
(async()=>{
  await sharp(full).resize(512).png().toFile(out+'app-icon.png');
  await sharp(light).resize(512).png().toFile(out+'app-icon-light.png');
  await sharp(full).resize(180).png().toFile(out+'app-icon-180.png');
  await sharp(full).resize(32).png().toFile(out+'app-icon-32.png');
  console.log('ok');
})()"
```
Expected: `ok`, and four new files in `public/images/stanscribe/`.

- [ ] **Step 2: Write the failing tests.** In `__tests__/stanscribe/lib.test.ts`, change the import line to:

```ts
import { APP_ICONS, APP_STORE_BADGE, BOTH_APPS_SHARE, FAVICONS, LANGUAGES, LIGHT_NOT_SURE, LIGHT_SUMMARY, RELEASED, SHOTS, SITE_NAME, SOCIAL_IMAGE } from '@/lib/stanscribe';
```

and add these tests inside `describe('lib/stanscribe', ...)`, after the "the social card is 1200×630" test:

```ts
  test('link previews name the site Stan Scribe, and the card’s alt text says what it shows', () => {
    expect(SITE_NAME).toBe('Stan Scribe');
    expect(SOCIAL_IMAGE.alt).toBe('The name Stan Scribe and its tagline beside three iPhones showing live captions in color.');
  });

  test.each([
    [APP_ICONS.scribe.src, 512],
    [APP_ICONS.light.src, 512],
    [FAVICONS.apple, 180],
    [FAVICONS.icon, 32],
  ])('%s is a square icon of %i pixels', async (src, size) => {
    const meta = await sharp(join(PUBLIC, src)).metadata();
    expect([meta.width, meta.height]).toEqual([size, size]);
  });

  test('the shared lines are short and follow the brief', () => {
    expect(BOTH_APPS_SHARE).toBe('Both caption offline, with speaker colors and names, in 25 languages. Neither has in-app purchases.');
    expect(LIGHT_NOT_SURE).toBe('Start with Light.');
    expect(LIGHT_SUMMARY).toBe('The same live captions and speaker colors as Stan Scribe, made simpler: one speech model, a black or a white page, and a smaller download.');
    expect(findCopyViolations(`${BOTH_APPS_SHARE} ${LIGHT_NOT_SURE} ${LIGHT_SUMMARY}`)).toEqual([]);
  });
```

In `__tests__/stanscribe/HelpBlock.test.tsx`, add `import { PhoneShot } from '@/components/stanscribe/PhoneShot';` and change the `@/lib/stanscribe` import to `import { SHOTS, legalLinks } from '@/lib/stanscribe';`. Then replace the test `ComparisonTable has real headers, one row per difference` with:

```tsx
test('ComparisonTable has real headers and four rows, one per difference a buyer weighs', () => {
  const { container } = render(<ComparisonTable />);
  const table = screen.getByRole('table');
  expect(within(table).getAllByRole('columnheader').map((th) => th.textContent)).toEqual(
    expect.arrayContaining(['Stan Scribe', 'Stan Scribe Light']),
  );
  expect(within(table).getAllByRole('rowheader').map((th) => th.textContent)).toEqual(['Price', 'Speech models', 'Looks', 'Download']);
  // The icons are decoration, not images with names to read.
  expect(container.querySelector('img')).toBeNull();
  expect(table.querySelectorAll('thead span[aria-hidden="true"]')).toHaveLength(2);
});

test('ComparisonTable draws its columns: a frame, a filled header row and a rule beside each app’s column', () => {
  render(<ComparisonTable />);
  const table = screen.getByRole('table');
  expect(table.className).toMatch(/\bborder-2\b/);
  expect(table.querySelector('thead tr')!.className).toMatch(/\bbg-muted\b/);
  for (const row of Array.from(table.querySelectorAll('tr'))) {
    const [, scribe, light] = Array.from(row.children);
    expect(scribe.className).toMatch(/\bborder-l\b/);
    expect(light.className).toMatch(/\bborder-l\b/);
  }
});

test('HelpBlock and Section pass a class to their section', () => {
  const { container } = render(<HelpBlock apps={['light']} className="pt-40" />);
  expect(container.querySelector('section#help')!.className).toMatch(/\bpt-40\b/);
});

test('PhoneShot passes a style to its image, for a picture that hangs into the next band', () => {
  const { container } = render(<PhoneShot image={SHOTS.hero} style={{ marginBottom: '-4rem' }} />);
  expect(container.querySelector('img')!.style.marginBottom).toBe('-4rem');
});
```

- [ ] **Step 3: Run them and watch them fail.**

Run: `npx jest --ci __tests__/stanscribe/lib.test.ts __tests__/stanscribe/HelpBlock.test.tsx`
Expected: FAIL. `SITE_NAME` is undefined, the table has six row headers, and `HelpBlock` takes no `className`.

- [ ] **Step 4: Edit `lib/stanscribe.ts`.**

After the line `export const SUPPORT_EMAIL = 'stanscribe@devinhunt.com';` add:

```ts

/** The site's name in link previews (og:site_name). */
export const SITE_NAME = 'Stan Scribe';
```

After the `APPS` constant add:

```ts

/** Each app's own icon, copied from the app repo's AppIcon.png. */
export const APP_ICONS: Record<AppKey, { src: string; size: number }> = {
  scribe: { src: '/images/stanscribe/app-icon.png', size: 512 },
  light: { src: '/images/stanscribe/app-icon-light.png', size: 512 },
};

/** The tab icon and the touch icon on every Stan Scribe page. */
export const FAVICONS = { icon: '/images/stanscribe/app-icon-32.png', apple: '/images/stanscribe/app-icon-180.png' } as const;
```

In `SOCIAL_IMAGE`, replace the `alt` line with:

```ts
  alt: 'The name Stan Scribe and its tagline beside three iPhones showing live captions in color.',
```

Replace the three shared-line constants and their comments (`LIGHT_SUMMARY`, `BOTH_APPS_SHARE`, `LIGHT_NOT_SURE`) with:

```ts
/** The Light page's one line under its tagline. */
export const LIGHT_SUMMARY =
  'The same live captions and speaker colors as Stan Scribe, made simpler: one speech model, a black or a white page, and a smaller download.';

/** Above the comparison table, which lists only the differences. */
export const BOTH_APPS_SHARE = 'Both caption offline, with speaker colors and names, in 25 languages. Neither has in-app purchases.';

/** Follows a bold "Not sure?". */
export const LIGHT_NOT_SURE = 'Start with Light.';
```

- [ ] **Step 5: Create `components/stanscribe/AppIcon.tsx`.**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/AppIcon.tsx
// An app's own icon, rounded as iOS rounds it. It always sits beside the app's name, so it is decoration
// and hidden from screen readers. Give it a size with a class (h-10 w-10, h-26 w-26).

import { APP_ICONS, type AppKey } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

export function AppIcon({ app, className }: { app: AppKey; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block shrink-0 rounded-[22%] bg-cover bg-center', className)}
      style={{ backgroundImage: `url(${APP_ICONS[app].src})` }}
    />
  );
}
```

- [ ] **Step 6: Rewrite `components/stanscribe/ComparisonTable.tsx`.** Replace the whole file with:

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/ComparisonTable.tsx
// "Which one is for you?": the four differences a buyer weighs, as a real table (th scope). What the apps
// share is one line above it (BOTH_APPS_SHARE). Its columns are drawn plainly for readers who are not
// technical: a frame, a filled header row with each app's icon, and a rule beside each app's column. Cells
// hyphenate and drop to 16px below sm so the table fits 320px; the focusable region is the fallback at
// larger text sizes.

import { AppIcon } from '@/components/stanscribe/AppIcon';
import { cn } from '@/lib/utils';

const ROWS: [feature: string, scribe: string, light: string][] = [
  ['Price', 'Pay once', 'Free'],
  ['Speech models', 'Advanced and Basic', 'Basic'],
  ['Looks', '28 themes, painted ones, and your own photos', 'Black or white'],
  ['Download', 'Larger', 'Smaller'],
];

const CELL = 'p-2.5 align-top hyphens-auto sm:p-3 md:px-5 md:py-4';
const HEADER = 'font-semibold text-ink-strong';
/** The rule that sets an app's column apart from the one before it. */
const COLUMN = 'border-l border-ink-muted';

export function ComparisonTable({ className }: { className?: string }) {
  return (
    <div role="region" aria-labelledby="compare-caption" tabIndex={0} className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse border-2 border-ink-strong text-left text-base leading-relaxed sm:text-lg">
        <colgroup>
          <col className="w-[30%]" />
          <col className="w-[35%]" />
          <col className="w-[35%]" />
        </colgroup>
        <caption id="compare-caption" className="sr-only">
          How Stan Scribe and Stan Scribe Light differ
        </caption>
        <thead>
          <tr className="border-b-2 border-ink-strong bg-muted">
            <td className={CELL} />
            <th scope="col" className={cn(CELL, HEADER, COLUMN, 'align-bottom')}>
              <AppIcon app="scribe" className="mb-2 block h-10 w-10" />
              Stan Scribe
            </th>
            <th scope="col" className={cn(CELL, HEADER, COLUMN, 'align-bottom')}>
              <AppIcon app="light" className="mb-2 block h-10 w-10" />
              Stan Scribe Light
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([feature, scribe, light]) => (
            <tr key={feature} className="border-t border-ink-muted">
              <th scope="row" className={cn(CELL, HEADER)}>
                {feature}
              </th>
              <td className={cn(CELL, COLUMN, 'text-ink-body')}>{scribe}</td>
              <td className={cn(CELL, COLUMN, 'text-ink-body')}>{light}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 7: Let `Section` and `HelpBlock` take a `className`.** In `components/stanscribe/Section.tsx` replace the `SectionProps` interface and the `Section` function with:

```tsx
interface SectionProps {
  id: string;
  title: string;
  /** Extra classes for the band, such as more top padding under a picture that hangs into it. */
  className?: string;
  children: ReactNode;
}

export function Section({ id, title, className, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn(BAND, 'scroll-mt-8', className)}>
      <div className={BAND_COLUMN}>
        <h2 id={`${id}-title`} className={cn(TYPE.title, 'text-center')}>
          {title}
        </h2>
        <div className="mt-8 md:mt-12">{children}</div>
      </div>
    </section>
  );
}
```

In `components/stanscribe/HelpBlock.tsx` change the signature and the `Section` line to:

```tsx
export function HelpBlock({ apps, className }: { apps: AppKey[]; className?: string }) {
  return (
    <Section id="help" title="Help" className={className}>
```

In `components/stanscribe/PhoneShot.tsx`, add `import type { CSSProperties } from 'react';`, add `/** For a picture that hangs into the next band (a negative bottom margin). */ style?: CSSProperties;` to `PhoneShotProps`, add `style` to the destructured props, and pass `style={style}` to `<Image>`.

- [ ] **Step 8: Run the tests.**

Run: `npx jest --ci __tests__/stanscribe/lib.test.ts __tests__/stanscribe/HelpBlock.test.tsx`
Expected: PASS.

The page tests (`StanScribePage.test.tsx`) now fail on the old lead line and row count. Tasks 6 and 7 rewrite those pages and tests. Do not fix them here.

- [ ] **Step 9: Commit.**

```bash
git add public/images/stanscribe/app-icon.png public/images/stanscribe/app-icon-light.png public/images/stanscribe/app-icon-180.png public/images/stanscribe/app-icon-32.png components/stanscribe/AppIcon.tsx
git commit -m "feat(stanscribe): the apps' own icons, shorter shared lines and a comparison table with plain columns" -- public/images/stanscribe/app-icon.png public/images/stanscribe/app-icon-light.png public/images/stanscribe/app-icon-180.png public/images/stanscribe/app-icon-32.png components/stanscribe/AppIcon.tsx components/stanscribe/ComparisonTable.tsx components/stanscribe/Section.tsx components/stanscribe/HelpBlock.tsx components/stanscribe/PhoneShot.tsx lib/stanscribe.ts __tests__/stanscribe/lib.test.ts __tests__/stanscribe/HelpBlock.test.tsx
```

---

### Task 4: The caption demo

**Goal:** `CaptionDemo` shows a scripted three-speaker conversation that plays once when scrolled into view, with a Pause and Play again button, and shows the whole conversation with no motion when motion is reduced or scripts are off.

**Files:**
- Create: `lib/stanscribe-demo.ts`, `components/stanscribe/CaptionDemo.tsx`, `test-utils/contrast.ts`
- Test: `__tests__/stanscribe/CaptionDemo.test.tsx`

**Acceptance Criteria:**
- [ ] The server render contains every speaker name and word, with nothing hidden.
- [ ] With reduced motion, nothing is hidden and there is no button.
- [ ] With motion allowed, words are hidden until the demo is half on screen, then appear in order; the button reads "Pause" while playing, "Play" when paused and "Play again" when finished.
- [ ] Hidden words keep their space (opacity only), so the layout does not shift, and stay in the accessibility tree.
- [ ] Each speaker colour clears 7:1 on the demo's ground.
- [ ] The drawn Smaller, Larger, Save and Stop bar is `aria-hidden` and holds no `<button>`.
- [ ] The script's words pass `findCopyViolations`.

**Verify:** `npx jest --ci __tests__/stanscribe/CaptionDemo.test.tsx` → all pass

**Steps:**

- [ ] **Step 1: Create `test-utils/contrast.ts`.**

```ts
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// test-utils/contrast.ts
// WCAG contrast between two #rrggbb colours, for tests that hold a colour to 7:1.

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const s = parseInt(hex.slice(i, i + 2), 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
```

- [ ] **Step 2: Write the failing test `__tests__/stanscribe/CaptionDemo.test.tsx`.**

```tsx
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { CaptionDemo } from '@/components/stanscribe/CaptionDemo';
import { DEMO_GROUND, DEMO_TURNS } from '@/lib/stanscribe-demo';
import { contrastRatio } from '@/test-utils/contrast';
import { findCopyViolations } from '@/test-utils/stanscribe';

const WORDS = DEMO_TURNS.flatMap((turn) => turn.words.split(' '));

let intersect: (isIntersecting: boolean) => void = () => {};

const setMotion = (reduced: boolean) => {
  window.matchMedia = jest.fn().mockImplementation(() => ({ matches: reduced, addEventListener: jest.fn(), removeEventListener: jest.fn() }));
};

beforeEach(() => {
  jest.useFakeTimers();
  setMotion(false);
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = class {
    constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
      intersect = (isIntersecting) => callback([{ isIntersecting }]);
    }
    observe() {}
    disconnect() {}
  };
});

afterEach(() => {
  jest.useRealTimers();
  delete (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
});

const shown = (container: HTMLElement) => container.querySelectorAll('[data-word][data-shown="true"]').length;
const scrollIntoView = () => act(() => intersect(true));
const advance = (ms: number) => act(() => { jest.advanceTimersByTime(ms); });

test('the script is three people making a plan, in words that follow the brief', () => {
  expect(DEMO_TURNS.map((turn) => [turn.speaker, turn.words])).toEqual([
    ['Alex', 'Are we still on for Saturday?'],
    ['Rosa', 'Yes. Come at six, and bring the salad.'],
    ['Person 3', 'I will bring dessert.'],
  ]);
  expect(findCopyViolations(DEMO_TURNS.map((turn) => `${turn.speaker} ${turn.words}`).join(' '))).toEqual([]);
});

test('each speaker’s colour clears 7:1 on the demo’s ground', () => {
  for (const turn of DEMO_TURNS) expect(contrastRatio(turn.color, DEMO_GROUND)).toBeGreaterThanOrEqual(7);
});

test('the server render holds the whole conversation, with nothing hidden and no button', () => {
  const html = renderToString(<CaptionDemo />);
  for (const turn of DEMO_TURNS) expect(html).toContain(turn.speaker);
  expect(html.match(/data-shown="true"/g)).toHaveLength(WORDS.length + DEMO_TURNS.length);
  expect(html).not.toContain('data-shown="false"');
  expect(html).not.toContain('<button');
});

test('with reduced motion nothing is hidden and there is no button', () => {
  setMotion(true);
  const { container } = render(<CaptionDemo />);
  scrollIntoView();
  advance(20000);
  expect(shown(container)).toBe(WORDS.length);
  expect(screen.queryByRole('button')).toBeNull();
});

test('without IntersectionObserver the whole conversation shows', () => {
  delete (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
  const { container } = render(<CaptionDemo />);
  expect(shown(container)).toBe(WORDS.length);
});

test('it waits off screen, then the words arrive in order', () => {
  const { container } = render(<CaptionDemo />);
  expect(shown(container)).toBe(0);
  advance(5000);
  expect(shown(container)).toBe(0);
  scrollIntoView();
  expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  advance(1000);
  const early = shown(container);
  expect(early).toBeGreaterThan(0);
  expect(early).toBeLessThan(WORDS.length);
  const words = Array.from(container.querySelectorAll('[data-word]'));
  expect(words.slice(0, early).every((word) => word.getAttribute('data-shown') === 'true')).toBe(true);
  expect(words.slice(early).every((word) => word.getAttribute('data-shown') === 'false')).toBe(true);
  advance(20000);
  expect(shown(container)).toBe(WORDS.length);
  expect(screen.getByRole('button', { name: 'Play again' })).toBeInTheDocument();
});

test('hidden words keep their space and stay readable to a screen reader', () => {
  const { container } = render(<CaptionDemo />);
  const hidden = container.querySelector<HTMLElement>('[data-word][data-shown="false"]')!;
  expect(hidden.style.opacity).toBe('0');
  expect(hidden.closest('[aria-hidden="true"]')).toBeNull();
  expect(container.textContent).toContain('Are we still on for Saturday?');
});

test('Pause holds the words, Play goes on, and Play again starts over', () => {
  const { container } = render(<CaptionDemo />);
  scrollIntoView();
  advance(1000);
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
  const held = shown(container);
  advance(5000);
  expect(shown(container)).toBe(held);
  fireEvent.click(screen.getByRole('button', { name: 'Play' }));
  advance(20000);
  expect(shown(container)).toBe(WORDS.length);
  fireEvent.click(screen.getByRole('button', { name: 'Play again' }));
  expect(shown(container)).toBe(0);
  advance(20000);
  expect(shown(container)).toBe(WORDS.length);
});

test('scrolling back to it does not start it twice', () => {
  const { container } = render(<CaptionDemo />);
  scrollIntoView();
  advance(20000);
  scrollIntoView();
  expect(shown(container)).toBe(WORDS.length);
  expect(screen.getByRole('button', { name: 'Play again' })).toBeInTheDocument();
});

test('the app’s bar is a picture: hidden from screen readers, with no controls in it', () => {
  const { container } = render(<CaptionDemo />);
  const bar = container.querySelector('[data-demo-bar]')!;
  expect(bar.getAttribute('aria-hidden')).toBe('true');
  expect(bar.querySelector('button, a, [tabindex]')).toBeNull();
  expect(bar.textContent).toBe('SmallerLargerSaveStop');
});
```

- [ ] **Step 3: Run it and watch it fail.**

Run: `npx jest --ci __tests__/stanscribe/CaptionDemo.test.tsx`
Expected: FAIL with "Cannot find module '@/components/stanscribe/CaptionDemo'".

- [ ] **Step 4: Create `lib/stanscribe-demo.ts`.**

```ts
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/stanscribe-demo.ts
// The caption demo's script and colours. The reader watches three other people make a plan. Alex and Rosa are
// fictional names from the app's own demo, and "Person 3" is the label the app gives a speaker nobody has named.

export interface DemoTurn {
  speaker: string;
  /** The speaker's colour, brightened so the name clears 7:1 on DEMO_GROUND. */
  color: string;
  words: string;
}

/** The demo's panel. It is dark in both themes, as a phone's screen is. */
export const DEMO_GROUND = '#16191b';

export const DEMO_TURNS: DemoTurn[] = [
  { speaker: 'Alex', color: '#6cb6ff', words: 'Are we still on for Saturday?' },
  { speaker: 'Rosa', color: '#ffa24a', words: 'Yes. Come at six, and bring the salad.' },
  { speaker: 'Person 3', color: '#3ddc97', words: 'I will bring dessert.' },
];
```

- [ ] **Step 5: Create `components/stanscribe/CaptionDemo.tsx`.**

```tsx
'use client';

// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/CaptionDemo.tsx
// A drawing of the app's live screen that plays a short scripted conversation once, when the reader scrolls
// to it. The server renders every word. The script only changes each word's opacity, so the layout never
// shifts and a screen reader reads the whole conversation at any moment. With reduced motion, or with no
// script, nothing moves. One timer, about twenty updates: no video, no GIF, no canvas.

import { useEffect, useRef, useState } from 'react';
import { TYPE } from '@/components/stanscribe/type';
import { DEMO_GROUND, DEMO_TURNS } from '@/lib/stanscribe-demo';
import { cn } from '@/lib/utils';

const TURNS = DEMO_TURNS.map((turn) => ({ ...turn, list: turn.words.split(' ') }));
/** The index, across the whole conversation, of each turn's first word. */
const STARTS = TURNS.map((_, i) => TURNS.slice(0, i).reduce((count, turn) => count + turn.list.length, 0));
const TOTAL = TURNS.reduce((count, turn) => count + turn.list.length, 0);

/** Speaking pace, and the pause before a new speaker. */
const WORD_MS = 280;
const TURN_MS = 700;

const BAR = ['Smaller', 'Larger', 'Save', 'Stop'];

export function CaptionDemo() {
  const panel = useRef<HTMLDivElement>(null);
  // Every word shows until the script decides it can animate, so the server render is the whole conversation.
  // The count lives in a ref as well, so the timer chain reads it without waiting on a render.
  const count = useRef(TOTAL);
  const [shown, setShown] = useState(TOTAL);
  const [playing, setPlaying] = useState(false);
  const [animated, setAnimated] = useState(false);
  const show = (words: number) => {
    count.current = words;
    setShown(words);
  };

  useEffect(() => {
    const reduced = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined' || !panel.current) return;
    setAnimated(true);
    show(0);
    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (started || !entries.some((entry) => entry.isIntersecting)) return;
        started = true;
        setPlaying(true);
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    observer.observe(panel.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    let timer: ReturnType<typeof setTimeout>;
    // Each step schedules the next itself, so the pace does not depend on when React renders.
    const step = () => {
      const next = count.current + 1;
      show(next);
      if (next >= TOTAL) {
        setPlaying(false);
        return;
      }
      timer = setTimeout(step, STARTS.includes(next) ? TURN_MS : WORD_MS);
    };
    timer = setTimeout(step, WORD_MS);
    return () => clearTimeout(timer);
  }, [playing]);

  const finished = shown >= TOTAL;
  const press = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (count.current >= TOTAL) show(0);
    setPlaying(true);
  };
  // The newest line is the brightest, as in the app: the turn that holds the last word shown.
  const current = STARTS.reduce((latest, start, i) => (start < Math.max(shown, 1) ? i : latest), 0);

  return (
    <figure className="mx-auto w-full max-w-72">
      <div ref={panel} className="rounded-[2rem] border-4 border-[#2b3035] p-5 text-left" style={{ backgroundColor: DEMO_GROUND }}>
        <p aria-hidden="true" className="flex items-center gap-2 text-base font-semibold text-white">
          <span className="h-2.5 w-2.5 rounded-full bg-[#3ddc97]" />
          Listening
        </p>
        <p className="sr-only">An example of live captions:</p>
        <div className="mt-4 space-y-4">
          {TURNS.map((turn, i) => {
            const named = shown > STARTS[i];
            return (
              <p key={turn.speaker} className={cn('text-2xl font-semibold leading-snug', i === current ? 'text-white' : 'text-[#b4bbc0]')}>
                <span
                  data-speaker
                  data-shown={named}
                  className="block text-base transition-opacity duration-200"
                  style={{ color: turn.color, opacity: named ? 1 : 0 }}
                >
                  {turn.speaker}
                </span>
                {turn.list.map((word, j) => {
                  const visible = STARTS[i] + j < shown;
                  return (
                    <span key={j} data-word data-shown={visible} className="transition-opacity duration-200" style={{ opacity: visible ? 1 : 0 }}>
                      {word}{' '}
                    </span>
                  );
                })}
              </p>
            );
          })}
        </div>
        <div data-demo-bar aria-hidden="true" className="mt-6 grid grid-cols-4 gap-2 text-center text-sm font-semibold text-white">
          {BAR.map((label) => (
            <span key={label} className={cn('rounded-xl border border-[#3a4046] py-2', label === 'Stop' && 'border-transparent bg-[#c0352b]')}>
              {label}
            </span>
          ))}
        </div>
      </div>
      {animated && (
        <button type="button" onClick={press} className={cn(TYPE.body, TYPE.link, 'mx-auto mt-3 block min-h-11 cursor-pointer px-3')}>
          {playing ? 'Pause' : finished ? 'Play again' : 'Play'}
        </button>
      )}
    </figure>
  );
}
```

Two notes for the implementer:
- A speaker's name is shown once its first word is shown (`shown > STARTS[i]`). The server test counts `data-shown="true"` on words and names together, which is why it expects `WORDS.length + DEMO_TURNS.length`. The `shown(container)` helper in the test counts `[data-word]` only.
- `text-sm` is used only inside the drawn bar, which is a picture of the app's buttons and is `aria-hidden`. Readable text on the page stays 18px or larger.

- [ ] **Step 6: Run the tests.**

Run: `npx jest --ci __tests__/stanscribe/CaptionDemo.test.tsx`
Expected: PASS (11 tests). `render` flushes the mount effect inside `act`, so the words are hidden right after it. The timer chain schedules each next step from inside the timer callback, which is why one `advance(20000)` plays the whole conversation under fake timers.

- [ ] **Step 7: Type-check the new files.**

Run: `npx tsc --noEmit -p . 2>&1 | grep -E "CaptionDemo|stanscribe-demo|test-utils/contrast" || echo "no type errors in the new files"`
Expected: `no type errors in the new files`.

- [ ] **Step 8: Commit.**

```bash
git add lib/stanscribe-demo.ts components/stanscribe/CaptionDemo.tsx test-utils/contrast.ts __tests__/stanscribe/CaptionDemo.test.tsx
git commit -m "feat(stanscribe): a caption demo that plays once on scroll, with a pause button and no motion when motion is reduced" -- lib/stanscribe-demo.ts components/stanscribe/CaptionDemo.tsx test-utils/contrast.ts __tests__/stanscribe/CaptionDemo.test.tsx
```

---

### Task 5: Questions and answers as rows that open

**Goal:** Each question is a `Disclosure`, the accuracy answer starts open on both pages, and the JSON-LD still equals the page's words.

**Files:**
- Modify: `components/stanscribe/Faq.tsx`, `lib/stanscribe-faq.ts`
- Test: `__tests__/stanscribe/Faq.test.tsx`

**Acceptance Criteria:**
- [ ] Every question is a `<details>` with the question as an `h3` in its `<summary>`.
- [ ] On both pages exactly one row starts open: "How accurate are the captions?".
- [ ] Question and answer words are unchanged, in the same order, and the `FAQPage` JSON-LD equals them.
- [ ] The rows sit in one column (`COLUMN`).

**Verify:** `npx jest --ci __tests__/stanscribe/Faq.test.tsx` → all pass

**Steps:**

- [ ] **Step 1: Update `__tests__/stanscribe/Faq.test.tsx`.** Replace the `faqOf` function with:

```tsx
const faqOf = (page: HTMLElement) => {
  const section = page.querySelector<HTMLElement>('#questions')!;
  const items = Array.from(section.querySelectorAll('details')).map((row) => ({
    question: row.querySelector('summary h3')!.textContent ?? '',
    answer: row.querySelector('summary + div p')!.textContent ?? '',
    row,
  }));
  const scripts = page.querySelectorAll('script[type="application/ld+json"]');
  const data = JSON.parse(scripts[0]?.textContent ?? '{}') as { '@context'?: string; '@type'?: string; mainEntity?: FaqEntity[] };
  return { section, items, scripts, data };
};
```

Replace the test `its questions are the last section but Help, with every answer open` with:

```tsx
  test('its questions are the last section but Help, each a row that opens, with only the accuracy answer open', () => {
    const page = renderPage();
    const { section, items } = faqOf(page);
    expect(within(section).getByRole('heading', { level: 2, name: 'Questions and answers' })).toBeInTheDocument();
    expect(items).toHaveLength(count);
    expect(items[0].question).toBe(first);
    // "Captions can be wrong" must never be hidden, and this answer is where the line is.
    expect(items.filter(({ row }) => row.open).map(({ question }) => question)).toEqual(['How accurate are the captions?']);
    expect(items[0].row.parentElement?.className).toMatch(/\bmax-w-2xl\b/);
    const after = Array.from(page.querySelectorAll('section')).filter((other) => section.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(after.map((other) => other.id).filter((id) => id !== 'help')).toEqual([]);
    expect(page.querySelector('#help')).not.toBeNull();
  });
```

In the test `the accuracy answer keeps "they can be wrong" ...`, change `within(accuracy.li)` to `within(accuracy.row)`.

- [ ] **Step 2: Run it and watch it fail.**

Run: `npx jest --ci __tests__/stanscribe/Faq.test.tsx`
Expected: FAIL. `items` is empty because the section has no `<details>`.

- [ ] **Step 3: Export the accuracy question from `lib/stanscribe-faq.ts`.** Replace the line `const ACCURACY = 'How accurate are the captions?';` with:

```ts
/** The one answer that starts open: the brief says "captions can be wrong" is never hidden. */
export const ACCURACY_QUESTION = 'How accurate are the captions?';
```

and in the `accuracy` function change `question: ACCURACY,` to `question: ACCURACY_QUESTION,`.

- [ ] **Step 4: Rewrite the list in `components/stanscribe/Faq.tsx`.** Replace the file with:

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com

import { Disclosure } from '@/components/stanscribe/Disclosure';
import { COLUMN, Section } from '@/components/stanscribe/Section';
import { TYPE } from '@/components/stanscribe/type';
import { type AppKey } from '@/lib/stanscribe';
import { ACCURACY_QUESTION, answerText, faq } from '@/lib/stanscribe-faq';

export function Faq({ app }: { app: AppKey }) {
  const items = faq(app);
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answerText(answer) },
    })),
  };
  return (
    <Section id="questions" title="Questions and answers">
      <div className={COLUMN}>
        {items.map(({ question, answer }) => (
          <Disclosure key={question} label={question} open={question === ACCURACY_QUESTION}>
            <p>
              {answer.map((part, index) =>
                typeof part === 'string' ? (
                  part
                ) : (
                  <a key={index} href={part.href} className={TYPE.link}>
                    {part.text}
                  </a>
                ),
              )}
            </p>
          </Disclosure>
        ))}
      </div>
      {/* "<" is escaped so no answer can close the script element. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }} />
    </Section>
  );
}
```

- [ ] **Step 5: Run the tests.**

Run: `npx jest --ci __tests__/stanscribe/Faq.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git commit -m "feat(stanscribe): questions are rows that open on a click, and the accuracy answer starts open" -- components/stanscribe/Faq.tsx lib/stanscribe-faq.ts __tests__/stanscribe/Faq.test.tsx
```

---

### Task 6: The main page

**Goal:** `/stanscribe` has the spec's eight sections: the listing-style hero, How it works with four steps and the demo, the short story, Features, Privacy as rows, the comparison, the questions and Help.

**Files:**
- Modify: `app/(stanscribe)/stanscribe/page.tsx`
- Test: `__tests__/stanscribe/StanScribePage.test.tsx`

**Acceptance Criteria:**
- [ ] The h2s, in order: How it works, Built for my grandpa Stan, Features, Privacy, Which one is for you?, Questions and answers, Help.
- [ ] The hero holds the app icon, the h1, the tagline, four facts with tiles, both download blocks and the hero image. It has no intro paragraph and no jump links.
- [ ] How it works has four steps ending in "View conversations." and contains the caption demo.
- [ ] The story shows three paragraphs and "Devin"; the other three paragraphs are inside a `<details>` labelled "Read the whole story".
- [ ] Features has six `h3` rows, five screens with labels, and the line "Something you use every day should not look clinical."
- [ ] Privacy has five rows whose labels are visible with the rows closed, including "Ask before you caption people".
- [ ] `og:site_name` is "Stan Scribe".
- [ ] `findCopyViolations` and `findTypeViolations` find nothing; headings are in order; every in-page link has a target.

**Verify:** `npx jest --ci __tests__/stanscribe/StanScribePage.test.tsx __tests__/stanscribe/Bands.test.tsx __tests__/stanscribe/Faq.test.tsx` → all pass

**Steps:**

- [ ] **Step 1: Rewrite `__tests__/stanscribe/StanScribePage.test.tsx`.** Replace the whole file with:

```tsx
import { render, screen, within } from '@testing-library/react';
import StanScribePage, { metadata } from '@/app/(stanscribe)/stanscribe/page';
import { APPS, legalLinks } from '@/lib/stanscribe';
import { findCopyViolations, findTypeViolations, headingLevels, pageText } from '@/test-utils/stanscribe';

// The backdrop fetches SVG and GSAP needs matchMedia; neither matters to the page's content.
jest.mock('@/lib/stanscribe', () => ({ ...jest.requireActual('@/lib/stanscribe'), RELEASED: false }));
jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));
jest.mock('@/components/ui/HeroLoadIn', () => ({ HeroLoadIn: ({ children }: { children: unknown }) => children }));

const renderPage = () => render(<StanScribePage />).container;

test('support email and both apps’ legal links (App Store Connect Support URL)', () => {
  const page = renderPage();
  expect(screen.getByRole('link', { name: 'stanscribe@devinhunt.com' })).toHaveAttribute('href', 'mailto:stanscribe@devinhunt.com');
  for (const { href } of [...legalLinks('scribe'), ...legalLinks('light')]) {
    expect(page.querySelector(`a[href="${href}"]`)).not.toBeNull();
  }
});

test('the accuracy and consent lines are visible, not tucked away', () => {
  renderPage();
  // The accuracy answer is a row that starts open.
  expect(screen.getByText(/they can be wrong/i).closest('details')!.open).toBe(true);
  // The consent line is a row's label, which shows whether the row is open or not.
  const consent = screen.getByRole('heading', { level: 3, name: 'Ask before you caption people' });
  expect(consent.closest('summary')).not.toBeNull();
});

test('seven sections under the hero, in the listing’s order', () => {
  renderPage();
  expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
    'How it works',
    'Built for my grandpa Stan',
    'Features',
    'Privacy',
    'Which one is for you?',
    'Questions and answers',
    'Help',
  ]);
});

test('the hero is the listing’s header: icon, name, tagline, four facts and the two downloads', () => {
  const page = renderPage();
  const hero = page.querySelector('section')!;
  expect(within(hero).getByRole('heading', { level: 1, name: 'Stan Scribe' })).toBeInTheDocument();
  expect(within(hero).getByText('Live captions for every voice.')).toBeInTheDocument();
  expect(within(hero).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
    'Live captions',
    'A color and a name for each speaker',
    'Works offline',
    'No account needed',
  ]);
  expect(hero.querySelectorAll('li span[aria-hidden="true"] svg')).toHaveLength(4);
  expect(within(hero).getAllByText('Coming soon to the App Store')).toHaveLength(2);
  expect(within(hero).getByRole('link', { name: /public beta/i })).toHaveAttribute('href', APPS.scribe.betaUrl);
  // No intro paragraph and no row of jump links.
  expect(hero.textContent).not.toMatch(/Put your iPhone on the table/);
  expect(hero.querySelector('nav')).toBeNull();
  // The hero sits above the card, so the picture that hangs into the next band is not painted over.
  expect(hero.className).toMatch(/\brelative\b/);
  expect(hero.className).toMatch(/\bz-10\b/);
});

test('how it works: four steps ending on your saved conversations, beside the caption demo', () => {
  const page = renderPage();
  const how = page.querySelector<HTMLElement>('#how-it-works')!;
  expect(within(how).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Tap Start.', 'Follow along.', 'Tap Stop.', 'View conversations.']);
  expect(how.textContent).toMatch(/They never start on their own\./);
  expect(how.textContent).toMatch(/No audio is kept\./);
  expect(how.textContent).toMatch(/Find any conversation later by date, by person or by any word\./);
  expect(how.querySelector('ol')!.children).toHaveLength(4);
  expect(how.querySelector('figure [data-demo-bar]')).not.toBeNull();
});

test('presents both apps, with the comparison at #light', () => {
  const page = renderPage();
  const light = page.querySelector<HTMLElement>('#light')!;
  expect(within(light).getByRole('heading', { level: 2, name: 'Which one is for you?' })).toBeInTheDocument();
  expect(within(light).getByRole('table')).toBeInTheDocument();
  expect(light.textContent).toMatch(/Both caption offline, with speaker colors and names, in 25 languages\. Neither has in-app purchases\./);
  expect(light.textContent).toMatch(/Not sure\? Start with Light\./);
});

test('images have alt text and headings are in order', () => {
  const page = renderPage();
  expect(page.querySelectorAll('img').length).toBeGreaterThanOrEqual(7);
  for (const img of Array.from(page.querySelectorAll('img:not([alt=""])'))) expect(img.getAttribute('alt')?.trim()).toBeTruthy();
  for (const img of Array.from(page.querySelectorAll('img[alt=""]'))) expect(img.closest('a[aria-label]')).not.toBeNull();
  const levels = headingLevels(page);
  expect(levels[0]).toBe(1);
  expect(levels.filter((l) => l === 1)).toHaveLength(1);
  levels.forEach((level, i) => {
    if (i > 0) expect(level - levels[i - 1]).toBeLessThanOrEqual(1);
  });
});

test('the story is three short paragraphs, with the rest one click away', () => {
  const page = renderPage();
  const story = page.querySelector<HTMLElement>('#story')!;
  const more = story.querySelector('details')!;
  expect(more.open).toBe(false);
  expect(more.querySelector('summary')!.textContent).toMatch(/Read the whole story/);
  const always = Array.from(story.querySelectorAll('p')).filter((p) => !more.contains(p)).map((p) => p.textContent);
  expect(always).toEqual([
    'My grandpa Stan is hard of hearing. At the table, the conversation moves faster than he can catch it.',
    'With live captions he could keep up and answer, instead of pretending he had heard. The app my parents tried charged a monthly fee and needed the internet, so I built this one. Stan uses it every day at dinner.',
    'Devin',
  ]);
  const rest = more.textContent ?? '';
  expect(rest).toMatch(/I used AI to help me build it\./);
  expect(rest).toMatch(/Stan Scribe Light is free\. The full Stan Scribe is a one-time purchase, with no subscription\./);
  expect(rest).toMatch(/Stan took it to a doctor’s appointment too/);
  expect(rest).toMatch(/a live translation app/);
  expect(page.querySelector('#behind-the-app')).toBeNull();
});

test('features: six rows with icons, five screens with labels, and why the themes are there', () => {
  const page = renderPage();
  const features = page.querySelector<HTMLElement>('#features')!;
  expect(within(features).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
    'Speakers in color',
    'Voices it knows',
    'Big text, clear buttons',
    'Keeps listening',
    'Conversations you keep',
    'Choose how it looks',
  ]);
  expect(features.textContent).toMatch(/28 themes I curated, or make your own from your photos\./);
  expect(features.textContent).toMatch(/Something you use every day should not look clinical\./);
  const screens = features.querySelector('ul[data-screens]')!;
  expect(Array.from(screens.querySelectorAll('li')).map((li) => li.querySelector('p')!.textContent)).toEqual([
    'Speakers in color',
    'Text as big as you need',
    'Saved as text',
    'Find any conversation',
    '25 languages',
  ]);
  expect(screens.querySelectorAll('img')).toHaveLength(5);
  // A grid, not a sideways scroller.
  expect(screens.className).not.toMatch(/overflow-x/);
});

test('privacy: five rows in the tour’s style, each label visible and each opening to its words', () => {
  const page = renderPage();
  const privacy = page.querySelector<HTMLElement>('#privacy')!;
  const rows = Array.from(privacy.querySelectorAll('details'));
  expect(rows.map((row) => row.querySelector('summary h3')!.textContent)).toEqual([
    'Everything stays on your iPhone or iPad',
    'No account. No ads. No tracking.',
    'No audio is saved',
    'Your words leave only when you send them',
    'Ask before you caption people',
  ]);
  for (const row of rows) {
    expect(row.open).toBe(false);
    expect(row.querySelector('summary span[aria-hidden="true"] svg')).not.toBeNull();
  }
  expect(rows[0].textContent).toMatch(/captions work in airplane mode\./);
  expect(rows[1].textContent).toMatch(/The app never connects to the internet\./);
  expect(rows[2].textContent).toMatch(/keeps none of the sound/);
  expect(rows[3].textContent).toMatch(/share or export a conversation, sync it to a notes folder, or turn on iCloud backup to your own iCloud\./);
  expect(rows[4].textContent).toMatch(/Set up someone’s voice only with their permission\./);
  expect(within(privacy).getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/stanscribe/privacy/');
});

test('one type scale: no mono, tracked caps or italics', () => {
  expect(findTypeViolations(renderPage())).toEqual([]);
});

test('every in-page link has a target, and the anchors other pages link still exist', () => {
  const page = renderPage();
  for (const a of Array.from(page.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))) expect(page.querySelector(a.getAttribute('href')!)).not.toBeNull();
  for (const id of ['how-it-works', 'story', 'features', 'privacy', 'light', 'questions', 'help']) expect(page.querySelector(`#${id}`)).not.toBeNull();
});

test('words follow the brief, metadata included, and previews name the site Stan Scribe', () => {
  const page = renderPage();
  expect(findCopyViolations(`${pageText(page)} ${JSON.stringify(metadata)}`)).toEqual([]);
  expect(metadata.title).toBe('Stan Scribe: live captions for every voice');
  expect(metadata.alternates?.canonical).toBe('https://stanscribe.devinhunt.com/');
  expect(metadata.openGraph).toMatchObject({ siteName: 'Stan Scribe' });
});
```

- [ ] **Step 2: Run it and watch it fail.**

Run: `npx jest --ci __tests__/stanscribe/StanScribePage.test.tsx`
Expected: FAIL on the section order, the hero facts, the four steps, the story and the privacy rows.

- [ ] **Step 3: Rewrite `app/(stanscribe)/stanscribe/page.tsx`.** Replace the whole file with:

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(stanscribe)/stanscribe/page.tsx
// Stan Scribe and Stan Scribe Light: the product page, and both apps' Support and Marketing URL in
// App Store Connect. It reads as an extension of the App Store listing (spec 2026-11-12): a header on the
// contours, then short lines with icons on one card, with the detail in rows that open. The copy rules (no
// prices, no model names, privacy wording) are in the app repo's docs/marketing/stanscribe-page/README.md.

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppIcon } from '@/components/stanscribe/AppIcon';
import { CaptionDemo } from '@/components/stanscribe/CaptionDemo';
import { ComparisonTable } from '@/components/stanscribe/ComparisonTable';
import { Disclosure } from '@/components/stanscribe/Disclosure';
import { DownloadBlock } from '@/components/stanscribe/DownloadBlock';
import { Faq } from '@/components/stanscribe/Faq';
import { HelpBlock } from '@/components/stanscribe/HelpBlock';
import { IconTile } from '@/components/stanscribe/IconTile';
import {
  AskIcon,
  CaptionsIcon,
  ChevronIcon,
  ConversationsIcon,
  DeviceIcon,
  LockIcon,
  LooksIcon,
  NoAccountIcon,
  NoAudioIcon,
  NoTrackingIcon,
  OfflineIcon,
  SearchIcon,
  SendIcon,
  SpeakerDots,
  StartIcon,
  StopIcon,
  TextSizeIcon,
  VoicesIcon,
} from '@/components/stanscribe/icons';
import { PhoneShot } from '@/components/stanscribe/PhoneShot';
import { BAND, BAND_COLUMN, BANDS, COLUMN, Section } from '@/components/stanscribe/Section';
import { TYPE } from '@/components/stanscribe/type';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { HeroLoadIn } from '@/components/ui/HeroLoadIn';
import { BOTH_APPS_SHARE, LIGHT_NOT_SURE, SHOTS, SITE_NAME, SOCIAL_IMAGE, pageHref, pageUrl, type ShotImage } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

const TITLE = 'Stan Scribe: live captions for every voice';
const DESCRIPTION =
  'Live captions for the conversation in front of you, with a color for each speaker. Works offline on iPhone and iPad. No account, no ads, no tracking.';
const PAGE_URL = pageUrl('scribe');

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: null,
  alternates: { canonical: PAGE_URL },
  openGraph: { type: 'website', locale: 'en_US', url: PAGE_URL, siteName: SITE_NAME, title: TITLE, description: DESCRIPTION, images: [SOCIAL_IMAGE] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [SOCIAL_IMAGE] },
};

/** How far the hero's picture hangs into the first band of the card. */
const HANG = 'clamp(8rem,22vw,17rem)';

interface Row {
  icon: ReactNode;
  title: string;
  body: string;
}

/** The first page of the app's tour, with the speakers fact naming names. */
const FACTS: { icon: ReactNode; label: string }[] = [
  { icon: <CaptionsIcon />, label: 'Live captions' },
  { icon: <SpeakerDots />, label: 'A color and a name for each speaker' },
  { icon: <OfflineIcon />, label: 'Works offline' },
  { icon: <NoAccountIcon />, label: 'No account needed' },
];

const STEPS: (Row & { tone?: 'start' | 'stop' })[] = [
  { icon: <StartIcon />, tone: 'start', title: 'Tap Start.', body: 'Captions begin as people speak. They never start on their own.' },
  { icon: <SpeakerDots />, title: 'Follow along.', body: 'Each speaker gets a color and a name.' },
  { icon: <StopIcon />, tone: 'stop', title: 'Tap Stop.', body: 'The conversation is saved as text. No audio is kept.' },
  { icon: <ConversationsIcon />, title: 'View conversations.', body: 'Find any conversation later by date, by person or by any word.' },
];

const STORY = [
  'My grandpa Stan is hard of hearing. At the table, the conversation moves faster than he can catch it.',
  'With live captions he could keep up and answer, instead of pretending he had heard. The app my parents tried charged a monthly fee and needed the internet, so I built this one. Stan uses it every day at dinner.',
];

const STORY_MORE = [
  'I used AI to help me build it. I wanted as many people as possible to have it, at the lowest cost I could manage. Stan Scribe Light is free. The full Stan Scribe is a one-time purchase, with no subscription. Both work without the internet.',
  'Stan took it to a doctor’s appointment too, and my mom didn’t have to shout and repeat what the doctor said.',
  'Next I want to add more languages, make the speech models smaller and faster, and build a live translation app the same way. That one is in progress.',
];

const FEATURES: Row[] = [
  { icon: <SpeakerDots />, title: 'Speakers in color', body: 'A color and a name for each speaker.' },
  { icon: <VoicesIcon />, title: 'Voices it knows', body: 'Teach it the people you talk with most, with their permission.' },
  { icon: <TextSizeIcon />, title: 'Big text, clear buttons', body: 'Every button says what it does: Smaller, Larger, Save, Stop.' },
  { icon: <LockIcon />, title: 'Keeps listening', body: 'Lock your iPhone and captions keep going until you tap Stop.' },
  { icon: <SearchIcon />, title: 'Conversations you keep', body: 'Find any one by date, person or word. Export it, or back it up to your own iCloud.' },
  { icon: <LooksIcon />, title: 'Choose how it looks', body: '28 themes I curated, or make your own from your photos.' },
];

/** Five screens in a row, as a store listing shows them. */
const SCREENS: { image: ShotImage; label: string }[] = [
  { image: SHOTS.liveGraphite, label: 'Speakers in color' },
  { image: SHOTS.liveLarge, label: 'Text as big as you need' },
  { image: SHOTS.conversation, label: 'Saved as text' },
  { image: SHOTS.library, label: 'Find any conversation' },
  { image: SHOTS.languages, label: '25 languages' },
];

const PRIVACY: Row[] = [
  { icon: <DeviceIcon />, title: 'Everything stays on your iPhone or iPad', body: 'The speech models are built into the app, so captions work in airplane mode.' },
  { icon: <NoTrackingIcon />, title: 'No account. No ads. No tracking.', body: 'The app never connects to the internet.' },
  { icon: <NoAudioIcon />, title: 'No audio is saved', body: 'The app turns sound into captions as you listen and keeps none of the sound. It saves only the words of conversations you keep, on your device.' },
  { icon: <SendIcon />, title: 'Your words leave only when you send them', body: 'That is when you share or export a conversation, sync it to a notes folder, or turn on iCloud backup to your own iCloud.' },
  { icon: <AskIcon />, title: 'Ask before you caption people', body: 'The app hears everyone nearby. In some places, everyone in a conversation must agree before it is captured, so tell people the app is on. Set up someone’s voice only with their permission.' },
];

/** An icon tile, a name and one line, at the same two sizes everywhere on the page. */
function IconRow({ icon, title, body, tone }: Row & { tone?: 'start' | 'stop' }) {
  return (
    <li className="grid grid-cols-[3rem_1fr] gap-x-4">
      <IconTile tone={tone}>{icon}</IconTile>
      <div>
        <h3 className={TYPE.heading}>{title}</h3>
        <p className={cn(TYPE.body, 'mt-1')}>{body}</p>
      </div>
    </li>
  );
}

export default function StanScribePage() {
  return (
    <div className="relative min-h-svh">
      <ContourBackdrop page="interests" quiet />

      <div className={BANDS}>
        {/* Hero: the listing's header, on the contours with no fill. `relative z-10` keeps the picture that
            hangs into the next band above that band's fill. */}
        <section aria-labelledby="stanscribe-title" className={cn(BAND, 'relative z-10 pb-0 pt-8 text-center md:pt-12')}>
          <div className={BAND_COLUMN}>
            <HeroLoadIn>
              <AppIcon app="scribe" className="h-26 w-26 shadow-lg" />
              <h1 id="stanscribe-title" className={cn(TYPE.display, 'mt-5')}>
                Stan Scribe
              </h1>
              <p className={cn(TYPE.title, 'mt-3')}>Live captions for every voice.</p>
              <ul role="list" className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-x-8 gap-y-4">
                {FACTS.map(({ icon, label }) => (
                  <li key={label} className={cn(TYPE.body, 'flex items-center gap-3 text-left font-semibold text-ink-strong')}>
                    <IconTile>{icon}</IconTile>
                    {label}
                  </li>
                ))}
              </ul>
              <div className="mx-auto mt-10 grid max-w-160 gap-x-10 gap-y-8 sm:grid-cols-2">
                <DownloadBlock app="scribe" />
                <DownloadBlock app="light" />
              </div>
            </HeroLoadIn>
            <PhoneShot image={SHOTS.hero} priority className="mx-auto mt-12 max-w-xl" style={{ marginBottom: `calc(-1 * ${HANG})` }} />
          </div>
        </section>

        <Section id="how-it-works" title="How it works" className="pt-[calc(clamp(8rem,22vw,17rem)_+_3rem)]">
          <div className="mx-auto grid max-w-208 items-center gap-12 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-16">
            <ol role="list" className="space-y-7">
              {STEPS.map((step) => (
                <IconRow key={step.title} {...step} />
              ))}
            </ol>
            <CaptionDemo />
          </div>
        </Section>

        <Section id="story" title="Built for my grandpa Stan">
          <div className={cn(COLUMN, 'space-y-5')}>
            {STORY.map((paragraph) => (
              <p key={paragraph} className={TYPE.lead}>
                {paragraph}
              </p>
            ))}
            <details className="group">
              <summary className={cn(TYPE.body, TYPE.link, 'inline-flex min-h-11 cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden')}>
                Read the whole story
                <ChevronIcon aria-hidden="true" className="h-5 w-5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-3 space-y-5">
                {STORY_MORE.map((paragraph) => (
                  <p key={paragraph} className={TYPE.body}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </details>
            <p className={cn(TYPE.lead, 'pt-1 text-ink-strong')}>Devin</p>
          </div>
        </Section>

        <Section id="features" title="Features">
          <ul role="list" className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <IconRow key={feature.title} {...feature} />
            ))}
          </ul>
          {/* A grid at every width. A sideways scroller is easy to miss. */}
          <ul role="list" data-screens className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {SCREENS.map(({ image, label }) => (
              <li key={label}>
                <PhoneShot image={image} />
                <p className={cn(TYPE.body, 'mt-3 text-center font-semibold text-ink-strong')}>{label}</p>
              </li>
            ))}
          </ul>
          <p className={cn(TYPE.heading, 'mt-16 text-center')}>Something you use every day should not look clinical.</p>
          <PhoneShot image={SHOTS.paintedThemes} className="mx-auto mt-6 max-w-3xl" />
        </Section>

        <Section id="privacy" title="Privacy">
          <div className={COLUMN}>
            <div>
              {PRIVACY.map(({ icon, title, body }) => (
                <Disclosure key={title} label={title} icon={<IconTile>{icon}</IconTile>}>
                  <p>{body}</p>
                </Disclosure>
              ))}
            </div>
            <p className={cn(TYPE.body, 'mt-8')}>
              Read the <a href={pageHref('scribe', 'privacy')} className={TYPE.link}>Privacy Policy</a>.
            </p>
          </div>
        </Section>

        <Section id="light" title="Which one is for you?">
          <div className={COLUMN}>
            <p className={TYPE.lead}>{BOTH_APPS_SHARE}</p>
            <ComparisonTable className="mt-8" />
            <p className={cn(TYPE.body, 'mt-6')}>
              <strong className="font-semibold text-ink-strong">Not sure?</strong> {LIGHT_NOT_SURE}
            </p>
          </div>
        </Section>

        <Faq app="scribe" />

        <HelpBlock apps={['scribe', 'light']} />
      </div>
    </div>
  );
}
```

`PhoneShot` takes `style` since Task 3. The hero image uses it for a negative bottom margin, so the picture hangs into the next band.

- [ ] **Step 4: Run the tests.**

Run: `npx jest --ci __tests__/stanscribe/StanScribePage.test.tsx __tests__/stanscribe/Bands.test.tsx __tests__/stanscribe/Faq.test.tsx`
Expected: PASS. In `Bands.test.tsx`, "Help sits on a white band" and "ends on a white band" still pass: the page has eight sections and Help is the eighth.

If "the story is three short paragraphs" fails on the order of `always`, check that "Devin" comes after the `<details>` in the markup: the test filters out paragraphs inside `<details>`, so the order of the rest is STORY[0], STORY[1], "Devin".

- [ ] **Step 5: Commit.**

```bash
git commit -m "feat(stanscribe): the page reads as the listing's next screen, with icons, short lines and rows that open" -- "app/(stanscribe)/stanscribe/page.tsx" __tests__/stanscribe/StanScribePage.test.tsx
```

---

### Task 7: The Light page

**Goal:** `/stanscribe-light` has the same hero pattern with Light's own icon and one summary line, then Help, the comparison and its questions.

**Files:**
- Modify: `app/(stanscribe)/stanscribe-light/page.tsx`
- Test: `__tests__/stanscribe/StanScribeLightPage.test.tsx`

**Acceptance Criteria:**
- [ ] The hero holds Light's icon, the h1 "Stan Scribe Light", "The simple edition. Free.", the one-line `LIGHT_SUMMARY`, the download status and the two-phone image.
- [ ] Help comes right after the hero, before the comparison.
- [ ] The comparison shows `BOTH_APPS_SHARE`, the table, "Not sure? Start with Light." and the two links to the main page.
- [ ] `og:site_name` is "Stan Scribe".
- [ ] `findCopyViolations` and `findTypeViolations` find nothing.

**Verify:** `npx jest --ci __tests__/stanscribe/StanScribeLightPage.test.tsx __tests__/stanscribe/Bands.test.tsx __tests__/stanscribe/Faq.test.tsx` → all pass

**Steps:**

- [ ] **Step 1: Add tests to `__tests__/stanscribe/StanScribeLightPage.test.tsx`.** Change the `@testing-library/react` import to `import { render, screen, within } from '@testing-library/react';`. Replace the last test in the file (`the hero says the name and offer once ...`) with:

```tsx
test('the hero says the name and offer once: the download line adds only the status', () => {
  renderPage();
  expect(screen.getAllByText('Stan Scribe Light', { selector: 'h1, p' })).toHaveLength(1);
  expect(screen.queryByText('Free. The simple edition.')).toBeNull();
  expect(screen.getByText('Coming soon to the App Store')).toBeInTheDocument();
});

test('the hero is the listing’s header: Light’s icon, its name, the tagline and one line', () => {
  const page = renderPage();
  const hero = page.querySelector('section')!;
  expect(hero.querySelector('span[aria-hidden="true"][style*="app-icon-light.png"]')).not.toBeNull();
  expect(within(hero).getByText('The simple edition. Free.')).toBeInTheDocument();
  expect(
    within(hero).getByText('The same live captions and speaker colors as Stan Scribe, made simpler: one speech model, a black or a white page, and a smaller download.'),
  ).toBeInTheDocument();
  expect(hero.querySelectorAll('p')).toHaveLength(3);
  expect(hero.className).toMatch(/\brelative\b/);
  expect(hero.className).toMatch(/\bz-10\b/);
});

test('the comparison: one line, the table, and where to go if unsure', () => {
  const page = renderPage();
  const compare = page.querySelector<HTMLElement>('#compare')!;
  expect(compare.textContent).toMatch(/Both caption offline, with speaker colors and names, in 25 languages\. Neither has in-app purchases\./);
  expect(within(compare).getByRole('table')).toBeInTheDocument();
  expect(compare.textContent).toMatch(/Not sure\? Start with Light\./);
});

test('link previews name the site Stan Scribe', () => {
  expect(metadata.openGraph).toMatchObject({ siteName: 'Stan Scribe' });
});
```

- [ ] **Step 2: Run it and watch it fail.**

Run: `npx jest --ci __tests__/stanscribe/StanScribeLightPage.test.tsx`
Expected: FAIL on the icon, the `z-10` class and `siteName`.

- [ ] **Step 3: Rewrite `app/(stanscribe)/stanscribe-light/page.tsx`.** Replace the whole file with:

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(stanscribe)/stanscribe-light/page.tsx
// Stan Scribe Light's Support and Marketing URL in App Store Connect. App Review opens it looking
// for a contact, so Help sits directly under the hero. The hero is the listing's header, as on the main page.

import type { Metadata } from 'next';
import { AppIcon } from '@/components/stanscribe/AppIcon';
import { ComparisonTable } from '@/components/stanscribe/ComparisonTable';
import { DownloadBlock } from '@/components/stanscribe/DownloadBlock';
import { Faq } from '@/components/stanscribe/Faq';
import { HelpBlock } from '@/components/stanscribe/HelpBlock';
import { PhoneShot } from '@/components/stanscribe/PhoneShot';
import { BAND, BAND_COLUMN, BANDS, COLUMN, INTRO, Section } from '@/components/stanscribe/Section';
import { TYPE } from '@/components/stanscribe/type';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { HeroLoadIn } from '@/components/ui/HeroLoadIn';
import { BOTH_APPS_SHARE, LIGHT_NOT_SURE, LIGHT_SUMMARY, SHOTS, SITE_NAME, SOCIAL_IMAGE, pageHref, pageUrl } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

const TITLE = 'Stan Scribe Light: live captions, the simple edition';
const DESCRIPTION =
  'Live captions for the conversation in front of you, with a color for each speaker. The simple edition of Stan Scribe, free. Works offline on iPhone and iPad. No account, no ads, no tracking.';
const PAGE_URL = pageUrl('light');

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: null,
  alternates: { canonical: PAGE_URL },
  openGraph: { type: 'website', locale: 'en_US', url: PAGE_URL, siteName: SITE_NAME, title: TITLE, description: DESCRIPTION, images: [SOCIAL_IMAGE] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [SOCIAL_IMAGE] },
};

/** How far the hero's picture hangs into the first band of the card. */
const HANG = 'clamp(6rem,16vw,12rem)';

export default function StanScribeLightPage() {
  return (
    <div className="relative min-h-svh">
      <ContourBackdrop page="interests" quiet />

      <div className={BANDS}>
        {/* `relative z-10` keeps the picture that hangs into the next band above that band's fill. */}
        <section aria-labelledby="light-page-title" className={cn(BAND, 'relative z-10 pb-0 pt-8 text-center md:pt-12')}>
          <div className={BAND_COLUMN}>
            <HeroLoadIn>
              <AppIcon app="light" className="h-26 w-26 shadow-lg" />
              <h1 id="light-page-title" className={cn(TYPE.display, 'mt-5')}>
                Stan Scribe Light
              </h1>
              <p className={cn(TYPE.title, 'mt-3')}>The simple edition. Free.</p>
              <p className={cn(TYPE.lead, INTRO)}>{LIGHT_SUMMARY}</p>
              <DownloadBlock app="light" withName={false} className="mt-8" />
            </HeroLoadIn>
            <PhoneShot image={SHOTS.lightBlackAndWhite} priority className="mx-auto mt-12 max-w-104" style={{ marginBottom: `calc(-1 * ${HANG})` }} />
          </div>
        </section>

        <HelpBlock apps={['light']} className="pt-[calc(clamp(6rem,16vw,12rem)_+_3rem)]" />

        <Section id="compare" title="Which one is for you?">
          <div className={COLUMN}>
            <p className={TYPE.lead}>{BOTH_APPS_SHARE}</p>
            <ComparisonTable className="mt-8" />
            <p className={cn(TYPE.body, 'mt-6')}>
              <strong className="font-semibold text-ink-strong">Not sure?</strong> {LIGHT_NOT_SURE}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-1">
              <a href={pageHref('scribe')} className={cn(TYPE.body, TYPE.link, 'inline-block py-1')}>
                See everything in Stan Scribe <span aria-hidden="true">→</span>
              </a>
              <a href={`${pageHref('scribe')}#story`} className={cn(TYPE.body, TYPE.link, 'inline-block py-1')}>
                Why I built Stan Scribe <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </Section>

        <Faq app="light" />
      </div>
    </div>
  );
}
```

`PhoneShot` takes `style` since Task 3.

The hero's `DownloadBlock` shows "Coming soon to the App Store" in a `<p>`, which with the tagline and the summary makes the three `<p>` elements the test counts.

- [ ] **Step 4: Run the tests.**

Run: `npx jest --ci __tests__/stanscribe/StanScribeLightPage.test.tsx __tests__/stanscribe/Bands.test.tsx __tests__/stanscribe/Faq.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git commit -m "feat(stanscribe): Light's page takes the listing-style hero, its own icon and one summary line" -- "app/(stanscribe)/stanscribe-light/page.tsx" __tests__/stanscribe/StanScribeLightPage.test.tsx
```

---

### Task 8: The share card, the site name and the app's own tab icon

**Goal:** A script draws share card A, the new JPEG is committed, every Stan Scribe page's preview names the site "Stan Scribe", and Stan Scribe pages link the app's icon while portfolio pages keep `favicon.svg`.

**Files:**
- Create: `scripts/stanscribe-social.mjs`, `scripts/stanscribe-social/card.html`
- Modify: `package.json` (script `build:stanscribe-social`), `public/images/stanscribe/stan-scribe-social.jpg`
- Modify: `app/layout.tsx`, `app/(stanscribe)/layout.tsx`, `components/stanscribe/LegalPage.tsx`
- Test: `__tests__/stanscribe/metadata.test.tsx`

**Acceptance Criteria:**
- [ ] `npm run build:stanscribe-social` writes `public/images/stanscribe/stan-scribe-social.jpg` at 1200 x 630.
- [ ] The card shows the app icon, "Stan Scribe", "Live captions for every voice." and "Offline · No account · iPhone and iPad" at the left on the night ground, with the three-phone image at the right. No italics, no warm text colours.
- [ ] `app/layout.tsx` has no hard-coded `<link rel="icon">` or `<link rel="apple-touch-icon">`; its metadata carries `favicon.svg`.
- [ ] `app/(stanscribe)/layout.tsx` exports metadata whose icons are `FAVICONS.icon` and `FAVICONS.apple`.
- [ ] The legal pages' `openGraph.siteName` is "Stan Scribe".

**Verify:** `npx jest --ci __tests__/stanscribe/metadata.test.tsx __tests__/stanscribe/lib.test.ts` → all pass, and the JPEG read with the Read tool shows the card as described.

**Steps:**

- [ ] **Step 1: Write the failing test `__tests__/stanscribe/metadata.test.tsx`.**

```tsx
import fs from 'node:fs';
import path from 'node:path';
import { metadata as stanScribe } from '@/app/(stanscribe)/layout';
import { metadata as root } from '@/app/layout';
import { legalMetadata } from '@/components/stanscribe/LegalPage';
import { FAVICONS } from '@/lib/stanscribe';

test('Stan Scribe’s pages show the app’s own icon in the tab and as the touch icon', () => {
  expect(stanScribe.icons).toEqual({
    icon: [{ url: FAVICONS.icon, type: 'image/png', sizes: '32x32' }],
    apple: [{ url: FAVICONS.apple, sizes: '180x180' }],
  });
});

test('the portfolio keeps its favicon, through metadata, so a route group can replace it', () => {
  expect(root.icons).toEqual({ icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }], apple: [{ url: '/favicon.svg' }] });
  const layout = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf8');
  expect(layout).not.toMatch(/<link rel="(icon|apple-touch-icon)"/);
});

test.each(['scribe', 'light'] as const)('%s legal pages name the site Stan Scribe in link previews', async (app) => {
  const metadata = await legalMetadata(app, { params: Promise.resolve({ page: 'privacy' }) });
  expect(metadata.openGraph).toMatchObject({ siteName: 'Stan Scribe' });
});
```

- [ ] **Step 2: Run it and watch it fail.**

Run: `npx jest --ci __tests__/stanscribe/metadata.test.tsx`
Expected: FAIL. `@/app/(stanscribe)/layout` exports no `metadata`.

- [ ] **Step 3: Move the icons into metadata.** In `app/layout.tsx`:

Delete these two lines from `<head>`:

```tsx
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
```

In the `metadata` export, after the `creator: 'Devin Hunt',` line, add:

```tsx
  // In metadata, not as <link> tags in <head>, so the Stan Scribe route group can show the app's own icon.
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }], apple: [{ url: '/favicon.svg' }] },
```

In `app/(stanscribe)/layout.tsx`, change the first import to `import type { Metadata } from 'next';` plus the existing `ReactNode` import, add `import { FAVICONS } from '@/lib/stanscribe';`, and add above the component:

```tsx
// The app's own icon in the tab and as the touch icon. Each page sets the rest of its metadata.
export const metadata: Metadata = {
  icons: {
    icon: [{ url: FAVICONS.icon, type: 'image/png', sizes: '32x32' }],
    apple: [{ url: FAVICONS.apple, sizes: '180x180' }],
  },
};
```

In `components/stanscribe/LegalPage.tsx`, add `SITE_NAME` to the import from `@/lib/stanscribe` and change `siteName: 'Devin Hunt'` to `siteName: SITE_NAME`.

- [ ] **Step 4: Run the test.**

Run: `npx jest --ci __tests__/stanscribe/metadata.test.tsx`
Expected: PASS.

- [ ] **Step 5: Create the card's template `scripts/stanscribe-social/card.html`.**

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
@font-face { font-family: "Newsreader"; font-weight: 400 600; src: url({{NEWSREADER}}) format("woff2"); }
@font-face { font-family: "Hanken Grotesk"; font-weight: 400 600; src: url({{HANKEN}}) format("woff2"); }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { position: relative; background: #111517; color: #e9edef; font-family: "Hanken Grotesk", sans-serif; -webkit-font-smoothing: antialiased; }
.plate { position: absolute; inset: 0; background: url({{PLATE}}) center / cover; opacity: 0.35; }
.words { position: absolute; left: 72px; top: 104px; width: 560px; }
.icon { display: block; width: 104px; height: 104px; border-radius: 22%; background: url({{ICON}}) center / cover; }
.name { margin-top: 34px; font: 500 98px/1 "Newsreader", serif; letter-spacing: -0.015em; }
.tagline { margin-top: 18px; font: 500 41px/1.15 "Newsreader", serif; white-space: nowrap; }
.facts { margin-top: 30px; font-size: 28px; color: #a2adb5; }
.phones { position: absolute; right: -64px; top: 36px; width: 640px; height: 640px; background: url({{PHONES}}) center / contain no-repeat; }
</style>
</head>
<body>
  <div class="plate"></div>
  <div class="words">
    <span class="icon"></span>
    <div class="name">Stan Scribe</div>
    <div class="tagline">Live captions for every voice.</div>
    <div class="facts">Offline · No account · iPhone and iPad</div>
  </div>
  <div class="phones"></div>
</body>
</html>
```

- [ ] **Step 6: Create `scripts/stanscribe-social.mjs`.**

```js
#!/usr/bin/env node
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// scripts/stanscribe-social.mjs
// Draws Stan Scribe's link-preview card (1200 x 630): fills scripts/stanscribe-social/card.html, photographs it
// in a headless Chromium browser, and writes public/images/stanscribe/stan-scribe-social.jpg.
// Run it after `npm run build` (it reads the page's fonts from out/) and again whenever the hero image changes:
//   npm run build:stanscribe-social
// Set CHROME_PATH if no Chromium browser is found. The JPEG is committed; the Netlify build does not run this.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public/images/stanscribe/stan-scribe-social.jpg');
const [WIDTH, HEIGHT] = [1200, 630];

const BROWSERS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

const dataUri = (file, mime) => `data:${mime};base64,${readFileSync(file).toString('base64')}`;

/** The latin woff2 the last build wrote for a font family, read from the build's own @font-face rules. */
function builtFont(family) {
  const chunks = join(ROOT, 'out/_next/static/chunks');
  if (!existsSync(chunks)) throw new Error('out/ is missing. Run `npm run build` first.');
  for (const file of readdirSync(chunks).filter((name) => name.endsWith('.css'))) {
    const css = readFileSync(join(chunks, file), 'utf8');
    for (const [, rule] of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
      // next/font writes one rule per subset; the latin one's range starts at U+0000-00FF, minified to U+??.
      if (!rule.includes(`font-family:${family}`) || !/unicode-range:U\+(\?\?|0000-00FF)/i.test(rule)) continue;
      const url = rule.match(/url\(([^)]+\.woff2)\)/)?.[1];
      if (url) return dataUri(join(chunks, url), 'font/woff2');
    }
  }
  throw new Error(`No built latin font for "${family}" in out/. Run \`npm run build\` first.`);
}

const browser = BROWSERS.find((candidate) => candidate && existsSync(candidate));
if (!browser) throw new Error('No Chromium browser found. Set CHROME_PATH to one.');

const fill = {
  NEWSREADER: builtFont('Newsreader'),
  HANKEN: builtFont('Hanken Grotesk'),
  ICON: dataUri(join(ROOT, 'public/images/stanscribe/app-icon.png'), 'image/png'),
  PHONES: dataUri(join(ROOT, 'public/images/stanscribe/hero-stan-scribe.webp'), 'image/webp'),
  PLATE: dataUri(join(ROOT, 'public/images/plates/interests_dark_plate.svg'), 'image/svg+xml'),
};
const template = readFileSync(join(ROOT, 'scripts/stanscribe-social/card.html'), 'utf8');
const html = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
  if (!(key in fill)) throw new Error(`card.html asks for {{${key}}}, which this script does not fill.`);
  return fill[key];
});

const work = mkdtempSync(join(tmpdir(), 'stanscribe-social-'));
const page = join(work, 'card.html');
const shot = join(work, 'card.png');
writeFileSync(page, html);

execFileSync(browser, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
  `--user-data-dir=${join(work, 'profile')}`, `--window-size=${WIDTH},${HEIGHT}`, '--virtual-time-budget=4000',
  `--screenshot=${shot}`, pathToFileURL(page).href,
], { stdio: 'ignore', timeout: 60_000 });

if (!existsSync(shot)) throw new Error(`${browser} wrote no screenshot.`);
await sharp(shot).resize(WIDTH, HEIGHT, { fit: 'cover', position: 'top' }).jpeg({ quality: 88, mozjpeg: true }).toFile(OUT);
const meta = await sharp(OUT).metadata();
if (meta.width !== WIDTH || meta.height !== HEIGHT) throw new Error(`The card is ${meta.width} x ${meta.height}, not ${WIDTH} x ${HEIGHT}.`);
console.log(`${OUT} (${WIDTH} x ${HEIGHT})`);
```

In `package.json`, add to `scripts` after `"build:plates"`:

```json
    "build:stanscribe-social": "node scripts/stanscribe-social.mjs"
```

(put a comma after the `build:plates` line).

- [ ] **Step 7: Draw the card.**

Run: `ls out/_next/static/chunks/*.css >/dev/null 2>&1 || npm run build; npm run build:stanscribe-social`
Expected: `.../public/images/stanscribe/stan-scribe-social.jpg (1200 x 630)`.

If the font lookup throws although `out/` exists, print one rule to see its shape and adjust the two tests in `builtFont` to match it:
`node -e "const fs=require('fs');const d='out/_next/static/chunks/';for(const f of fs.readdirSync(d).filter(n=>n.endsWith('.css'))){const m=fs.readFileSync(d+f,'utf8').match(/@font-face\s*\{[^}]*Newsreader[^}]*\}/);if(m){console.log(m[0].slice(0,400));break}}"`

If the browser writes no screenshot, run the same `execFileSync` arguments by hand in the shell without `stdio: 'ignore'` and read the error.

- [ ] **Step 8: Look at the card.** Open `public/images/stanscribe/stan-scribe-social.jpg` with the Read tool. Check: the name does not touch the phones, the tagline is on one line, the text is in Newsreader and Hanken (not Times or Helvetica), nothing is italic, the contours are faint. Fix the template's numbers and rerun if any check fails.

- [ ] **Step 9: Run the tests.**

Run: `npx jest --ci __tests__/stanscribe/metadata.test.tsx __tests__/stanscribe/lib.test.ts`
Expected: PASS (the card is still 1200 x 630 at the same address).

- [ ] **Step 10: Commit.**

```bash
git add scripts/stanscribe-social.mjs scripts/stanscribe-social/card.html __tests__/stanscribe/metadata.test.tsx
git commit -m "feat(stanscribe): a new share card drawn by a script, the site named Stan Scribe in previews, and the app's own tab icon" -- scripts/stanscribe-social.mjs scripts/stanscribe-social/card.html package.json public/images/stanscribe/stan-scribe-social.jpg app/layout.tsx "app/(stanscribe)/layout.tsx" components/stanscribe/LegalPage.tsx __tests__/stanscribe/metadata.test.tsx
```

---

### Task 9: The Stan Scribe line on devinhunt.com

**Goal:** The `stan-scribe` entry's `summary` is line X.

**Files:**
- Modify: `lib/portfolio-data.ts` (the `stan-scribe` entry, about line 300)
- Test: `__tests__/site/work.test.ts`

**Acceptance Criteria:**
- [ ] `summary` is exactly: `An iPhone and iPad app I built for my grandpa Stan, who is hard of hearing: live captions of the conversation at the table, a color for each speaker, with no internet and no subscription.`
- [ ] The entry's `content`, `meta`, `readout` and `href` are unchanged.

**Verify:** `npx jest --ci __tests__/site/work.test.ts __tests__/site/HomePage.test.tsx` → all pass

**Steps:**

- [ ] **Step 1: Write the failing test.** In `__tests__/site/work.test.ts`, find the line `expect(findCopyViolations([stan.summary, ...stan.content].join(' '))).toEqual([]);` and add directly above it:

```ts
  expect(stan.summary).toBe(
    'An iPhone and iPad app I built for my grandpa Stan, who is hard of hearing: live captions of the conversation at the table, a color for each speaker, with no internet and no subscription.',
  );
```

- [ ] **Step 2: Run it and watch it fail.**

Run: `npx jest --ci __tests__/site/work.test.ts`
Expected: FAIL, received "Live captions in color, built for my grandpa, ...".

- [ ] **Step 3: Change the line.** In `lib/portfolio-data.ts`, in the entry with `id: 'stan-scribe'`, replace the `summary` line with:

```ts
    summary: 'An iPhone and iPad app I built for my grandpa Stan, who is hard of hearing: live captions of the conversation at the table, a color for each speaker, with no internet and no subscription.',
```

- [ ] **Step 4: Run the tests.**

Run: `npx jest --ci __tests__/site/work.test.ts __tests__/site/HomePage.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git commit -m "content(site): the Stan Scribe line says what the app is, who it is for and what sets it apart" -- lib/portfolio-data.ts __tests__/site/work.test.ts
```

---

### Task 10: Keep the scroll trace harness

**Goal:** `scripts/scroll-trace.mjs` scrolls a page with real wheel input in a headed Chromium browser and prints, per run, the frames presented and dropped.

**Files:**
- Create: `scripts/scroll-trace.mjs`

**Acceptance Criteria:**
- [ ] `node scripts/scroll-trace.mjs https://stanscribe.devinhunt.com/ 1 shipped` prints one `env` line and one JSON line whose `scrolled` equals its `distance` and whose `presented` is greater than 300.
- [ ] The script exits and closes the browser it opened.
- [ ] With no arguments it prints a usage line and exits with code 2.

**Verify:** `node scripts/scroll-trace.mjs https://stanscribe.devinhunt.com/ 1 shipped` → an `env` line, then one JSON line with `"scrolled"` equal to `"distance"`

**Steps:**

- [ ] **Step 1: Create `scripts/scroll-trace.mjs`.**

```js
#!/usr/bin/env node
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// scripts/scroll-trace.mjs
// Scrolls a page with real wheel input in a headed Chromium browser and reads the trace for what the
// compositor did: frames presented, frames dropped, blank tiles. It sees work on the GPU side as well as on
// the main thread, which a requestAnimationFrame timer does not.
//
//   node scripts/scroll-trace.mjs <url> <rounds> <variant,variant,...> [--big] [--light]
//
// Variants are CSS injected into the live page, so one page load compares several states, interleaved:
//   shipped   the page as served
//   noGlow    the animated glow hidden
//   noVeil    the page-coloured veil over the contours hidden
//   noPlate   no contours at all
// --big emulates a 2560 x 1440 window at 2x. --light asks for the day theme.
// Run at least five rounds a side before calling two states different, and report the range.
// Set CHROME_PATH if no Chromium browser is found. The browser uses a temporary profile and is closed at the end.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, roundsArg, variantsArg, ...flags] = process.argv.slice(2);
if (!url || !roundsArg || !variantsArg) {
  console.error('usage: node scripts/scroll-trace.mjs <url> <rounds> <variant,variant,...> [--big] [--light]');
  process.exit(2);
}
const rounds = Number(roundsArg);
const PORT = 9337;

const VARIANTS = {
  shipped: '',
  noGlow: '[data-contour-plate] svg { display: none !important; }',
  noVeil: '.bg-background.fixed { display: none !important; }',
  noPlate: '[data-contour-plate] { display: none !important; } .bg-background.fixed { display: none !important; }',
};
const variants = variantsArg.split(',');
for (const variant of variants) if (!(variant in VARIANTS)) throw new Error(`unknown variant "${variant}". Known: ${Object.keys(VARIANTS).join(', ')}`);

const BROWSERS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
];
const browser = BROWSERS.find((candidate) => candidate && existsSync(candidate));
if (!browser) throw new Error('No Chromium browser found. Set CHROME_PATH to one.');

const profile = mkdtempSync(join(tmpdir(), 'scroll-trace-'));
const chrome = spawn(browser, [
  `--user-data-dir=${profile}`, `--remote-debugging-port=${PORT}`, '--no-first-run', '--no-default-browser-check',
  '--window-size=1728,960', '--window-position=0,0', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
  'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function pageSocket() {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = targets.find((target) => target.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // The browser is still starting.
    }
    await sleep(200);
  }
  throw new Error('The browser did not start.');
}

const ws = new WebSocket(await pageSocket());
await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
let nextId = 0;
const pending = new Map();
let onEvent = () => {};
ws.addEventListener('message', (message) => {
  const msg = JSON.parse(message.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
  } else onEvent(msg);
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    pending.set(++nextId, { resolve, reject });
    ws.send(JSON.stringify({ id: nextId, method, params }));
  });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;

const CATEGORIES = ['benchmark', 'cc', 'gpu', 'viz', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame', 'devtools.timeline'];

function analyze(events) {
  // One PipelineReporter per frame the compositor meant to produce; its state says whether it reached the screen.
  const frames = events.filter((event) => event.name === 'PipelineReporter' && event.ph === 'b').map((event) => event.args?.frame_reporter ?? {});
  const state = (name) => frames.filter((frame) => frame.state === name).length;
  const sumMs = (name) => Math.round(events.filter((event) => event.name === name && event.ph === 'X').reduce((total, event) => total + (event.dur ?? 0), 0) / 1000);
  return {
    presented: events.filter((event) => event.name === 'DrawFrame').length,
    droppedEvents: events.filter((event) => event.name === 'DroppedFrame').length,
    reporterDropped: state('STATE_DROPPED'),
    notNeeded: state('STATE_NO_UPDATE_DESIRED'),
    blankTiles: frames.filter((frame) => frame.has_missing_content || frame.checkerboarded_needs_raster || frame.checkerboarded_needs_record).length,
    rasterMs: sumMs('RasterTask'),
    gpuTaskMs: sumMs('GPUTask'),
  };
}

try {
  await send('Page.enable');
  if (flags.includes('--big')) await send('Emulation.setDeviceMetricsOverride', { width: 2560, height: 1440, deviceScaleFactor: 2, mobile: false });
  if (flags.includes('--light')) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await send('Page.navigate', { url });
  await sleep(9000); // load, the plate's fade-in, and the glow's 2 s delay plus its fetch
  const env = JSON.parse(await evaluate(`JSON.stringify({ w: innerWidth, h: innerHeight, dpr: devicePixelRatio, pageH: document.documentElement.scrollHeight, dark: document.documentElement.classList.contains('dark'), glow: !!document.querySelector('[data-contour-plate] svg'), visible: document.visibilityState })`));
  console.log('env', JSON.stringify(env));
  await evaluate(`(() => { const style = document.createElement('style'); style.id = 'scroll-trace'; document.head.appendChild(style); })()`);

  for (let round = 0; round < rounds; round++) {
    for (const variant of variants) {
      await evaluate(`document.getElementById('scroll-trace').textContent = ${JSON.stringify(VARIANTS[variant])}; window.scrollTo(0, 0); 1`);
      await sleep(1500);
      const events = [];
      const complete = new Promise((resolve) => {
        onEvent = (msg) => {
          if (msg.method === 'Tracing.dataCollected') events.push(...msg.params.value);
          if (msg.method === 'Tracing.tracingComplete') resolve();
        };
      });
      await send('Tracing.start', { transferMode: 'ReportEvents', traceConfig: { includedCategories: CATEGORIES } });
      const distance = env.pageH - env.h - 40;
      const started = Date.now();
      await send('Input.synthesizeScrollGesture', { x: 800, y: 500, yDistance: -distance, speed: 1500, gestureSourceType: 'mouse' });
      const scrollMs = Date.now() - started;
      await send('Tracing.end');
      await complete;
      const scrolled = await evaluate('Math.round(scrollY)');
      console.log(JSON.stringify({ variant, round, scrollMs, distance, scrolled, ...analyze(events) }));
    }
  }
} finally {
  ws.close();
  chrome.kill();
}
```

- [ ] **Step 2: Check the usage line.**

Run: `node scripts/scroll-trace.mjs; echo "exit $?"`
Expected: the usage line, then `exit 2`.

- [ ] **Step 3: Run it once against the live page.** A browser window opens on the screen for about 20 seconds and closes.

Run: `node scripts/scroll-trace.mjs https://stanscribe.devinhunt.com/ 1 shipped`
Expected: an `env` line with `"visible":"visible"`, then one JSON line where `scrolled` equals `distance` and `presented` is above 300.

- [ ] **Step 4: Commit.**

```bash
git add scripts/scroll-trace.mjs
git commit -m "chore(stanscribe): keep the scroll trace harness, so the frame counts can be measured again" -- scripts/scroll-trace.mjs
```

---

### Task 11: The screenshot request in the app repo

**Goal:** `transcript_stan` holds a request for new screenshots with a script for each image, committed on its `main` branch and not pushed.

**Files:**
- Create: `/Users/dhunt/dev/transcript_stan/docs/marketing/stanscribe-page/screenshot-request.md`

**Acceptance Criteria:**
- [ ] The file exists with the content below, word for word.
- [ ] It is committed in `transcript_stan` on `main` with only that file in the commit.
- [ ] Nothing is pushed, and nothing else in that repo changes.

**Verify:** `git -C /Users/dhunt/dev/transcript_stan log -1 --stat --format=%s` → the commit subject below and one file changed

**Steps:**

- [ ] **Step 1: Check the app repo is clean and on `main`.**

Run: `git -C /Users/dhunt/dev/transcript_stan status --short; git -C /Users/dhunt/dev/transcript_stan branch --show-current`
Expected: no output from `status`, then `main`. If there are uncommitted changes, stop and report them. Do not stash or discard anything.

- [ ] **Step 2: Write the file** `/Users/dhunt/dev/transcript_stan/docs/marketing/stanscribe-page/screenshot-request.md` with this content:

```markdown
# Screenshot request from the website, 2026-11-12

From the session that builds `stanscribe.devinhunt.com` (repo `dth_portfolio_v3`), for the app session.

## What the owner asked for

The page's screenshots show the built-in demo, a conversation about packing a car. The owner wants each
image's words to fit the section of the page it sits in. The page is now laid out as an extension of the
App Store listing (that repo's `docs/superpowers/specs/2026-11-12-stanscribe-listing-design.md`).

The website cannot make these images. The debug builds draw the demo from scripts in
`App/StanScribe/SessionController.swift` (`-demoTranscript`), and `build/marketing/stanscribe-page/shots.sh`
and `frame.py` photograph and frame them. So this is a request for a new demo script and a new set of
shots.

## One rule for every script

The speakers talk about dinner, plans and each other. They never talk about the app. A line such as "This
app is a relationship saver" printed in a screenshot is a testimonial from a person who does not exist,
and the website's product rules forbid invented testimonials. The App Store text rules in
`docs/release/app-store-metadata.md` and `README.md` beside this file still apply: no prices, no model
names, and nothing medical.

The names are the ones the demo already uses: Alex, Rosa, and "Person 3" for a speaker nobody has named.

## The conversation

The website's caption demo plays the first three lines. The screenshots continue it for a full screen.

| Speaker | Words |
|---|---|
| Alex | Are we still on for Saturday? |
| Rosa | Yes. Come at six, and bring the salad. |
| Person 3 | I will bring dessert. |
| Alex | The lemon one from last time? |
| Person 3 | The lemon one. I already bought the lemons. |
| Rosa | Then I will set the long table outside. |
| Alex | Is there room for the cousins? |
| Rosa | Plenty. Tell them to come hungry. |
| Person 3 | And tell them six means six. |

## The images

Same file names and same pixel sizes as today, so each new image replaces the old one with no code change
on the website. Keep the bottom bar (Smaller, Larger, Save, Stop) in every live shot.

| File | Where the website shows it | What to shoot |
|---|---|---|
| `hero-stan-scribe.webp` (1800 x 1795) | The hero of the main page, and the share card | Three phones as today (the Stan painting, Graphite in front, Betty), with the conversation above, Alex and Rosa named. |
| `both-apps.webp` (1600 x 1690) | Not on the page today; kept for the App Store | Stan Scribe (Graphite) beside Light (White), the same conversation. |
| `light-black-and-white.webp` (1600 x 1690) | The hero of the Light page | Light on Black and on White, the same conversation. |
| `stan-scribe-live-graphite.webp` (900 x 1679) | Features, under "Speakers in color" | The conversation with all three speakers on screen, two of them named. |
| `stan-scribe-live-large.webp` (900 x 1679) | Features, under "Text as big as you need" | The largest text size, two short lines: "Dinner is ready." and "Come and sit down." |
| `stan-scribe-painted-themes.webp` (2000 x 1411) | Features, under "Something you use every day should not look clinical." | The five painted themes in a fan as today, with the conversation. |
| `stan-scribe-conversation.webp`, `stan-scribe-library.webp`, `stan-scribe-languages.webp` | Features | No change. Each already shows its feature. |

## When they are ready

Put the new `.webp` files in `docs/marketing/stanscribe-page/mockups/` and tell the owner. The website
session then copies them into `public/images/stanscribe/`, checks each image's alt text in
`lib/stanscribe.ts` against what the image shows, and runs `npm run build:stanscribe-social` to redraw the
share card from the new hero.

## Open for the owner

The scripts above are a draft by the website session. The owner has approved the first three lines (the
caption demo) and has not read the other six.
```

- [ ] **Step 3: Check the words against the rules.** The request quotes one banned line as an example of what not to write, so check only the conversation table.

Run: `sed -n '/^## The conversation/,/^## The images/p' /Users/dhunt/dev/transcript_stan/docs/marketing/stanscribe-page/screenshot-request.md | grep -n -i -E 'app|whisper|transcri|\$|subscription' || echo "the conversation follows the rules"`
Expected: `the conversation follows the rules`.

- [ ] **Step 4: Commit in the app repo. Do not push.**

```bash
git -C /Users/dhunt/dev/transcript_stan add -f docs/marketing/stanscribe-page/screenshot-request.md
git -C /Users/dhunt/dev/transcript_stan commit -m "docs: a request for screenshots whose words fit each section of the website, because the owner asked for scripted shots and only this repo can make them (2026-11-12)" -- docs/marketing/stanscribe-page/screenshot-request.md
```

---

### Task 12: Record the change in DESIGN.md and the October spec

**Goal:** `DESIGN.md` and the October spec describe the pages as they now are and point at the new spec.

**Files:**
- Modify: `DESIGN.md` (the Scope paragraph near line 105; the component table rows for `app/globals.css` and "Stan Scribe pages and components"; the inspector rows near line 405)
- Modify: `docs/superpowers/specs/2026-10-23-stanscribe-page-design.md` (append one section)

**Acceptance Criteria:**
- [ ] `DESIGN.md` Scope says: since 2026-11-12 each page is a hero on the contours, then one full-width, slightly see-through card whose bands blend over 80px; the side fades and masks are gone.
- [ ] `DESIGN.md` names `Disclosure`, `IconTile`, `AppIcon`, `CaptionDemo`, `icons.tsx` and `scripts/stanscribe-social.mjs`, and says the `quiet` veil is 40%.
- [ ] The inspector row for `gradient` says the blends are top-to-bottom only, with no side fade.
- [ ] The October spec ends with a section that points at `2026-11-12-stanscribe-listing-design.md` and lists what it replaces.
- [ ] No em dashes in the added text. Sentence-case headings. Plain words.

**Verify:** `grep -c "2026-11-12-stanscribe-listing-design.md" DESIGN.md docs/superpowers/specs/2026-10-23-stanscribe-page-design.md` → at least 1 for each file

**Steps:**

- [ ] **Step 1: Read what is there.** Read `DESIGN.md` lines 100 to 115 and 385 to 410, and the last section of the October spec ("Bands in place of the sheet (2026-11-12)"). Load the `unslop` skill before writing.

- [ ] **Step 2: Update the Scope paragraph in `DESIGN.md`.** Find the sentence that begins `Since 2026-11-12 each` and runs to the end of that paragraph. Replace it with:

```markdown
Since 2026-11-12 each page is a hero on the contours, then one card the full width of the window (`BANDS`,
`BAND` and `BAND_COLUMN` in `components/stanscribe/Section.tsx`; `.bands` in `globals.css`). The card is
slightly see-through, as the portfolio's band is, and its sections take turns between two tones, each
blending in from the tone above it over 80px. The bands that faded out at the sides, built that morning
with masks, are gone. The pages read as an extension of the App Store listing: an icon, a name and one
line where there were paragraphs, and Privacy and Questions as rows that open on a click. The spec is
`docs/superpowers/specs/2026-11-12-stanscribe-listing-design.md`.
```

- [ ] **Step 3: Update the component table in `DESIGN.md`.** In the row that begins `| Stan Scribe pages and components |`, replace the cell's text with:

```markdown
Their own system (Scope). `Section.tsx` exports `BANDS`, `BAND`, `BAND_COLUMN`, `COLUMN` and `INTRO`, and `Section` takes a `className` for a band under a picture that hangs into it. `Disclosure` is a native `<details>` row: a label that is always visible, an optional `IconTile`, and words that show on a click. `IconTile` is a 48px tile for one icon; `icons.tsx` is the one file that names Lucide icons (the app's SF Symbols are not licensed for websites). `AppIcon` shows an app's own icon as decoration. `CaptionDemo` plays a short scripted conversation once when scrolled into view, by changing word opacity only, with a Pause button, and shows it whole under reduced motion. `ComparisonTable` has a frame, a filled header row and a rule beside each app's column. `DownloadBlock` has no box. `ContourBackdrop`'s `quiet` veil is 40%, the lightest that keeps a link over a contour line at 7:1. `scripts/stanscribe-social.mjs` draws the share card.
```

In the row that begins `| \`app/globals.css\` |`, change the words `\`.panel\` stays for the Stan Scribe sheet` to `\`.panel\` is unused since the Stan Scribe sheet went`.

- [ ] **Step 4: Update the inspector rows in `DESIGN.md`.** Replace the row that begins `| Inspector \`gradient\` (FAIL) | Stan Scribe pages |` with:

```markdown
| Inspector `gradient` (FAIL) | Stan Scribe pages | The owner's choice, 2026-11-12: each band blends in from the tone above it over 80px, top to bottom, so sections read as separate without a line. There is no side fade since the full-width card. Both ends of every blend are tones that body text clears at 7:1, over a contour line too (`palette.test.ts`). The portfolio keeps its no-gradient rule. |
```

In the row that begins `| Inspector \`hairline\` (WARN) | Stan Scribe pages |`, replace the cell's text with:

```markdown
The rules are the rows of real lists and a real table: between the rows that open in Privacy and Questions, in the comparison table, and above the legal fine print.
```

- [ ] **Step 5: Append to the October spec.** Add at the end of `docs/superpowers/specs/2026-10-23-stanscribe-page-design.md`:

```markdown

## The listing-style page (2026-11-12)

The owner asked for the pages to read as an extension of the App Store listing, and for one full-width
card in place of the bands with faded sides. `2026-11-12-stanscribe-listing-design.md` is the spec. It
replaces these parts of this file:

- "Bands in place of the sheet (2026-11-12)": the bands are plain see-through backgrounds on one card,
  with no masks and no side fades.
- The section list under "`/stanscribe/` sections" and the layout notes after it: the order is hero, How
  it works, the story, Features, Privacy, the comparison, Questions and answers, Help.
- "every answer open" under "Questions and answers, with structured data": each question is a row that
  opens, and only the accuracy answer starts open.
- "Visible: 'captions can be wrong' (FAQ, always open) and 'Ask before you caption people'": the first
  is in the answer that starts open, and the second is the label of a Privacy row.

The copy rules, the required links and the accessibility rules in this file all stand.
```

- [ ] **Step 6: Check and commit.**

Run: `grep -c "2026-11-12-stanscribe-listing-design.md" DESIGN.md docs/superpowers/specs/2026-10-23-stanscribe-page-design.md; git diff -U0 DESIGN.md docs/superpowers/specs/2026-10-23-stanscribe-page-design.md | grep '^+' | grep -c '—'`
Expected: a count of 1 or more for each file, then `0`.

```bash
git add -f DESIGN.md docs/superpowers/specs/2026-10-23-stanscribe-page-design.md
git commit -m "docs: the Stan Scribe pages as a listing-style page on one full-width card" -- DESIGN.md docs/superpowers/specs/2026-10-23-stanscribe-page-design.md
```

---

### Task 13: Verify the whole change

**Goal:** The full suite and the build pass, the built pages carry the right tags, and both pages look right at 1440 and 390 wide in both themes.

**Files:**
- No source changes expected. Fix what the checks find, in the file that owns it.

**Acceptance Criteria:**
- [ ] `npx jest --ci` passes with no failing suite.
- [ ] `npm run build` exits 0.
- [ ] `out/stanscribe/index.html` contains `og:site_name" content="Stan Scribe"`, `app-icon-32.png`, `Live captions for every voice.` and no `favicon.svg`; `out/index.html` contains `favicon.svg` and no `app-icon-32.png`.
- [ ] Screenshots of `/stanscribe/` and `/stanscribe-light/` at 1440 and 390 wide, in the day and night themes, show: the hero on the contours, the picture across the card's edge, no sideways scroll, readable rows, the framed table.
- [ ] At 320px wide neither page scrolls sideways.
- [ ] The scroll trace shows the new build presents no fewer frames than the live page, five rounds a side.

**Verify:** `npx jest --ci && npm run build && grep -c 'og:site_name" content="Stan Scribe"' out/stanscribe/index.html` → jest green, build exit 0, count 1

**Steps:**

- [ ] **Step 1: Run the whole suite.**

Run: `npx jest --ci 2>&1 | tail -15`
Expected: every suite passes.

- [ ] **Step 2: Build.**

Run: `npm run build 2>&1 | tail -15`
Expected: exit 0. `next build` type-checks every file, tests included.

- [ ] **Step 3: Read the built tags.**

Run:
```bash
grep -c 'og:site_name" content="Stan Scribe"' out/stanscribe/index.html out/stanscribe-light/index.html out/stanscribe/privacy/index.html
grep -o '<link rel="[a-z-]*icon"[^>]*>' out/stanscribe/index.html out/index.html
grep -c 'Live captions for every voice.' out/stanscribe/index.html
```
Expected: 1 for each of the three pages; the Stan Scribe page links `app-icon-32.png` and `app-icon-180.png` only; `out/index.html` links `favicon.svg` only; the tagline count is 1 or more.

- [ ] **Step 4: Redraw the share card from this build's fonts.**

Run: `npm run build:stanscribe-social && git status --short public/images/stanscribe/stan-scribe-social.jpg`
If the JPEG changed, look at it with the Read tool and commit it: `git commit -m "chore(stanscribe): redraw the share card from the final build" -- public/images/stanscribe/stan-scribe-social.jpg`.

- [ ] **Step 5: Photograph the pages.** Serve `out/` and run the render check at both widths, in both themes.

Run:
```bash
(cd out && python3 -m http.server 4173 >/dev/null 2>&1 &) ; sleep 1
node .claude/skills/design-taste-frontend/scripts/inspect.mjs http://localhost:4173/stanscribe/ --out /tmp/claude-inspect/scribe --widths 1440,390,320
node .claude/skills/design-taste-frontend/scripts/inspect.mjs http://localhost:4173/stanscribe-light/ --out /tmp/claude-inspect/light --widths 1440,390,320
```
Use the session's scratchpad directory in place of `/tmp/claude-inspect`. Read every screenshot the tool lists. The inspector follows the system theme; to see the other theme, open the pages in the browser with the theme toggle, or rerun with the system theme switched. Known inspector findings that stand are listed in `DESIGN.md` (gradient, hairline, first-action, no-footage).

Check by eye: the hero's words read over the contours; the phones sit across the card's top edge and are not painted over; the four facts wrap cleanly at 390; the steps and the demo stack on a phone; the five screens are a grid; the table's columns are plain; every row opens; nothing scrolls sideways at 320.

- [ ] **Step 6: Check the rows and the demo with the keyboard.** In a browser at `http://localhost:4173/stanscribe/`: Tab to a Privacy row and press Enter and Space (it opens and closes); Tab to the demo's button and press Enter (Pause, Play, Play again).

- [ ] **Step 7: Trace the scroll, new build against the live page.** Follow the `benchmark-checklist` skill. The claim to test: "the new build presents no fewer frames than the live page".

Run:
```bash
uptime
for i in 1 2 3 4 5; do
  node scripts/scroll-trace.mjs http://localhost:4173/stanscribe/ 1 shipped | tail -1
  node scripts/scroll-trace.mjs https://stanscribe.devinhunt.com/ 1 shipped | tail -1
done
```
Report the median and range of `presented` per side, with `scrolled` equal to `distance` in every run. The pages differ in length, so compare frames per second (`presented / scrollMs * 1000`), not raw counts. Say plainly that the slowness the owner reported was not reproduced, so this shows "no slower", not "fixed".

- [ ] **Step 8: Stop the server.**

Run: `pkill -f "http.server 4173"`
