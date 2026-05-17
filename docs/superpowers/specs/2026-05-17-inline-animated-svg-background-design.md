# Inline Animated SVG Contour Background — Design

**Date:** 2026-05-17
**Branch:** `claude/add-svg-glow-animation-Xx33p`
**Status:** Approved (design sections approved interactively)

## Problem

The branch `claude/add-svg-glow-animation-Xx33p` added working SMIL glow-trace
animation (6 radial-gradient traces, ~32s cycle) to
`public/images/american_river_contour_bwn.svg`. The SMIL is verified working when
the SVG is opened directly, but **does not run on the live site**: every page
consumes the contour SVG through `components/ui/PageBackground.tsx` as a CSS
`background-image` (`style={{ backgroundImage: url(...) }}`, driven by
`hooks/useThemeBackground.ts`). Browsers render SVGs referenced via CSS
`background-image` / `<img>` as static images — SMIL never executes. Verified
empirically: 0 pixel change over 3.5s via `<img>` decode.

## Scope

**Prototype scope only:**

- Animate `american_river_contour_bwn.svg` (the **light** variant) only.
- Affected pages: `app/page.tsx` (home) and `app/interests/page.tsx` (interests).
- Light mode only. Dark mode, portfolio (`upper_folsom`, dual mirror-tiled),
  and resume keep their exact current behavior.
- Single, non-repeating instance of the animated SVG (no `repeat-y` tiling, no
  mirror). Long pages have no contour pattern below the SVG — accepted.

Out of scope: porting the SMIL glow into `american_river_contour_dark.svg` or
either `upper_folsom` variant; preserving vertical tiling / dual mirror for the
animated path.

## Approach

**Approach A — `<object>` embed.** Render the animated SVG via
`<object type="image/svg+xml" data="/images/american_river_contour_bwn.svg">`.
The `<object>` loads the SVG as a separate document, so SMIL runs; the 872KB
file stays a cacheable static asset; React's DOM tree is not bloated with
thousands of `<path>` nodes; no `dangerouslySetInnerHTML`.

Rejected alternatives:

- **B — fetch + inline via `dangerouslySetInnerHTML`**: injects thousands of
  path nodes into the React-managed DOM (heavier paint/layout), adds a
  fetch-then-paint flash, and uses `dangerouslySetInnerHTML`.
- **C — `<iframe>` embed**: heavier than `<object>`, awkward sizing, potential
  scrollbars; no advantage here.

## Architecture

New component **`components/ui/AnimatedContourBackground.tsx`**.

- Used **only** by `app/page.tsx` and `app/interests/page.tsx`.
- **Reuses the existing `PageBackground` component verbatim** as its static
  underlay and permanent fallback. `PageBackground.tsx` is **not modified** —
  portfolio (dual mirror), resume, and all dark-mode rendering keep their
  current proven behavior.
- Renders the animated `<object>` layer only when **all** of:
  - `mounted` (post-hydration), AND
  - light theme (`!isDark`), AND
  - `prefers-reduced-motion` is **not** set.
- Otherwise renders `<PageBackground>` unchanged.

`hooks/useThemeBackground.ts` gets a small **additive** change: expose the
animated asset path for the `americanRiver` preset (the hook already returns
`mounted`, `isDark`, `isMobile`, `resolvedTheme`, `backgroundImage`). No
behavior change for existing callers; existing return fields are unchanged.

Blast radius: 1 new file, 1 additive hook change, 2 page call-site swaps.

## Rendering, Sizing & Loading

Inside the same clip container `PageBackground` uses
(`absolute -top-[200px] -bottom-[200px] left-0 right-0 -z-10 overflow-hidden`,
`aria-hidden`, `pointer-events:none`):

- **Static underlay**: the existing `<PageBackground>` (static, same artwork),
  rendered immediately. Prevents a blank flash while the 872KB SVG loads and is
  the permanent fallback.
- **Animated `<object>` layer** on top:
  `<object type="image/svg+xml" data="/images/american_river_contour_bwn.svg">`,
  `tabIndex={-1}`, `aria-hidden`, `pointer-events:none`.
  - Hidden (`opacity:0`) until its `onLoad` fires; then it fades in and the
    static underlay is hidden — opacity is never doubled (no darker-than-today
    look). One piece of state (`loaded`).
  - Single non-repeating instance: width `100%` desktop / `250%` mobile,
    horizontally centered, anchored top; intrinsic 1080:1920 aspect drives
    height. Matches today's `backgroundSize:'100% auto' / '250% auto'`,
    `backgroundPosition:'center top'`.
  - Wrapper opacity stays at today's `opacity-10` (light only).

**Reduced motion**: read `matchMedia('(prefers-reduced-motion: reduce)')` with
a change listener. When reduced motion is preferred, the `<object>` is never
mounted — only the static `<PageBackground>` renders. Reliable, since SMIL
ignores CSS motion preferences.

**SSR/hydration**: pre-mount renders the static `<PageBackground>` (same as
today's pre-mount `url(lightImage)`); after mount + checks pass, the `<object>`
mounts and fades in over identical static artwork — no visible pop.

## Data Flow

1. Page renders `<AnimatedContourBackground>` with values from
   `useAmericanRiverBackground()` (`mounted`, `isDark`, `isMobile`,
   `backgroundImage`, animated src).
2. Component computes `shouldAnimate = mounted && !isDark && !reducedMotion`.
3. Always renders `<PageBackground>` underlay.
4. If `shouldAnimate`, also renders the `<object>`; on its `onLoad`, sets
   `loaded=true` → object fades in, underlay hidden.
5. Theme toggle / reduced-motion change / resize re-evaluates and re-renders;
   on switch to dark or reduced-motion, the `<object>` unmounts and the static
   underlay shows.

## Error Handling

- `<object>` fails to load (network/404): `onLoad` never fires, `loaded`
  stays false, static underlay remains visible. Graceful degradation, no
  broken UI. Optionally wire `onError` to assert the fallback explicitly.
- Pre-mount / SSR: static path only; no client API access before mount.

## Testing

- **Component tests** (jest, existing harness): assert
  `AnimatedContourBackground` renders an `<object>` with the correct `data`
  src when light + mounted + motion-ok; asserts it renders only the static
  `<PageBackground>` (no `<object>`) when dark, when reduced-motion, and
  pre-mount. Mock `matchMedia` and `next-themes`.
- **Manual browser verification**: with dev server on light mode home &
  interests, confirm animation runs via the pixel-diff method already used
  (sample background region pixels over ~4s; nonzero change = animating).
  Confirm dark mode and portfolio/resume are visually unchanged. Confirm
  reduced-motion (emulated) shows the static background.

## Files

- **Create**: `components/ui/AnimatedContourBackground.tsx`
- **Modify**: `hooks/useThemeBackground.ts` (additive: expose animated src for
  `americanRiver` preset)
- **Modify**: `app/page.tsx` (swap `<PageBackground>` → `<AnimatedContourBackground>`)
- **Modify**: `app/interests/page.tsx` (same swap)
- **Unchanged**: `components/ui/PageBackground.tsx`, all other pages
