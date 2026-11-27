import { render } from '@testing-library/react';
import type { ComponentType } from 'react';
import * as icons from '@/components/stanscribe/icons';

const draw = (Icon: ComponentType) => render(<Icon />).container.querySelector('svg')!;
const filled = (svg: SVGSVGElement) => Array.from(svg.querySelectorAll('[fill="currentColor"]'));

test.each([
  ['StartIcon', 'mic.fill', 'rect'],
  ['StopIcon', 'stop.fill', 'rect'],
  ['LockIcon', 'lock.fill', 'rect'],
  ['LooksIcon', 'circle.lefthalf.filled', 'path'],
  ['SaveIcon', 'star', null],
] as const)('%s is solid where the app’s %s is', (name, _symbol, solid) => {
  const shapes = filled(draw(icons[name]));
  if (solid) expect(shapes.map((s) => s.tagName)).toEqual([solid]);
  else expect(shapes).toEqual([]);
});

test('the line drawings have nothing solid in them, as the app’s outlined symbols do not', () => {
  for (const name of ['CaptionsIcon', 'OfflineIcon', 'NoAccountIcon', 'DeviceIcon', 'NoTrackingIcon', 'NoAudioIcon', 'SendIcon', 'AskIcon', 'VoicesIcon', 'TextSizeIcon', 'SearchIcon', 'ConversationsIcon'] as const) {
    expect([name, filled(draw(icons[name]))]).toEqual([name, []]);
  }
});

test('Live captions is a speech bubble with two lines of captions, as the app’s captions.bubble is', () => {
  const svg = draw(icons.CaptionsIcon);
  expect(svg.querySelector('rect')).toBeNull();
  expect(svg.innerHTML).toContain('l-2.202 2.202');
  expect(svg.innerHTML).toContain('M7 13h4M15 13h2M7 9h2M13 9h4');
});

test('No account is a person in a circle with a cross beside it, as the app’s person.crop.circle.badge.xmark is', () => {
  const svg = draw(icons.NoAccountIcon);
  expect(svg.querySelectorAll('circle')).toHaveLength(1);
  expect(svg.innerHTML).toMatch(/a10 10 0 1 1/);
});

test('No audio is a waveform struck through, as the app’s waveform.slash is', () => {
  const paths = Array.from(draw(icons.NoAudioIcon).querySelectorAll('path')).map((p) => p.getAttribute('d'));
  expect(paths).toContain('m2 2 20 20');
  expect(paths.filter((d) => /^M\d+ [\d.]+v[\d.]+$/.test(d ?? ''))).toHaveLength(8);
});

test('the device is a phone with no home button, as the app’s iphone is', () => {
  expect(draw(icons.DeviceIcon).querySelector('path')).toBeNull();
});
