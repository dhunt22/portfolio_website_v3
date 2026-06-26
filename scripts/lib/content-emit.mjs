// scripts/lib/content-emit.mjs
// Page sections object → deterministic TypeScript module source.
// JSON.stringify gives stable key order (objects are built in canonical order
// by the parser's clean()) and correct string escaping; the output is valid TS.

export function emitPage(constName, sourceFile, sections) {
  const banner =
    `// AUTO-GENERATED from content/${sourceFile} — do not edit by hand.\n` +
    `// Regenerate with: npm run content:sync\n\n`;
  const body = JSON.stringify(sections, null, 2);
  return (
    banner +
    `import type { PageContent } from '../_types';\n\n` +
    `export const ${constName} = ${body} satisfies PageContent;\n`
  );
}
