import { render, screen, within } from '@testing-library/react';
import { ComparisonTable } from '@/components/stanscribe/ComparisonTable';
import { HelpBlock } from '@/components/stanscribe/HelpBlock';
import { APPS } from '@/lib/stanscribe';

test('HelpBlock shows the support email and only the named apps’ legal links', () => {
  const { container } = render(<HelpBlock apps={['light']} />);
  expect(screen.getByRole('link', { name: 'stanscribe@devinhunt.com' })).toHaveAttribute('href', 'mailto:stanscribe@devinhunt.com');
  for (const { href } of APPS.light.legal) expect(container.querySelector(`a[href="${href}"]`)).not.toBeNull();
  for (const { href } of APPS.scribe.legal) expect(container.querySelector(`a[href="${href}"]`)).toBeNull();
});

test('ComparisonTable has real column and row headers', () => {
  render(<ComparisonTable />);
  const table = screen.getByRole('table');
  expect(within(table).getAllByRole('columnheader').map((th) => th.textContent)).toEqual(
    expect.arrayContaining(['Stan Scribe', 'Stan Scribe Light']),
  );
  expect(within(table).getAllByRole('rowheader')).toHaveLength(14);
});
