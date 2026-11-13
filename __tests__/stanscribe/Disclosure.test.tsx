import fs from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import { Disclosure } from '@/components/stanscribe/Disclosure';
import { IconTile } from '@/components/stanscribe/IconTile';
import * as icons from '@/components/stanscribe/icons';
import { findTypeViolations } from '@/test-utils/stanscribe';

test('a row is a details whose summary holds the label as an h3', () => {
  const { container } = render(<Disclosure label="No audio is saved"><p>It keeps none of the sound.</p></Disclosure>);
  const details = container.querySelector('details')!;
  const summary = details.querySelector('summary')!;
  expect(summary.querySelector('h3')?.textContent).toBe('No audio is saved');
  expect(summary.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  expect(details.querySelector('summary + div p')?.textContent).toBe('It keeps none of the sound.');
  expect(findTypeViolations(container)).toEqual([]);
});

test('a row is closed unless it is told to start open', () => {
  const { container, rerender } = render(<Disclosure label="Closed">words</Disclosure>);
  expect(container.querySelector('details')!.open).toBe(false);
  rerender(<Disclosure label="Open" open>words</Disclosure>);
  expect(container.querySelector('details')!.open).toBe(true);
});

test('the icon is optional and comes before the label', () => {
  const { container } = render(
    <Disclosure label="With icon" icon={<IconTile><icons.LockIcon /></IconTile>}>words</Disclosure>,
  );
  const summary = container.querySelector('summary')!;
  expect(summary.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  expect(summary.firstElementChild?.querySelector('svg')).not.toBeNull();
  expect(screen.getByText('With icon').tagName).toBe('H3');
});

test('a summary is tall enough to tap', () => {
  const { container } = render(<Disclosure label="Tap me">words</Disclosure>);
  expect(container.querySelector('summary')!.className).toMatch(/\bmin-h-16\b/);
});

test('the Start and Stop tiles take the app’s green and red', () => {
  const { container } = render(<><IconTile tone="start"><icons.StartIcon /></IconTile><IconTile tone="stop"><icons.StopIcon /></IconTile></>);
  const [start, stop] = Array.from(container.querySelectorAll('span[aria-hidden="true"]'));
  expect(start.className).toMatch(/bg-\[#1c7c45\]/);
  expect(stop.className).toMatch(/bg-\[#c0352b\]/);
});

test('every icon the pages use renders', () => {
  for (const [name, Icon] of Object.entries(icons)) {
    const { container, unmount } = render(<Icon />);
    expect([name, container.querySelector('svg') !== null]).toEqual([name, true]);
    unmount();
  }
});

test('the chevron takes the class it is given, so it turns when its row opens', () => {
  const { container } = render(<Disclosure label="Turns">words</Disclosure>);
  expect(container.querySelector('summary svg')!.getAttribute('class')).toMatch(/\bgroup-open:rotate-180\b/);
});

test('the icons are drawn in the file as static SVG: no icon library ships to the browser', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'components/stanscribe/icons.tsx'), 'utf8');
  expect(source).not.toMatch(/['"]lucide-react['"]/);
  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  expect({ ...pkg.dependencies, ...pkg.devDependencies }).not.toHaveProperty(['lucide-react']);
});
