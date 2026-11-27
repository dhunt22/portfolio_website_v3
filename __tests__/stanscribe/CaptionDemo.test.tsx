import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { CaptionDemo } from '@/components/stanscribe/CaptionDemo';
import { DEMO_GROUND, DEMO_TURNS } from '@/lib/stanscribe-demo';
import { contrastRatio } from '@/test-utils/contrast';
import { findCopyViolations } from '@/test-utils/stanscribe';

const WORDS = DEMO_TURNS.flatMap((turn) => turn.words.split(' '));

let intersect: (isIntersecting: boolean) => void = () => {};

const setMotion = (reduced: boolean) => {
  window.matchMedia = jest.fn().mockImplementation(() => ({ matches: reduced, addEventListener: jest.fn(), removeEventListener: jest.fn() }));
};

beforeEach(() => {
  jest.useFakeTimers();
  setMotion(false);
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = class {
    live = true;
    constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
      intersect = (isIntersecting) => {
        if (this.live) callback([{ isIntersecting }]);
      };
    }
    observe() {}
    disconnect() {
      this.live = false;
    }
  };
});

afterEach(() => {
  jest.useRealTimers();
  delete (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
});

const shown = (container: HTMLElement) => container.querySelectorAll('[data-word][data-shown="true"]').length;
const names = (container: HTMLElement) => Array.from(container.querySelectorAll('[data-speaker]')).map((name) => name.getAttribute('data-shown'));
const scrollIntoView = () => act(() => intersect(true));
const advance = (ms: number) => act(() => { jest.advanceTimersByTime(ms); });

test('the script is three people making a plan, in words that follow the brief', () => {
  expect(DEMO_TURNS.map((turn) => [turn.speaker, turn.words])).toEqual([
    ['Alex', 'Are we still on for Saturday?'],
    ['Rosa', 'Yes. Come at six, and bring the salad.'],
    ['Person 3', 'I will bring dessert.'],
  ]);
  expect(findCopyViolations(DEMO_TURNS.map((turn) => `${turn.speaker} ${turn.words}`).join(' '))).toEqual([]);
});

test('each speaker’s colour clears 7:1 on the demo’s ground', () => {
  for (const turn of DEMO_TURNS) expect(contrastRatio(turn.color, DEMO_GROUND)).toBeGreaterThanOrEqual(7);
});

test('the server render holds the whole conversation, with nothing hidden and no button', () => {
  const html = renderToString(<CaptionDemo />);
  for (const turn of DEMO_TURNS) expect(html).toContain(turn.speaker);
  expect(html.match(/data-shown="true"/g)).toHaveLength(WORDS.length + DEMO_TURNS.length);
  expect(html).not.toContain('data-shown="false"');
  expect(html).not.toContain('<button');
});

test('with reduced motion nothing is hidden and there is no button', () => {
  setMotion(true);
  const { container } = render(<CaptionDemo />);
  scrollIntoView();
  advance(20000);
  expect(shown(container)).toBe(WORDS.length);
  expect(names(container)).toEqual(['true', 'true', 'true']);
  expect(screen.queryByRole('button')).toBeNull();
});

test('without IntersectionObserver the whole conversation shows', () => {
  delete (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
  const { container } = render(<CaptionDemo />);
  expect(shown(container)).toBe(WORDS.length);
});

test('it waits off screen, then the words arrive in order', () => {
  const { container } = render(<CaptionDemo />);
  expect(shown(container)).toBe(0);
  advance(5000);
  expect(shown(container)).toBe(0);
  scrollIntoView();
  expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  advance(1000);
  const early = shown(container);
  expect(early).toBeGreaterThan(0);
  expect(early).toBeLessThan(WORDS.length);
  const words = Array.from(container.querySelectorAll('[data-word]'));
  expect(words.slice(0, early).every((word) => word.getAttribute('data-shown') === 'true')).toBe(true);
  expect(words.slice(early).every((word) => word.getAttribute('data-shown') === 'false')).toBe(true);
  advance(20000);
  expect(shown(container)).toBe(WORDS.length);
  expect(names(container)).toEqual(['true', 'true', 'true']);
  expect(screen.getByRole('button', { name: 'Play again' })).toBeInTheDocument();
});

test('before it starts, no name shows', () => {
  const { container } = render(<CaptionDemo />);
  expect(names(container)).toEqual(['false', 'false', 'false']);
  advance(5000);
  expect(names(container)).toEqual(['false', 'false', 'false']);
});

test('the first name shows as soon as it starts, before the first word', () => {
  const { container } = render(<CaptionDemo />);
  scrollIntoView();
  expect(shown(container)).toBe(0);
  expect(names(container)).toEqual(['true', 'false', 'false']);
});

test('the next name shows in the pause after the last word before it, ahead of that speaker’s words', () => {
  const { container } = render(<CaptionDemo />);
  scrollIntoView();
  // Alex's turn, "Are we still on for Saturday?", is six words.
  for (let ms = 0; shown(container) < 6 && ms < 10000; ms += 10) advance(10);
  expect(shown(container)).toBe(6);
  expect(names(container)).toEqual(['true', 'true', 'false']);
});

test('hidden words keep their space and stay readable to a screen reader', () => {
  const { container } = render(<CaptionDemo />);
  const hidden = container.querySelector<HTMLElement>('[data-word][data-shown="false"]')!;
  expect(hidden.style.opacity).toBe('0');
  expect(hidden.closest('[aria-hidden="true"]')).toBeNull();
  expect(container.textContent).toContain('Are we still on for Saturday?');
});

test('Pause holds the words, Play goes on, and Play again starts over', () => {
  const { container } = render(<CaptionDemo />);
  scrollIntoView();
  advance(1000);
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
  const held = shown(container);
  advance(5000);
  expect(shown(container)).toBe(held);
  fireEvent.click(screen.getByRole('button', { name: 'Play' }));
  advance(20000);
  expect(shown(container)).toBe(WORDS.length);
  fireEvent.click(screen.getByRole('button', { name: 'Play again' }));
  expect(shown(container)).toBe(0);
  advance(20000);
  expect(shown(container)).toBe(WORDS.length);
});

test('scrolling back to it does not start it twice', () => {
  const { container } = render(<CaptionDemo />);
  scrollIntoView();
  advance(20000);
  scrollIntoView();
  expect(shown(container)).toBe(WORDS.length);
  expect(screen.getByRole('button', { name: 'Play again' })).toBeInTheDocument();
});

test('the app’s bar is a picture: hidden from screen readers, with no controls in it', () => {
  const { container } = render(<CaptionDemo />);
  const bar = container.querySelector('[data-demo-bar]')!;
  expect(bar.getAttribute('aria-hidden')).toBe('true');
  expect(bar.querySelector('button, a, [tabindex]')).toBeNull();
  expect(bar.textContent).toBe('A−SmallerA+LargerSaveStop');
});

test('each button in the bar has its glyph over its word, as the app’s bar does: A−, A+, a star and a solid square', () => {
  const { container } = render(<CaptionDemo />);
  const tiles = Array.from(container.querySelectorAll('[data-demo-bar] > span'));
  expect(tiles.map((tile) => tile.lastElementChild!.textContent)).toEqual(['Smaller', 'Larger', 'Save', 'Stop']);
  expect(tiles[0].firstElementChild!.textContent).toBe('A−');
  expect(tiles[1].firstElementChild!.textContent).toBe('A+');
  expect(tiles[2].querySelector('svg')).not.toBeNull();
  expect(tiles[2].querySelector('[fill="currentColor"]')).toBeNull();
  expect(tiles[3].querySelector('svg rect[fill="currentColor"]')).not.toBeNull();
});

test('pressing Play before it scrolls into view counts as the start: scrolling in later does not replay it', () => {
  const { container } = render(<CaptionDemo />);
  fireEvent.click(screen.getByRole('button', { name: 'Play' }));
  advance(20000);
  expect(shown(container)).toBe(WORDS.length);
  scrollIntoView();
  expect(shown(container)).toBe(WORDS.length);
  expect(screen.queryByRole('button', { name: 'Pause' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Play again' })).toBeInTheDocument();
  advance(20000);
  expect(container.querySelectorAll('[data-word]')).toHaveLength(WORDS.length);
  expect(shown(container)).toBe(WORDS.length);
  expect(screen.getByRole('button', { name: 'Play again' })).toBeInTheDocument();
});

test('Pause pressed before it scrolls into view stays paused when it scrolls in', () => {
  const { container } = render(<CaptionDemo />);
  fireEvent.click(screen.getByRole('button', { name: 'Play' }));
  advance(1000);
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
  const held = shown(container);
  scrollIntoView();
  advance(5000);
  expect(shown(container)).toBe(held);
  expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
});
