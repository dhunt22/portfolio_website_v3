import { render, screen, within } from '@testing-library/react';
import { ComparisonTable } from '@/components/stanscribe/ComparisonTable';
import { HelpBlock } from '@/components/stanscribe/HelpBlock';
import { PhoneShot } from '@/components/stanscribe/PhoneShot';
import { SHOTS, legalLinks } from '@/lib/stanscribe';

test('HelpBlock shows the support email and only the named apps’ legal links', () => {
  const { container } = render(<HelpBlock apps={['light']} />);
  expect(screen.getByRole('link', { name: 'stanscribe@devinhunt.com' })).toHaveAttribute('href', 'mailto:stanscribe@devinhunt.com');
  for (const { href } of legalLinks('light')) expect(container.querySelector(`a[href="${href}"]`)).not.toBeNull();
  for (const { href } of legalLinks('scribe')) expect(container.querySelector(`a[href="${href}"]`)).toBeNull();
});

test('ComparisonTable has real headers and four rows, one per difference a buyer weighs', () => {
  const { container } = render(<ComparisonTable />);
  const table = screen.getByRole('table');
  expect(within(table).getAllByRole('columnheader').map((th) => th.textContent)).toEqual(
    expect.arrayContaining(['Stan Scribe', 'Stan Scribe Light']),
  );
  expect(within(table).getAllByRole('rowheader').map((th) => th.textContent)).toEqual(['Price', 'Speech models', 'Looks', 'Download']);
  // The icons are decoration, not images with names to read.
  expect(container.querySelector('img')).toBeNull();
  expect(table.querySelectorAll('thead span[aria-hidden="true"]')).toHaveLength(2);
});

test('ComparisonTable draws its columns: a frame, a filled header row and a rule beside each app’s column', () => {
  render(<ComparisonTable />);
  const table = screen.getByRole('table');
  expect(table.className).toMatch(/\bborder-2\b/);
  expect(table.querySelector('thead tr')!.className).toMatch(/\bbg-muted\b/);
  for (const row of Array.from(table.querySelectorAll('tr'))) {
    const [, scribe, light] = Array.from(row.children);
    expect(scribe.className).toMatch(/\bborder-l\b/);
    expect(light.className).toMatch(/\bborder-l\b/);
  }
});

test('ComparisonTable sets both apps’ icons at the top of the header row, so they stay level when a name wraps', () => {
  render(<ComparisonTable />);
  const headers = screen.getAllByRole('columnheader');
  expect(headers.map((th) => th.textContent)).toEqual(['Stan Scribe', 'Stan Scribe Light']);
  for (const th of headers) {
    expect(th.className).toMatch(/\balign-top\b/);
    expect(th.className).not.toMatch(/\balign-bottom\b/);
  }
});

test('HelpBlock and Section pass a class to their section', () => {
  const { container } = render(<HelpBlock apps={['light']} className="pt-40" />);
  expect(container.querySelector('section#help')!.className).toMatch(/\bpt-40\b/);
});

test('PhoneShot passes a style to its image, for a picture that hangs into the next band', () => {
  const { container } = render(<PhoneShot image={SHOTS.hero} style={{ marginBottom: '-4rem' }} />);
  expect(container.querySelector('img')!.style.marginBottom).toBe('-4rem');
});
