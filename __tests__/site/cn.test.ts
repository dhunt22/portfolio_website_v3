import { cn } from '@/lib/utils';
import { SITE_BUTTON, SITE_TYPE } from '@/components/site/type';

test('a site type size survives a following text colour', () => {
  const out = cn(SITE_TYPE.display, 'halo');
  expect(out).toContain('text-site-display');
  expect(out).toContain('text-ink-strong');
});

test('the button keeps its size and colour', () => {
  const out = cn(SITE_BUTTON, 'hidden');
  expect(out).toContain('text-site-body');
  expect(out).toContain('text-background');
});

test('site sizes still merge among themselves', () => {
  expect(cn('text-site-body', 'text-site-label')).toBe('text-site-label');
});
