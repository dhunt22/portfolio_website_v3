import { render, act, waitFor } from '@testing-library/react';
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
  lightPlate: '/images/plates/home_light_plate.svg',
  darkPlate: '/images/plates/home_dark_plate.svg',
  glowSrc: '/images/plates/home_glow.svg',
  // Most tests assert the glow fetch fires promptly; disable the reveal delay
  // so they don't have to drive fake timers. The deferral itself is covered by
  // its own dedicated test below.
  glowDelayMs: 0,
};

beforeEach(() => {
  setReducedMotion(false);
  global.fetch = jest.fn().mockResolvedValue({
    text: () => Promise.resolve('<svg><g/></svg>'),
    ok: true,
  } as unknown as Response);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('always renders the fixed contour-plate layer with BOTH theme-gated plate backgrounds', async () => {
  const { container } = render(
    <AnimatedContourBackground {...base} mounted={true} />,
  );
  const layer = container.querySelector('[data-contour-plate]');
  expect(layer).toBeInTheDocument();
  expect(layer).toHaveAttribute(
    'data-light-src',
    '/images/plates/home_light_plate.svg',
  );
  expect(layer).toHaveAttribute(
    'data-dark-src',
    '/images/plates/home_dark_plate.svg',
  );
  expect(layer).toHaveAttribute('aria-hidden', 'true');
  expect(layer).toHaveClass('fixed');

  // The LIGHT plate is painted on the dark:hidden div (shown in light mode).
  const lightBg = layer?.querySelector<HTMLDivElement>(
    'div.dark\\:hidden[style*="background-image"]',
  );
  expect(lightBg).toBeTruthy();
  expect(lightBg).toHaveClass('dark:hidden');
  expect(lightBg?.style.backgroundImage).toContain(
    '/images/plates/home_light_plate.svg',
  );

  // The DARK plate is painted on the hidden dark:block div (shown in dark mode).
  // Because it is display:none in light mode, the browser never fetches it — and
  // vice-versa — so each visitor downloads exactly ONE plate. The .dark class is
  // applied from SSR, so the correct plate is chosen with no flash/double load.
  const darkBg = layer?.querySelector<HTMLDivElement>(
    'div.dark\\:block[style*="background-image"]',
  );
  expect(darkBg).toBeTruthy();
  expect(darkBg).toHaveClass('hidden');
  expect(darkBg).toHaveClass('dark:block');
  expect(darkBg?.style.backgroundImage).toContain(
    '/images/plates/home_dark_plate.svg',
  );

  // Let the inline glow fetch settle so the state update is flushed inside act.
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
});

test('inlines the GLOW (fetches glow, not either plate) when mounted and motion is allowed', async () => {
  const fetchMock = global.fetch as jest.Mock;
  render(<AnimatedContourBackground {...base} mounted={true} />);
  await waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith('/images/plates/home_glow.svg'),
  );
  // Plates are CSS backgrounds — they are NEVER fetched/inlined by JS.
  expect(fetchMock).not.toHaveBeenCalledWith(
    '/images/plates/home_light_plate.svg',
  );
  expect(fetchMock).not.toHaveBeenCalledWith(
    '/images/plates/home_dark_plate.svg',
  );
});

test('themeless glow src + keeps both plate srcs', async () => {
  const { container } = render(
    <AnimatedContourBackground
      lightPlate="/images/plates/home_light_plate.svg"
      darkPlate="/images/plates/home_dark_plate.svg"
      glowSrc="/images/plates/home_glow.svg"
      mounted={true}
      glowDelayMs={0}
    />,
  );
  const layer = container.querySelector('[data-contour-plate]');
  expect(layer).toHaveAttribute(
    'data-light-src',
    '/images/plates/home_light_plate.svg',
  );
  expect(layer).toHaveAttribute(
    'data-dark-src',
    '/images/plates/home_dark_plate.svg',
  );
  await waitFor(() =>
    expect(global.fetch).toHaveBeenCalledWith('/images/plates/home_glow.svg'),
  );
});

test('reduced motion does NOT inline the glow (no fetch) but still shows BOTH static plates', () => {
  setReducedMotion(true);
  const fetchMock = global.fetch as jest.Mock;
  const { container } = render(
    <AnimatedContourBackground {...base} mounted={true} />,
  );
  const layer = container.querySelector('[data-contour-plate]');
  // Both theme-gated plate backgrounds are always present.
  expect(layer).toBeInTheDocument();
  const lightBg = layer?.querySelector<HTMLDivElement>(
    'div.dark\\:hidden[style*="background-image"]',
  );
  expect(lightBg?.style.backgroundImage).toContain(
    '/images/plates/home_light_plate.svg',
  );
  const darkBg = layer?.querySelector<HTMLDivElement>(
    'div.dark\\:block[style*="background-image"]',
  );
  expect(darkBg?.style.backgroundImage).toContain(
    '/images/plates/home_dark_plate.svg',
  );
  // Under reduced motion the glow is never fetched.
  expect(fetchMock).not.toHaveBeenCalled();
});

test('pre-mount does not inline the glow (no fetch)', () => {
  const fetchMock = global.fetch as jest.Mock;
  render(<AnimatedContourBackground {...base} mounted={false} />);
  expect(fetchMock).not.toHaveBeenCalled();
});

test('stops inlining the glow when reduced-motion turns on at runtime', async () => {
  let changeHandler: ((e: { matches: boolean }) => void) | null = null;
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
      changeHandler = cb;
    },
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
  const fetchMock = global.fetch as jest.Mock;
  render(<AnimatedContourBackground {...base} mounted={true} />);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  act(() => {
    changeHandler && changeHandler({ matches: true });
  });
  // No additional fetch once reduced motion is on; the layer stays mounted.
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it('refetches the glow when glowSrc changes (orientation flip: desktop → mobile)', async () => {
  // With themeless glows, glowSrc only changes on orientation (mobile breakpoint),
  // NOT on theme toggle. This test verifies that a src change (e.g. landscape→portrait)
  // still triggers a refetch as expected.
  const fetchMock = global.fetch as jest.Mock;
  const { rerender } = render(
    <AnimatedContourBackground
      lightPlate="/images/plates/home_light_plate.svg"
      darkPlate="/images/plates/home_dark_plate.svg"
      glowSrc="/images/plates/home_glow.svg"
      mounted
      glowDelayMs={0}
    />,
  );
  await waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith('/images/plates/home_glow.svg'),
  );
  rerender(
    <AnimatedContourBackground
      lightPlate="/images/plates/home_light_plate_mobile.svg"
      darkPlate="/images/plates/home_dark_plate_mobile.svg"
      glowSrc="/images/plates/home_glow_mobile.svg"
      mounted
      glowDelayMs={0}
    />,
  );
  await waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith('/images/plates/home_glow_mobile.svg'),
  );
});

test('defers the glow fetch until glowDelayMs elapses (static plate renders first)', async () => {
  jest.useFakeTimers();
  try {
    const fetchMock = global.fetch as jest.Mock;
    const { container } = render(
      <AnimatedContourBackground {...base} mounted={true} glowDelayMs={2000} />,
    );

    // The static plates are present from the first render...
    const layer = container.querySelector('[data-contour-plate]');
    const lightBg = layer?.querySelector<HTMLDivElement>(
      'div.dark\\:hidden[style*="background-image"]',
    );
    expect(lightBg?.style.backgroundImage).toContain(
      '/images/plates/home_light_plate.svg',
    );
    // ...but the glow is NOT fetched yet, and no overlay div is rendered.
    expect(fetchMock).not.toHaveBeenCalled();
    expect(
      layer?.querySelector('div[style*="pointer-events"]'),
    ).toBeNull();

    // Advancing past the reveal delay lets the glow layer fetch + mount.
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(fetchMock).toHaveBeenCalledWith('/images/plates/home_glow.svg');
  } finally {
    jest.useRealTimers();
  }
});

test('flips data-plate-ready once the active plate image loads (fade-in gate)', async () => {
  // Mock Image so setting src resolves onload on the next tick (jsdom does not
  // load images). The component preloads the active plate, then reveals.
  const OriginalImage = global.Image;
  class MockImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    complete = false;
    private _src = '';
    set src(v: string) {
      this._src = v;
      setTimeout(() => this.onload?.(), 0);
    }
    get src() {
      return this._src;
    }
  }
  // @ts-expect-error — minimal Image stand-in for the preload path.
  global.Image = MockImage;
  try {
    const { container } = render(
      <AnimatedContourBackground {...base} mounted={true} isDark={false} />,
    );
    const layer = container.querySelector('[data-contour-plate]');
    // Before the image resolves, the ready flag is absent (backdrop held hidden).
    expect(layer).not.toHaveAttribute('data-plate-ready');
    // Once the (light) plate image loads, the ready flag flips → CSS fades it in.
    await waitFor(() =>
      expect(layer).toHaveAttribute('data-plate-ready', 'true'),
    );
  } finally {
    global.Image = OriginalImage;
  }
});
