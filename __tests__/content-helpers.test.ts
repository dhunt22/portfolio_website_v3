// __tests__/content-helpers.test.ts
import { child, field } from '@/content/_helpers';
import type { Block } from '@/content/_types';

const block: Block = {
  id: 'parent', title: 'Parent', fields: { eyebrow: 'Hello' },
  body: [], items: [], links: [],
  children: [{ id: 'kid', title: 'Kid', fields: {}, body: [], items: [], links: [], children: [] }],
};

describe('content helpers', () => {
  it('child() returns the matching child', () => {
    expect(child(block, 'kid').title).toBe('Kid');
  });
  it('child() throws on a missing id', () => {
    expect(() => child(block, 'nope')).toThrow(/no child "nope"/);
  });
  it('field() returns the value', () => {
    expect(field(block, 'eyebrow')).toBe('Hello');
  });
  it('field() throws on a missing key', () => {
    expect(() => field(block, 'nope')).toThrow(/no field "nope"/);
  });
});
