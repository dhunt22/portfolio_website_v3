import { renderHook } from '@testing-library/react';
import { useThemeBackground, BACKGROUND_PRESETS } from '@/hooks/useThemeBackground';

// Controllable per-test resolved theme. The mock reads the live variable so an
// individual test can flip it to exercise the dark branch.
let mockResolvedTheme = 'light';
jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: mockResolvedTheme }),
}));

beforeEach(() => {
  mockResolvedTheme = 'light';
});

test('light theme selects the LIGHT overlay (mounted via effect flush)', () => {
  const { result } = renderHook(() => useThemeBackground(BACKGROUND_PRESETS.americanRiver));
  // renderHook flushes effects, so mounted is true here.
  expect(result.current.mounted).toBe(true);
  expect(result.current.isDark).toBe(false);
  expect(result.current.animatedSrc).toBe(BACKGROUND_PRESETS.americanRiver.overlayLight);
  expect(result.current.backgroundImage).toBe(`url(${BACKGROUND_PRESETS.americanRiver.lightImage})`);
});

test('dark theme selects the DARK overlay + dark image + isDark', () => {
  mockResolvedTheme = 'dark';
  const { result } = renderHook(() => useThemeBackground(BACKGROUND_PRESETS.americanRiver));
  expect(result.current.isDark).toBe(true);
  expect(result.current.animatedSrc).toBe(BACKGROUND_PRESETS.americanRiver.overlayDark);
  expect(result.current.backgroundImage).toBe(`url(${BACKGROUND_PRESETS.americanRiver.darkImage})`);
});

test('BACKGROUND_PRESETS.americanRiver has overlay paths', () => {
  expect(BACKGROUND_PRESETS.americanRiver.overlayLight).toBe('/images/american_river_overlay_light.svg');
  expect(BACKGROUND_PRESETS.americanRiver.overlayDark).toBe('/images/american_river_overlay_dark.svg');
});

test('BACKGROUND_PRESETS.upperFolsom has overlay paths', () => {
  expect(BACKGROUND_PRESETS.upperFolsom.overlayLight).toBe('/images/upper_folsom_overlay_light.svg');
  expect(BACKGROUND_PRESETS.upperFolsom.overlayDark).toBe('/images/upper_folsom_overlay_dark.svg');
});

test('existing fields still present', () => {
  const { result } = renderHook(() => useThemeBackground(BACKGROUND_PRESETS.americanRiver));
  expect(result.current).toEqual(
    expect.objectContaining({
      mounted: expect.any(Boolean),
      isMobile: expect.any(Boolean),
      backgroundImage: expect.any(String),
      isDark: expect.any(Boolean),
    }),
  );
});
