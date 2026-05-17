# Inline Animated SVG Contour Background — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the SMIL glow animation in `american_river_contour_bwn.svg` actually run on the home and interests pages (light mode) by embedding it via `<object>`, while every other page/theme keeps its current static behavior.

**Architecture:** New `AnimatedContourBackground` component renders an `<object>` embed of the animated SVG when (mounted ∧ light ∧ no reduced-motion ∧ an animated src is provided); otherwise it delegates to the unchanged `PageBackground` (which also serves as the load-time underlay). `useThemeBackground` gets one additive field exposing the animated asset path.

**Tech Stack:** Next.js 16 (App Router), React, TypeScript, next-themes, Tailwind, Jest 29 + @testing-library/react 14 (config to be created — none exists yet).

---

### Task 0: Set up Jest + React Testing Library infrastructure

**Goal:** Establish a working Jest + RTL test environment (none currently exists despite deps being installed) so subsequent tasks can be TDD'd.

**Files:**
- Create: `jest.config.js`
- Create: `jest.setup.js`
- Create: `__tests__/smoke.test.tsx`

**Acceptance Criteria:**
- [ ] `npm test` runs Jest with the jsdom environment and the `@/` path alias resolving to repo root
- [ ] The smoke test passes
- [ ] `@testing-library/jest-dom` matchers (e.g. `toBeInTheDocument`) are available

**Verify:** `npm test -- __tests__/smoke.test.tsx` → 1 passing test

**Steps:**

- [ ] **Step 1: Write the failing smoke test**

`__tests__/smoke.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';

function Hello() {
  return <div>hello-jest</div>;
}

test('jest + RTL + jest-dom are wired up', () => {
  render(<Hello />);
  expect(screen.getByText('hello-jest')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/smoke.test.tsx`
Expected: FAIL — no Jest config / `toBeInTheDocument` is not a function.

- [ ] **Step 3: Create Jest config using next/jest**

`jest.config.js`:
```js
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/out/'],
};

module.exports = createJestConfig(customJestConfig);
```

- [ ] **Step 4: Create Jest setup file**

`jest.setup.js`:
```js
require('@testing-library/jest-dom');
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- __tests__/smoke.test.tsx`
Expected: PASS — 1 test passing.

- [ ] **Step 6: Commit**

```bash
git add -f jest.config.js jest.setup.js __tests__/smoke.test.tsx
git commit -m "test: set up Jest + React Testing Library infrastructure

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

Note: `git add -f` because `.gitignore` has a blanket rule that may match some paths; verify with `git status` that the files are staged.

---

### Task 1: Expose animated SVG source from useThemeBackground

**Goal:** Add an additive `animatedLightSrc` field to the theme-background hook so callers can pass the animated asset path down without changing any existing return field or behavior.

**Files:**
- Modify: `hooks/useThemeBackground.ts`
- Test: `__tests__/useThemeBackground.test.tsx`

**Acceptance Criteria:**
- [ ] `useAmericanRiverBackground()` result includes `animatedLightSrc === '/images/american_river_contour_bwn.svg'`
- [ ] `useUpperFolsomBackground()` result has `animatedLightSrc === undefined`
- [ ] All previously returned fields (`mounted`, `isMobile`, `resolvedTheme`, `backgroundImage`, `isDark`) are unchanged in name and meaning

**Verify:** `npm test -- __tests__/useThemeBackground.test.tsx` → all passing

**Steps:**

- [ ] **Step 1: Write the failing test**

`__tests__/useThemeBackground.test.tsx`:
```tsx
import { renderHook } from '@testing-library/react';
import { useAmericanRiverBackground, useUpperFolsomBackground } from '@/hooks/useThemeBackground';

jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}));

test('americanRiver exposes the animated light src', () => {
  const { result } = renderHook(() => useAmericanRiverBackground());
  expect(result.current.animatedLightSrc).toBe('/images/american_river_contour_bwn.svg');
});

test('upperFolsom has no animated light src', () => {
  const { result } = renderHook(() => useUpperFolsomBackground());
  expect(result.current.animatedLightSrc).toBeUndefined();
});

test('existing fields still present', () => {
  const { result } = renderHook(() => useAmericanRiverBackground());
  expect(result.current).toEqual(
    expect.objectContaining({
      mounted: expect.any(Boolean),
      isMobile: expect.any(Boolean),
      backgroundImage: expect.any(String),
      isDark: expect.any(Boolean),
    }),
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/useThemeBackground.test.tsx`
Expected: FAIL — `animatedLightSrc` is undefined for americanRiver.

- [ ] **Step 3: Modify the hook**

In `hooks/useThemeBackground.ts`:

Add `animatedLightImage` to the americanRiver preset only:
```ts
export const BACKGROUND_PRESETS = {
  americanRiver: {
    lightImage: '/images/american_river_contour_bwn.svg',
    darkImage: '/images/american_river_contour_dark.svg',
    animatedLightImage: '/images/american_river_contour_bwn.svg',
  },
  upperFolsom: {
    lightImage: '/images/upper_folsom_contour_bwn.svg',
    darkImage: '/images/upper_folsom_contour_dark.svg',
  },
} as const;
```

Add `animatedLightSrc?: string;` to the `ThemeBackgroundResult` interface, and accept an optional `animatedLightImage` on `ThemeBackgroundOptions`:
```ts
interface ThemeBackgroundOptions {
  lightImage: string;
  darkImage: string;
  animatedLightImage?: string;
  mobileBreakpoint?: number;
}

interface ThemeBackgroundResult {
  mounted: boolean;
  isMobile: boolean;
  resolvedTheme: string | undefined;
  backgroundImage: string;
  isDark: boolean;
  animatedLightSrc?: string;
}
```

Return it from `useThemeBackground` (add to the returned object):
```ts
  return {
    mounted,
    isMobile,
    resolvedTheme,
    backgroundImage,
    isDark,
    animatedLightSrc: options.animatedLightImage,
  };
```

`useAmericanRiverBackground` / `useUpperFolsomBackground` already spread the preset into `useThemeBackground(BACKGROUND_PRESETS.x)`, so `animatedLightImage` flows through automatically — no change to those convenience functions.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- __tests__/useThemeBackground.test.tsx`
Expected: PASS — all 3 tests.

- [ ] **Step 5: Commit**

```bash
git add -f hooks/useThemeBackground.ts __tests__/useThemeBackground.test.tsx
git commit -m "feat: expose animatedLightSrc from useThemeBackground (additive)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Create AnimatedContourBackground component

**Goal:** A component that renders the animated `<object>` embed only when it should, and otherwise renders the unchanged `PageBackground`; the static `PageBackground` also acts as the load-time underlay so there is never a blank flash.

**Files:**
- Create: `components/ui/AnimatedContourBackground.tsx`
- Test: `__tests__/AnimatedContourBackground.test.tsx`

**Acceptance Criteria:**
- [ ] When `mounted && !isDark && animatedSrc` and reduced-motion is OFF: renders an `<object>` with `data` equal to `animatedSrc` AND the static `PageBackground` underlay
- [ ] When `isDark`: renders only `PageBackground`, no `<object>`
- [ ] When `mounted === false`: renders only `PageBackground`, no `<object>`
- [ ] When `animatedSrc` is undefined: renders only `PageBackground`, no `<object>`
- [ ] When `prefers-reduced-motion: reduce` matches: renders only `PageBackground`, no `<object>`
- [ ] After the `<object>` fires `onLoad`, the static underlay is removed from the DOM (no doubled opacity)
- [ ] `<object>` is non-interactive: has `aria-hidden`, `tabIndex={-1}`; container has `pointer-events:none`

**Verify:** `npm test -- __tests__/AnimatedContourBackground.test.tsx` → all passing

**Steps:**

- [ ] **Step 1: Write the failing tests**

`__tests__/AnimatedContourBackground.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AnimatedContourBackground } from '@/components/ui/AnimatedContourBackground';

function setReducedMotion(matches: boolean) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

const base = {
  backgroundImage: 'url(/images/american_river_contour_bwn.svg)',
  isMobile: false,
  animatedSrc: '/images/american_river_contour_bwn.svg',
};

beforeEach(() => setReducedMotion(false));

test('renders object + underlay when light, mounted, motion ok', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} isDark={false} mounted={true} />,
  );
  const obj = container.querySelector('object');
  expect(obj).toBeInTheDocument();
  expect(obj).toHaveAttribute('data', '/images/american_river_contour_bwn.svg');
  expect(obj).toHaveAttribute('aria-hidden', 'true');
  expect(obj).toHaveAttribute('tabindex', '-1');
});

test('no object in dark mode', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} isDark={true} mounted={true} />,
  );
  expect(container.querySelector('object')).not.toBeInTheDocument();
});

test('no object before mount', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} isDark={false} mounted={false} />,
  );
  expect(container.querySelector('object')).not.toBeInTheDocument();
});

test('no object when animatedSrc missing', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} animatedSrc={undefined} isDark={false} mounted={true} />,
  );
  expect(container.querySelector('object')).not.toBeInTheDocument();
});

test('no object when reduced motion preferred', () => {
  setReducedMotion(true);
  const { container } = render(
    <AnimatedContourBackground {...base} isDark={false} mounted={true} />,
  );
  expect(container.querySelector('object')).not.toBeInTheDocument();
});

test('underlay removed after object load', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} isDark={false} mounted={true} />,
  );
  expect(container.querySelectorAll('[data-bg-underlay]').length).toBe(1);
  fireEvent.load(container.querySelector('object')!);
  expect(container.querySelectorAll('[data-bg-underlay]').length).toBe(0);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- __tests__/AnimatedContourBackground.test.tsx`
Expected: FAIL — module `AnimatedContourBackground` not found.

- [ ] **Step 3: Implement the component**

`components/ui/AnimatedContourBackground.tsx`:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { PageBackground } from '@/components/ui/PageBackground';

interface AnimatedContourBackgroundProps {
  backgroundImage: string;
  isMobile: boolean;
  isDark: boolean;
  mounted: boolean;
  /** Path to the SMIL-animated SVG. If absent, always renders the static PageBackground. */
  animatedSrc?: string;
  /** Passthrough to the static PageBackground fallback. */
  dualBackground?: boolean;
}

/**
 * Renders the SMIL-animated contour SVG via <object> when it is safe and
 * appropriate to animate; otherwise (and while the SVG loads) falls back to
 * the unchanged static PageBackground.
 */
export function AnimatedContourBackground({
  backgroundImage,
  isMobile,
  isDark,
  mounted,
  animatedSrc,
  dualBackground = false,
}: AnimatedContourBackgroundProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const shouldAnimate = mounted && !isDark && !reducedMotion && !!animatedSrc;

  const staticUnderlay = (
    <div data-bg-underlay>
      <PageBackground
        backgroundImage={backgroundImage}
        isMobile={isMobile}
        dualBackground={dualBackground}
      />
    </div>
  );

  if (!shouldAnimate) {
    return staticUnderlay;
  }

  return (
    <>
      {!loaded && staticUnderlay}
      <div
        className="absolute -top-[200px] -bottom-[200px] left-0 right-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="w-full h-full opacity-10">
          <object
            type="image/svg+xml"
            data={animatedSrc}
            aria-hidden="true"
            tabIndex={-1}
            onLoad={() => setLoaded(true)}
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: isMobile ? '250%' : '100%',
              height: 'auto',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- __tests__/AnimatedContourBackground.test.tsx`
Expected: PASS — all 6 tests.

- [ ] **Step 5: Commit**

```bash
git add -f components/ui/AnimatedContourBackground.tsx __tests__/AnimatedContourBackground.test.tsx
git commit -m "feat: AnimatedContourBackground component (<object> embed + static fallback)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Wire into home + interests pages and verify animation in Chrome

**Goal:** Swap `PageBackground` for `AnimatedContourBackground` on the two `american_river` pages and prove, in a real browser, that the glow animation runs in light mode while dark mode and other pages are visually unchanged.

> **USER-ORDERED GATE — NON-SKIPPABLE.** This task was requested by the user in the current conversation. It MUST NOT be closed by walking around it, by declaring it "verified inline", or by substituting a cheaper check. Close only after every item in `acceptanceCriteria` has been re-validated independently, with output captured.

**Files:**
- Modify: `app/page.tsx` (lines ~20 and ~25 — the `useAmericanRiverBackground()` destructure and the `<PageBackground .../>` element)
- Modify: `app/interests/page.tsx` (lines ~141 and ~161 — same)

**Acceptance Criteria:**
- [ ] Home page in **light** mode: an `<object>` is present and its embedded SVG SMIL clock advances by ≈4s over a 4s wait (animation running)
- [ ] Interests page in **light** mode: same — `<object>` present, SMIL clock advances ≈4s
- [ ] Home page in **dark** mode: no `<object>` in the DOM (static fallback) and the page looks visually unchanged from before this plan
- [ ] Portfolio page (light and dark): no `<object>`; dual mirrored `PageBackground` still renders, visually unchanged
- [ ] With `prefers-reduced-motion: reduce` emulated: home light mode has no `<object>` (static fallback)
- [ ] `npm test` (full suite) passes

**Verify:** Dev server running (`npm run dev`); in Chrome run the SMIL-clock probe (Steps 4–5) on each page/mode and confirm the values above; `npm test` → all suites green.

**Steps:**

- [ ] **Step 1: Update `app/page.tsx`**

Replace the import:
```tsx
// remove:
import { PageBackground } from '@/components/ui/PageBackground';
// add:
import { AnimatedContourBackground } from '@/components/ui/AnimatedContourBackground';
```
Replace the destructure:
```tsx
const { isMobile, backgroundImage, isDark, mounted, animatedLightSrc } = useAmericanRiverBackground();
```
Replace the element:
```tsx
<AnimatedContourBackground
  backgroundImage={backgroundImage}
  isMobile={isMobile}
  isDark={isDark}
  mounted={mounted}
  animatedSrc={animatedLightSrc}
/>
```

- [ ] **Step 2: Update `app/interests/page.tsx`**

Apply the identical three changes (import swap, destructure adding `isDark, mounted, animatedLightSrc`, element swap to `<AnimatedContourBackground ... />` with the same five props). Leave the unrelated carousel code untouched.

- [ ] **Step 3: Start the dev server**

Run: `npm run dev` (background). Wait for `Ready` / `Local: http://localhost:3000`.

- [ ] **Step 4: Browser SMIL-clock probe (paste into the page console / javascript_tool), LIGHT mode**

Navigate to `http://localhost:3000/`, ensure light theme (toggle if needed), then evaluate. This measures the embedded SVG's SMIL clock — the authoritative signal that the animation is running (a static SVG-as-image has no advancing clock; pixel diffing an `<img>` decode is invalid for `<object>` and must not be used here):
```js
(async () => {
  const o = document.querySelector('object');
  const layer = o ? 'object' : 'none';
  const svg = o && o.contentDocument && o.contentDocument.querySelector('svg');
  const t0 = svg ? svg.getCurrentTime() : null;
  await new Promise(r => setTimeout(r, 4000));
  const t1 = svg ? svg.getCurrentTime() : null;
  return JSON.stringify({
    layer,
    t0,
    t1,
    advancedBy: (t0 != null && t1 != null) ? +(t1 - t0).toFixed(2) : null,
  });
})()
```
Expected (light): `layer:"object"`, `advancedBy` ≈ 4 (SMIL clock progressing → animating). If `advancedBy` is ~0 or null, the animation is NOT running — investigate before closing.

- [ ] **Step 5: Repeat probe for the other states**

  - Interests page (`/interests`, light): same probe → `advancedBy` ≈ 4.
  - Home page **dark** mode: probe → `layer:"none"` (no `<object>`), confirming static. Visually compare to a pre-change screenshot.
  - Portfolio page (`/portfolio`): confirm `document.querySelector('object')` is `null` and the dual mirrored background still renders.
  - Reduced motion: in Chrome DevTools > Rendering > "Emulate CSS prefers-reduced-motion: reduce", reload `/` in light → probe returns `layer:"none"`.

  Capture each result value.

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: all suites pass (smoke, useThemeBackground, AnimatedContourBackground).

- [ ] **Step 7: Commit**

```bash
git add -f app/page.tsx app/interests/page.tsx
git commit -m "feat: use AnimatedContourBackground on home + interests pages

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Notes

- `git add -f` is used throughout because `.gitignore` line 10 is a blanket `*.md` (and may shadow other paths); always confirm with `git status` that intended source files are staged and that no build artifacts (`out/`, `*.png` scratch files) are included.
- The animated SVG is ~872KB; it is the same file already downloaded today for the CSS background, so network cost is unchanged. The `<object>` keeps it out of React's DOM tree.
- Dark mode, portfolio (dual mirror), and resume intentionally keep their exact current behavior — `PageBackground.tsx` is not modified.
