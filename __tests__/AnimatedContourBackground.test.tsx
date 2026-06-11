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
  backgroundImage: 'url(/images/american_river_contour_bwn.svg)',
  isMobile: false,
  animatedSrc: '/images/american_river_overlay_light.svg',
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

test('renders pulse overlay when mounted, motion ok', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} mounted={true} />,
  );
  const overlay = container.querySelector('[data-pulse-overlay]');
  expect(overlay).toBeInTheDocument();
  expect(overlay).toHaveAttribute('data-src', '/images/american_river_overlay_light.svg');
  expect(overlay).toHaveAttribute('aria-hidden', 'true');
});

test('renders pulse overlay with dark overlay src', () => {
  const { container } = render(
    <AnimatedContourBackground
      {...base}
      animatedSrc="/images/american_river_overlay_dark.svg"
      mounted={true}
    />,
  );
  expect(container.querySelector('[data-pulse-overlay]')).toBeInTheDocument();
});

test('no pulse overlay before mount', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} mounted={false} />,
  );
  expect(container.querySelector('[data-pulse-overlay]')).not.toBeInTheDocument();
});

test('no pulse overlay when animatedSrc missing', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} animatedSrc={undefined} mounted={true} />,
  );
  expect(container.querySelector('[data-pulse-overlay]')).not.toBeInTheDocument();
});

test('no pulse overlay when reduced motion preferred', () => {
  setReducedMotion(true);
  const { container } = render(
    <AnimatedContourBackground {...base} mounted={true} />,
  );
  expect(container.querySelector('[data-pulse-overlay]')).not.toBeInTheDocument();
});

test('hides pulse overlay when reduced-motion turns on at runtime', () => {
  let changeHandler: ((e: { matches: boolean }) => void) | null = null;
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => { changeHandler = cb; },
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
  const { container } = render(
    <AnimatedContourBackground {...base} mounted={true} />,
  );
  expect(container.querySelector('[data-pulse-overlay]')).toBeInTheDocument();
  act(() => { changeHandler && changeHandler({ matches: true }); });
  expect(container.querySelector('[data-pulse-overlay]')).not.toBeInTheDocument();
});

it('refetches when animatedSrc changes', async () => {
  const fetchMock = global.fetch as jest.Mock;
  const { rerender } = render(
    <AnimatedContourBackground backgroundImage="url(/x.svg)" isMobile={false} mounted animatedSrc="/images/a_overlay_light.svg" />,
  );
  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/images/a_overlay_light.svg'));
  rerender(
    <AnimatedContourBackground backgroundImage="url(/x.svg)" isMobile={false} mounted animatedSrc="/images/a_overlay_dark.svg" />,
  );
  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/images/a_overlay_dark.svg'));
});
