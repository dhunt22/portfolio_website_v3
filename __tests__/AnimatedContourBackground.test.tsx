import { render, act } from '@testing-library/react';
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
  animatedSrc: '/images/american_river_pulses.svg',
};

beforeEach(() => setReducedMotion(false));

test('renders pulse overlay (object) when light, mounted, motion ok', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} isDark={false} mounted={true} />,
  );
  const overlay = container.querySelector('[data-pulse-overlay]');
  const obj = container.querySelector('object');
  expect(overlay).toBeInTheDocument();
  expect(obj).toBeInTheDocument();
  expect(obj).toHaveAttribute('data', '/images/american_river_pulses.svg');
  expect(obj).toHaveAttribute('aria-hidden', 'true');
  expect(obj).toHaveAttribute('tabindex', '-1');
});

test('renders pulse overlay in dark mode too', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} isDark={true} mounted={true} />,
  );
  expect(container.querySelector('[data-pulse-overlay]')).toBeInTheDocument();
  expect(container.querySelector('object')).toBeInTheDocument();
});

test('no pulse overlay before mount', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} isDark={false} mounted={false} />,
  );
  expect(container.querySelector('[data-pulse-overlay]')).not.toBeInTheDocument();
});

test('no pulse overlay when animatedSrc missing', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} animatedSrc={undefined} isDark={false} mounted={true} />,
  );
  expect(container.querySelector('[data-pulse-overlay]')).not.toBeInTheDocument();
});

test('no pulse overlay when reduced motion preferred', () => {
  setReducedMotion(true);
  const { container } = render(
    <AnimatedContourBackground {...base} isDark={false} mounted={true} />,
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
    <AnimatedContourBackground {...base} isDark={false} mounted={true} />,
  );
  expect(container.querySelector('[data-pulse-overlay]')).toBeInTheDocument();
  act(() => { changeHandler && changeHandler({ matches: true }); });
  expect(container.querySelector('[data-pulse-overlay]')).not.toBeInTheDocument();
});
