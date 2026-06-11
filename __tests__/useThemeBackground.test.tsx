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

test('light theme resolves the LIGHT plate (mounted via effect flush)', () => {
  const { result } = renderHook(() => useThemeBackground(PLATE_PRESETS.home));
  // renderHook flushes effects, so mounted is true here.
  expect(result.current.mounted).toBe(true);
  expect(result.current.isDark).toBe(false);
  expect(result.current.plateSrc).toBe('/images/plates/home_light.svg');
  expect(result.current.animatedSrc).toBe('/images/plates/home_light.svg');
  expect(result.current.backgroundImage).toBe('url(/images/plates/home_light.svg)');
});

test('dark theme resolves the DARK plate + isDark', () => {
  mockResolvedTheme = 'dark';
  const { result } = renderHook(() => useThemeBackground(PLATE_PRESETS.home));
  expect(result.current.isDark).toBe(true);
  expect(result.current.plateSrc).toBe('/images/plates/home_dark.svg');
  expect(result.current.animatedSrc).toBe('/images/plates/home_dark.svg');
  expect(result.current.backgroundImage).toBe('url(/images/plates/home_dark.svg)');
});

test('every page preset points at its own light/dark plate files', () => {
  const pages = ['home', 'portfolio', 'ej', 'resume', 'interests', 'notFound'] as const;
  for (const page of pages) {
    expect(PLATE_PRESETS[page].lightImage).toBe(`/images/plates/${page}_light.svg`);
    expect(PLATE_PRESETS[page].darkImage).toBe(`/images/plates/${page}_dark.svg`);
    // The plate file doubles as the reduced-motion image and the inlined overlay.
    expect(PLATE_PRESETS[page].overlayLight).toBe(PLATE_PRESETS[page].lightImage);
    expect(PLATE_PRESETS[page].overlayDark).toBe(PLATE_PRESETS[page].darkImage);
  }
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
      backgroundImage: expect.any(String),
      plateSrc: expect.any(String),
      isDark: expect.any(Boolean),
    }),
  );
});
