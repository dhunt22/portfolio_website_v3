import { fireEvent, render, screen, within } from '@testing-library/react';
import PortfolioPage from '@/app/(site)/portfolio/page';
import { ReadoutProvider, ReadoutStrip } from '@/components/site/Readout';

jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));

const renderPage = () =>
  render(
    <ReadoutProvider>
      <ReadoutStrip />
      <PortfolioPage />
    </ReadoutProvider>,
  );

test('headings', () => {
  renderPage();
  expect(screen.getByRole('heading', { level: 1, name: 'Where the work is' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: 'Projects' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: 'Tools' })).toBeInTheDocument();
});

test('every project and tool is an entry with a glyph', () => {
  const { container } = renderPage();
  expect(container.querySelectorAll('#projects-list > li')).toHaveLength(9);
  expect(container.querySelectorAll('#tools-list > li')).toHaveLength(5);
  expect(container.querySelectorAll('#projects-list svg.glyph')).toHaveLength(9);
  expect(container.querySelector('table')).toBeNull();
});

test('filters narrow the projects', () => {
  const { container } = renderPage();
  const filters = screen.getByRole('group', { name: 'Filter projects' });
  expect(within(filters).getAllByRole('button').map((b) => b.textContent)).toEqual([
    'All 9', 'Water resources 8', 'Geospatial 6', 'Research 1',
  ]);
  fireEvent.click(within(filters).getByRole('button', { name: 'Research 1' }));
  expect(within(filters).getByRole('button', { name: 'Research 1' })).toHaveAttribute('aria-pressed', 'true');
  const visible = Array.from(container.querySelectorAll('#projects-list > li')).filter((li) => !li.hasAttribute('hidden'));
  expect(visible).toHaveLength(1);
  expect(visible[0]).toHaveTextContent('Environmental Justice For Prisons');
});

test('details hold the full story and links', () => {
  const { container } = renderPage();
  const eej = container.querySelector('#prison-ej details')!;
  expect(within(eej as HTMLElement).getByRole('link', { name: /Open the project page/ })).toHaveAttribute('href', '/portfolio/environmental-justice-prisons');
  expect(eej).toHaveTextContent('Caitlin Mothes');
});

test('pointing at a project reads its place', () => {
  const { container } = renderPage();
  fireEvent.mouseEnter(container.querySelector('#cuyama-basin summary')!);
  const strip = screen.getByTestId('readout');
  expect(strip).toHaveTextContent('Cuyama Valley');
  expect(strip).toHaveTextContent('3-013');
});

afterEach(() => {
  window.location.hash = '';
});

test('a hash opens its entry', () => {
  window.location.hash = '#yuba-recharge';
  const { container } = renderPage();
  expect(container.querySelector('#yuba-recharge details')).toHaveAttribute('open');
});

test('a hash that is not an entry opens nothing', () => {
  window.location.hash = '#tools';
  const { container } = renderPage();
  expect(container.querySelectorAll('details[open]')).toHaveLength(0);
});

test('a malformed hash renders without throwing', () => {
  window.location.hash = '#%';
  expect(() => renderPage()).not.toThrow();
});

test('an entry without meta keeps its summary in the text column', () => {
  const { container } = renderPage();
  const summary = container.querySelector('#zbudget-dashboards summary')!.lastElementChild!;
  expect(summary).toHaveTextContent('IWFM model diagnostic');
  expect(summary).toHaveClass('min-[861px]:col-start-2');
});
