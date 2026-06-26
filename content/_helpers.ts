// content/_helpers.ts
// Typed accessors used by pages (and tests). Throw loudly so a bad reference
// fails the build instead of rendering `undefined`.
import type { Block } from './_types';

export function child(block: Block, id: string): Block {
  const found = block.children.find((c) => c.id === id);
  if (!found) throw new Error(`content: no child "${id}" under "${block.id}"`);
  return found;
}

export function field(block: Block, key: string): string {
  const value = block.fields[key];
  if (value === undefined) throw new Error(`content: no field "${key}" on "${block.id}"`);
  return value;
}
