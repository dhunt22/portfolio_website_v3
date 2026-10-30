import { render, screen, waitFor } from '@testing-library/react';
import { HeroLoadIn } from '@/components/ui/HeroLoadIn';

// The animation chunk fails to load (a flaky connection, or a stale page after a deploy).
jest.mock('@/lib/gsap', () => {
  throw new Error('chunk failed to load');
});

beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
});

test('the hero shows its words when the animation chunk fails to load', async () => {
  render(<HeroLoadIn><h1>Stan Scribe</h1><p>Live captions</p></HeroLoadIn>);
  await waitFor(() => expect(screen.getByRole('heading')).toHaveStyle({ opacity: '1' }));
  expect(screen.getByText('Live captions')).toHaveStyle({ opacity: '1' });
});
