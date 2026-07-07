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

// Routes whose page components render content block ids as DOM anchors (e.g.
// InterestSection renders <section id={id}>). Content-derived #fragments are only
// valid on these routes — portfolio/home/resume sections render no ids, so a
// #fragment link there would silently scroll nowhere.
export const ANCHOR_RENDERING_ROUTES = new Set(['/interests']);

// Anchors defined in page JSX rather than content markdown. '*' applies to every route.
// If a check fails with "unknown anchor" for an id that exists in a page's JSX, add it here.
export const EXTRA_ANCHORS = {
  '*': ['main'],                                          // layout.tsx skip-link target
  '/portfolio/environmental-justice-prisons': ['about'],  // EJ page section id
};

const HELP = 'see ANCHOR_RENDERING_ROUTES / EXTRA_ANCHORS in scripts/lib/content-check.mjs';

function collectIds(block, out) {
  out.add(block.id);
  for (const child of block.children) collectIds(child, out);
}

// Build route → Set(valid #fragments): JSX extras always; content ids only on routes
// that actually render them.
export function collectAnchors(pages, extra = {}) {
  const anchorsByRoute = new Map();
  for (const { name, page } of pages) {
    const route = ROUTE_BY_PAGE[name];
    if (!route) continue;
    const ids = new Set(extra['*'] || []);
    for (const a of extra[route] || []) ids.add(a);
    if (ANCHOR_RENDERING_ROUTES.has(route)) {
      for (const section of Object.values(page.sections)) collectIds(section, ids);
    }
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

const EXTERNAL_PROTOCOLS = new Set(['https:', 'http:', 'mailto:', 'tel:']);

export function checkIntegrity(pages, env) {
  const { publicFiles, routes, anchorsByRoute } = env;
  const errors = [];
  for (const { name, file, page } of pages) {
    const E = (msg) => errors.push(`${file}: ${msg}`);
    if (!(name in ROUTE_BY_PAGE)) {
      E(`page "${name}" is not in ROUTE_BY_PAGE — add it in scripts/lib/content-check.mjs so its links/anchors can be checked`);
    }
    for (const block of walk(page)) {
      if (block.image && !publicFiles.has(block.image.src)) {
        E(`image not found in public/: ${block.image.src} (block "${block.id}")`);
      }
      for (const link of block.links) {
        const href = link.href;
        if (href.startsWith('//')) {
          E(`protocol-relative link not supported (use https://): ${href} (block "${block.id}")`);
        } else if (href.startsWith('/')) {
          const hashAt = href.indexOf('#');
          let path = hashAt === -1 ? href : href.slice(0, hashAt);
          const fragment = hashAt === -1 ? undefined : href.slice(hashAt + 1);
          if (path === '') path = '/';
          const isPublicFile = publicFiles.has(path);
          if (!routes.has(path) && !isPublicFile) {
            E(`internal link target not found (no route or public/ file): ${href} (block "${block.id}")`);
          }
          // Fragments on public files (e.g. PDF #page=2) are viewer hints — skip.
          if (fragment !== undefined && !isPublicFile) {
            const anchors = anchorsByRoute.get(path);
            if (!anchors || !anchors.has(fragment)) {
              E(`unknown anchor "#${fragment}" on ${path}: ${href} — the target page does not render that id (${HELP}) (block "${block.id}")`);
            }
          }
        } else if (href.startsWith('#')) {
          const route = ROUTE_BY_PAGE[name];
          const anchors = route ? anchorsByRoute.get(route) : undefined;
          if (!anchors || !anchors.has(href.slice(1))) {
            E(`unknown same-page anchor ${href} (${HELP}) (block "${block.id}")`);
          }
        } else {
          let ok = false;
          try {
            ok = EXTERNAL_PROTOCOLS.has(new URL(href).protocol);
          } catch {}
          if (!ok) E(`malformed external link: ${href} (block "${block.id}")`);
        }
      }
    }
  }
  return errors;
}
