import { fireEvent, render, screen } from '@testing-library/react';
import ResumePage from '@/app/(site)/resume/page';
import { ReadoutProvider, ReadoutStrip } from '@/components/site/Readout';

jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));

const renderPage = () =>
  render(
    <ReadoutProvider>
      <ReadoutStrip />
      <ResumePage />
    </ReadoutProvider>,
  );

test('the résumé opens with name, title, summary and the PDF', () => {
  renderPage();
  expect(screen.getByRole('heading', { level: 1, name: 'Devin Hunt' })).toBeInTheDocument();
  expect(screen.getByText('AI Specialist and Groundwater Modeler')).toBeInTheDocument();
  expect(screen.getByText(/guiding their early ideas toward production-ready solutions\./)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Download PDF/ })).toHaveAttribute('href', '/data/Resume_DevinHunt_Jun2026.pdf');
});

test('the header map: pins are buttons that name their project', () => {
  renderPage();
  expect(screen.getByRole('group', { name: "Map of California's watersheds with the places Devin has worked" })).toBeInTheDocument();
  const pins = screen.getAllByRole('button', { name: /, / });
  expect(pins).toHaveLength(4);
  const cuyama = screen.getByRole('button', { name: /Cuyama Valley Groundwater Basin/ });
  fireEvent.keyDown(cuyama, { key: 'Enter' });
  expect(screen.getByText('Cuyama Valley Groundwater Basin', { selector: 'b' })).toBeInTheDocument();
  expect(screen.getByTestId('readout')).toHaveTextContent('Cuyama Valley');
});

test('every résumé section is still there', () => {
  renderPage();
  for (const name of ['Experience', 'Education', 'Professional skills', 'Technical skills', 'Additional achievements']) {
    expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
  }
  expect(screen.getByText('Eagle Scout Award, Boy Scouts of America, August 2018')).toBeInTheDocument();
  expect(screen.getByText(/Supported a PhD dissertation on stream metabolism/)).toBeInTheDocument();
});

test('focusing a pin reports its place; blurring restores the default', () => {
  renderPage();
  const cuyama = screen.getByRole('button', { name: /Cuyama Valley Groundwater Basin/ });
  fireEvent.focus(cuyama);
  expect(screen.getByTestId('readout')).toHaveTextContent('Cuyama Valley');
  fireEvent.blur(cuyama);
  expect(screen.getByTestId('readout')).toHaveTextContent('Home base');
});

test('pointing at a pin reports its place, not the empty map', () => {
  renderPage();
  const circle = screen.getByRole('button', { name: /Cuyama Valley Groundwater Basin/ }).querySelector('circle')!;
  fireEvent.pointerMove(circle);
  expect(screen.getByTestId('readout')).toHaveTextContent('Cuyama Valley');
  expect(screen.getByTestId('readout')).not.toHaveTextContent('Outside California');
});
