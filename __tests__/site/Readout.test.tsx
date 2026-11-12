import { fireEvent, render, screen } from '@testing-library/react';
import { ReadoutDefault, ReadoutProvider, ReadoutStrip, useReadingHandlers } from '@/components/site/Readout';
import { labelReading, plateReading } from '@/lib/site/reading';

let mockPath = '/';
jest.mock('next/navigation', () => ({ usePathname: () => mockPath }));

function Pointer() {
  const handlers = useReadingHandlers(labelReading('Tool', 'PyPEST'));
  return <button {...handlers}>PyPEST</button>;
}

function Harness() {
  return (
    <ReadoutProvider>
      <ReadoutStrip />
      <ReadoutDefault reading={plateReading('portfolio')} />
      <Pointer />
    </ReadoutProvider>
  );
}

test('the strip shows the page default, then what is pointed at, then the default again', () => {
  render(<Harness />);
  const strip = screen.getByTestId('readout');
  expect(strip).toHaveTextContent('Grand Canyon, Arizona');
  fireEvent.mouseEnter(screen.getByRole('button', { name: 'PyPEST' }));
  expect(strip).toHaveTextContent('Tool');
  expect(strip).not.toHaveTextContent('Grand Canyon');
  fireEvent.mouseLeave(screen.getByRole('button', { name: 'PyPEST' }));
  expect(strip).toHaveTextContent('Grand Canyon, Arizona');
});

test('focus works like pointing', () => {
  render(<Harness />);
  fireEvent.focus(screen.getByRole('button', { name: 'PyPEST' }));
  expect(screen.getByTestId('readout')).toHaveTextContent('PyPEST');
  fireEvent.blur(screen.getByRole('button', { name: 'PyPEST' }));
  expect(screen.getByTestId('readout')).toHaveTextContent('Grand Canyon, Arizona');
});

test('wide fields hide on phones', () => {
  render(<Harness />);
  expect(screen.getByText('Lat').parentElement).toHaveClass('hidden', 'min-[861px]:inline');
});

test('handlers are inert without a provider', () => {
  render(<Pointer />);
  fireEvent.mouseEnter(screen.getByRole('button', { name: 'PyPEST' }));
});

test('following a link in place drops what was pointed at: the new page starts from its default', () => {
  mockPath = '/';
  const { rerender } = render(<Harness />);
  fireEvent.mouseEnter(screen.getByRole('button', { name: 'PyPEST' }));
  expect(screen.getByTestId('readout')).toHaveTextContent('PyPEST');
  mockPath = '/portfolio';
  rerender(<Harness />);
  expect(screen.getByTestId('readout')).toHaveTextContent('Grand Canyon, Arizona');
  expect(screen.getByTestId('readout')).not.toHaveTextContent('PyPEST');
});
