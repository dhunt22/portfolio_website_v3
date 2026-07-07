// scripts/lib/content-check.mjs
// Pure asset/link integrity checks over parsed content pages. No fs — the CLI
// (scripts/check-content.mjs) supplies the environment snapshot.

// Page name (camelCased md basename) → site route. `null` = no route (site.md is footer/SEO).
export const ROUTE_BY_PAGE = {
  home: '/',
  portfolio: '/portfolio',
  portfolioEjPrisons: '/portfolio/environmental-justice-prisons',
  interests: '/interests',
  resume: '/resume',
  site: null,
};

// Anchors defined in page JSX rather than content markdown. '*' applies to every route.
// If a check fails with "unknown anchor" for an id that exists in a page's JSX, add it here.
export const EXTRA_ANCHORS = {
  '*': ['main'],                                          // layout.tsx skip-link target
  '/portfolio/environmental-justice-prisons': ['about'],  // EJ page section id
};

function collectIds(block, out) {
  out.add(block.id);
  for (const child of block.children) collectIds(child, out);
}

// Build route → Set(valid #fragments) from the parsed pages + the JSX extras.
export function collectAnchors(pages, extra = {}) {
  const anchorsByRoute = new Map();
  for (const { name, page } of pages) {
    const route = ROUTE_BY_PAGE[name];
    if (!route) continue;
    const ids = new Set(extra['*'] || []);
    for (const a of extra[route] || []) ids.add(a);
    for (const section of Object.values(page.sections)) collectIds(section, ids);
    anchorsByRoute.set(route, ids);
  }
  return anchorsByRoute;
}

function* walk(page) {
  function* visit(block) {
    yield block;
    for (const child of block.children) yield* visit(child);
  }
  for (const section of Object.values(page.sections)) yield* visit(section);
}

export function checkIntegrity(pages, env) {
  const { publicFiles, routes, anchorsByRoute } = env;
  const errors = [];
  for (const { file, page } of pages) {
    const E = (msg) => errors.push(`${file}: ${msg}`);
    for (const block of walk(page)) {
      if (block.image && !publicFiles.has(block.image.src)) {
        E(`image not found in public/: ${block.image.src} (block "${block.id}")`);
      }
      for (const link of block.links) {
        const href = link.href;
        if (href.startsWith('/')) {
          let [path, fragment] = href.split('#');
          if (path === '') path = '/';
          if (!routes.has(path) && !publicFiles.has(path)) {
            E(`internal link target not found (no route or public/ file): ${href} (block "${block.id}")`);
          }
          if (fragment !== undefined) {
            const anchors = anchorsByRoute.get(path);
            if (!anchors || !anchors.has(fragment)) {
              E(`unknown anchor "#${fragment}" on ${path}: ${href} — rename to a real section/card id or extend EXTRA_ANCHORS (block "${block.id}")`);
            }
          }
        } else {
          let ok = false;
          try {
            const u = new URL(href);
            ok = u.protocol === 'https:' || u.protocol === 'http:';
          } catch {}
          if (!ok) E(`malformed external link: ${href} (block "${block.id}")`);
        }
      }
    }
  }
  return errors;
}
