import { render, screen } from '@testing-library/react';
import { DownloadBlock } from '@/components/stanscribe/DownloadBlock';

jest.mock('@/lib/stanscribe', () => ({ ...jest.requireActual('@/lib/stanscribe'), RELEASED: true }));

test('after release the tile is the App Store badge link', () => {
  const { container } = render(<DownloadBlock app="scribe" />);
  expect(screen.getByRole('link', { name: 'Download Stan Scribe on the App Store' })).toHaveAttribute(
    'href',
    'https://apps.apple.com/app/id6822377139',
  );
  expect(screen.queryByText('Coming soon to the App Store')).toBeNull();
  expect(container.querySelector('a[href*="testflight"]')).toBeNull();
});
