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
