import { render, screen, fireEvent } from '@testing-library/react';
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
  animatedSrc: '/images/american_river_contour_bwn.svg',
};

beforeEach(() => setReducedMotion(false));

test('renders object + underlay when light, mounted, motion ok', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} isDark={false} mounted={true} />,
  );
  const obj = container.querySelector('object');
  expect(obj).toBeInTheDocument();
  expect(obj).toHaveAttribute('data', '/images/american_river_contour_bwn.svg');
  expect(obj).toHaveAttribute('aria-hidden', 'true');
  expect(obj).toHaveAttribute('tabindex', '-1');
});

test('no object in dark mode', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} isDark={true} mounted={true} />,
  );
  expect(container.querySelector('object')).not.toBeInTheDocument();
});

test('no object before mount', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} isDark={false} mounted={false} />,
  );
  expect(container.querySelector('object')).not.toBeInTheDocument();
});

test('no object when animatedSrc missing', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} animatedSrc={undefined} isDark={false} mounted={true} />,
  );
  expect(container.querySelector('object')).not.toBeInTheDocument();
});

test('no object when reduced motion preferred', () => {
  setReducedMotion(true);
  const { container } = render(
    <AnimatedContourBackground {...base} isDark={false} mounted={true} />,
  );
  expect(container.querySelector('object')).not.toBeInTheDocument();
});

test('underlay removed after object load', () => {
  const { container } = render(
    <AnimatedContourBackground {...base} isDark={false} mounted={true} />,
  );
  expect(container.querySelectorAll('[data-bg-underlay]').length).toBe(1);
  fireEvent.load(container.querySelector('object')!);
  expect(container.querySelectorAll('[data-bg-underlay]').length).toBe(0);
});
