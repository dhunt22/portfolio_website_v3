import { renderHook } from '@testing-library/react';
import { useThemeBackground, PLATE_PRESETS } from '@/hooks/useThemeBackground';

// Controllable per-test resolved theme. The mock reads the live variable so an
// individual test can flip it to exercise the dark branch.
let mockResolvedTheme = 'light';
jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: mockResolvedTheme }),
}));

beforeEach(() => {
  mockResolvedTheme = 'light';
});

test('light theme: exposes BOTH plate urls (not JS-resolved) + themeless glow', () => {
  const { result } = renderHook(() => useThemeBackground(PLATE_PRESETS.home));
  // renderHook flushes effects, so mounted is true here.
  expect(result.current.mounted).toBe(true);
  expect(result.current.isDark).toBe(false);
  // Both plate URLs are handed to the component for CSS theming (the component
  // gates them via dark:hidden / hidden dark:block); the hook never resolves a
  // single plateSrc by JS.
  expect(result.current.lightPlate).toBe('/images/plates/home_light_plate.svg');
  expect(result.current.darkPlate).toBe('/images/plates/home_dark_plate.svg');
  // Glow is themeless — same src regardless of theme.
  expect(result.current.glowSrc).toBe('/images/plates/home_glow.svg');
});

test('dark theme: still exposes BOTH plate urls + SAME themeless glow + isDark', () => {
  mockResolvedTheme = 'dark';
  const { result } = renderHook(() => useThemeBackground(PLATE_PRESETS.home));
  expect(result.current.isDark).toBe(true);
  // Plate urls are theme-independent — the CSS dark: classes resolve which is shown.
  expect(result.current.lightPlate).toBe('/images/plates/home_light_plate.svg');
  expect(result.current.darkPlate).toBe('/images/plates/home_dark_plate.svg');
  // Glow is THEMELESS — the same file for both light and dark.
  // var(--surface-page) in the inlined SVG resolves the correct colour at runtime.
  expect(result.current.glowSrc).toBe('/images/plates/home_glow.svg');
});

test('every page preset points at its own light/dark plate + single themeless glow', () => {
  const pages = ['home', 'portfolio', 'ej', 'resume', 'interests', 'notFound'] as const;
  for (const page of pages) {
    expect(PLATE_PRESETS[page].lightImage).toBe(
      `/images/plates/${page}_light_plate.svg`,
    );
    expect(PLATE_PRESETS[page].darkImage).toBe(
      `/images/plates/${page}_dark_plate.svg`,
    );
    // Single themeless glow per page (var(--surface-page) resolves colour at runtime).
    expect(PLATE_PRESETS[page].glow).toBe(
      `/images/plates/${page}_glow.svg`,
    );
  }
});

test('no legacy theme-split glow fields remain on presets', () => {
  // glowLight / glowDark / glowDarkMobile have been removed in favour of
  // glow / glowMobile (themeless).
  const home = PLATE_PRESETS.home as Record<string, unknown>;
  expect(home.glowLight).toBeUndefined();
  expect(home.glowDark).toBeUndefined();
  expect(home.glowDarkMobile).toBeUndefined();
});

test('no legacy watershed presets remain', () => {
  expect((PLATE_PRESETS as Record<string, unknown>).americanRiver).toBeUndefined();
  expect((PLATE_PRESETS as Record<string, unknown>).upperFolsom).toBeUndefined();
});

test('existing fields still present', () => {
  const { result } = renderHook(() => useThemeBackground(PLATE_PRESETS.portfolio));
  expect(result.current).toEqual(
    expect.objectContaining({
      mounted: expect.any(Boolean),
      isMobile: expect.any(Boolean),
      lightPlate: expect.any(String),
      darkPlate: expect.any(String),
      glowSrc: expect.any(String),
      isDark: expect.any(Boolean),
    }),
  );
});
