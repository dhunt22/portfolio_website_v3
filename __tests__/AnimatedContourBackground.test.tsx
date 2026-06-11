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
  plateSrc: '/images/plates/home_light_plate.svg',
  glowSrc: '/images/plates/home_light_glow.svg',
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

test('always renders the fixed contour-plate layer with the static plate background', async () => {
  const { container } = render(
    <AnimatedContourBackground {...base} mounted={true} />,
  );
  const layer = container.querySelector('[data-contour-plate]');
  expect(layer).toBeInTheDocument();
  expect(layer).toHaveAttribute('data-src', '/images/plates/home_light_plate.svg');
  expect(layer).toHaveAttribute('aria-hidden', 'true');
  expect(layer).toHaveClass('fixed');
  // The static plate is always painted as a CSS background-image.
  const bg = layer?.querySelector<HTMLDivElement>(
    'div[style*="background-image"]',
  );
  expect(bg).toBeTruthy();
  expect(bg?.style.backgroundImage).toContain(
    '/images/plates/home_light_plate.svg',
  );
  // Let the inline glow fetch settle so the state update is flushed inside act.
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
});

test('inlines the GLOW (fetches glow, not plate) when mounted and motion is allowed', async () => {
  const fetchMock = global.fetch as jest.Mock;
  render(<AnimatedContourBackground {...base} mounted={true} />);
  await waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith('/images/plates/home_light_glow.svg'),
  );
  // The static plate is a CSS background — it is NEVER fetched/inlined.
  expect(fetchMock).not.toHaveBeenCalledWith(
    '/images/plates/home_light_plate.svg',
  );
});

test('resolves the dark plate + glow srcs', async () => {
  const { container } = render(
    <AnimatedContourBackground
      plateSrc="/images/plates/home_dark_plate.svg"
      glowSrc="/images/plates/home_dark_glow.svg"
      mounted={true}
    />,
  );
  expect(container.querySelector('[data-contour-plate]')).toHaveAttribute(
    'data-src',
    '/images/plates/home_dark_plate.svg',
  );
  await waitFor(() =>
    expect(global.fetch).toHaveBeenCalledWith('/images/plates/home_dark_glow.svg'),
  );
});

test('reduced motion does NOT inline the glow (no fetch) but still shows the static plate', () => {
  setReducedMotion(true);
  const fetchMock = global.fetch as jest.Mock;
  const { container } = render(
    <AnimatedContourBackground {...base} mounted={true} />,
  );
  const layer = container.querySelector('[data-contour-plate]');
  // The static plate background is always present.
  expect(layer).toBeInTheDocument();
  const bg = layer?.querySelector<HTMLDivElement>(
    'div[style*="background-image"]',
  );
  expect(bg?.style.backgroundImage).toContain(
    '/images/plates/home_light_plate.svg',
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

it('refetches the glow when glowSrc changes (theme flip)', async () => {
  const fetchMock = global.fetch as jest.Mock;
  const { rerender } = render(
    <AnimatedContourBackground
      plateSrc="/images/plates/home_light_plate.svg"
      glowSrc="/images/plates/home_light_glow.svg"
      mounted
    />,
  );
  await waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith('/images/plates/home_light_glow.svg'),
  );
  rerender(
    <AnimatedContourBackground
      plateSrc="/images/plates/home_dark_plate.svg"
      glowSrc="/images/plates/home_dark_glow.svg"
      mounted
    />,
  );
  await waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith('/images/plates/home_dark_glow.svg'),
  );
});
