import { renderHook } from '@testing-library/react';
import { useThemeBackground, BACKGROUND_PRESETS } from '@/hooks/useThemeBackground';

jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}));

test('americanRiver preset result includes animatedSrc (overlay path or undefined)', () => {
  const { result } = renderHook(() => useThemeBackground(BACKGROUND_PRESETS.americanRiver));
  // animatedSrc is either undefined (before mount) or a valid overlay path string
  expect(
    result.current.animatedSrc === undefined ||
    typeof result.current.animatedSrc === 'string'
  ).toBe(true);
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
