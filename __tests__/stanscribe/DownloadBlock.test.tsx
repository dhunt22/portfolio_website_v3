import { render, screen } from '@testing-library/react';
import { DownloadBlock } from '@/components/stanscribe/DownloadBlock';

jest.mock('@/lib/stanscribe', () => ({ ...jest.requireActual('@/lib/stanscribe'), RELEASED: false }));

describe('DownloadBlock before release', () => {
  test('Stan Scribe: coming soon, with the public beta', () => {
    const { container } = render(<DownloadBlock app="scribe" />);
    expect(screen.getByText('Pay once. No subscription.')).toBeInTheDocument();
    expect(screen.getByText('Coming soon to the App Store')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /public beta/i })).toHaveAttribute('href', 'https://testflight.apple.com/join/ejNyaGqJ');
    expect(container.querySelector('a[href^="https://apps.apple.com"]')).toBeNull();
  });

  test('Light: coming soon, no beta link yet', () => {
    const { container } = render(<DownloadBlock app="light" />);
    expect(screen.getByText('Free. The simple edition.')).toBeInTheDocument();
    expect(screen.getByText('Coming soon to the App Store')).toBeInTheDocument();
    expect(container.querySelector('a[href*="testflight"]')).toBeNull();
    expect(container.querySelector('a[href^="https://apps.apple.com"]')).toBeNull();
  });
});

test('without its name, the block is the status alone', () => {
  render(<DownloadBlock app="light" withName={false} />);
  expect(screen.queryByText('Stan Scribe Light')).toBeNull();
  expect(screen.queryByText('Free. The simple edition.')).toBeNull();
  expect(screen.getByText('Coming soon to the App Store')).toBeInTheDocument();
});
