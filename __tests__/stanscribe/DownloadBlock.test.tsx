import { render, screen } from '@testing-library/react';
import { DownloadBlock } from '@/components/stanscribe/DownloadBlock';

test.each([
  ['scribe', 'Stan Scribe', 'Pay once. No subscription.', 'https://apps.apple.com/us/app/stan-scribe/id6822377139'],
  ['light', 'Stan Scribe Light', 'Free. The simple edition.', 'https://apps.apple.com/us/app/stan-scribe-light/id6824796578'],
] as const)('%s: its name, its offer and Apple’s badge linking to its App Store page', (app, name, offer, url) => {
  const { container } = render(<DownloadBlock app={app} />);
  expect(screen.getByText(offer)).toBeInTheDocument();
  const link = screen.getByRole('link', { name: `Download ${name} on the App Store` });
  expect(link).toHaveAttribute('href', url);
  expect(link.querySelector('img')).toHaveAttribute('src', '/images/stanscribe/app-store-badge.svg');
  expect(screen.queryByText(/coming soon/i)).toBeNull();
  expect(container.querySelector('a[href*="testflight"]')).toBeNull();
});

test('without its name, the block is the badge alone', () => {
  const { container } = render(<DownloadBlock app="light" withName={false} />);
  expect(screen.queryByText('Stan Scribe Light')).toBeNull();
  expect(screen.queryByText('Free. The simple edition.')).toBeNull();
  expect(container.querySelectorAll('a')).toHaveLength(1);
});
