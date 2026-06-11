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
  plateSrc: '/images/plates/home_light.svg',
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

test('always renders the fixed contour-plate layer', async () => {
  const { container } = render(
    <AnimatedContourBackground {...base} mounted={true} />,
  );
  const layer = container.querySelector('[data-contour-plate]');
  expect(layer).toBeInTheDocument();
  expect(layer).toHaveAttribute('data-src', '/images/plates/home_light.svg');
  expect(layer).toHaveAttribute('aria-hidden', 'true');
  expect(layer).toHaveClass('fixed');
  // Let the inline fetch settle so the state update is flushed inside act.
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
});

test('inlines the plate (fetches) when mounted and motion is allowed', async () => {
  const fetchMock = global.fetch as jest.Mock;
  render(<AnimatedContourBackground {...base} mounted={true} />);
  await waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith('/images/plates/home_light.svg'),
  );
});

test('resolves the dark plate src', async () => {
  const { container } = render(
    <AnimatedContourBackground plateSrc="/images/plates/home_dark.svg" mounted={true} />,
  );
  expect(container.querySelector('[data-contour-plate]')).toHaveAttribute(
    'data-src',
    '/images/plates/home_dark.svg',
  );
  await waitFor(() =>
    expect(global.fetch).toHaveBeenCalledWith('/images/plates/home_dark.svg'),
  );
});

test('reduced motion does NOT inline (no fetch) but still shows the static plate layer', () => {
  setReducedMotion(true);
  const fetchMock = global.fetch as jest.Mock;
  const { container } = render(
    <AnimatedContourBackground {...base} mounted={true} />,
  );
  // The layer is always present; under reduced motion it paints the plate as a
  // CSS background instead of inlining the animated SVG.
  expect(container.querySelector('[data-contour-plate]')).toBeInTheDocument();
  expect(fetchMock).not.toHaveBeenCalled();
});

test('pre-mount does not inline (no fetch)', () => {
  const fetchMock = global.fetch as jest.Mock;
  render(<AnimatedContourBackground {...base} mounted={false} />);
  expect(fetchMock).not.toHaveBeenCalled();
});

test('stops inlining when reduced-motion turns on at runtime', async () => {
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

it('refetches when plateSrc changes (theme flip)', async () => {
  const fetchMock = global.fetch as jest.Mock;
  const { rerender } = render(
    <AnimatedContourBackground plateSrc="/images/plates/home_light.svg" mounted />,
  );
  await waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith('/images/plates/home_light.svg'),
  );
  rerender(
    <AnimatedContourBackground plateSrc="/images/plates/home_dark.svg" mounted />,
  );
  await waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith('/images/plates/home_dark.svg'),
  );
});
