// test-utils/stanscribe-production.ts
// Import this before any app module to load lib/stanscribe as the production build does: netlify.toml sets
// the switch for that build only, and Next inlines it, so it is read once when the module loads.

process.env.NEXT_PUBLIC_STANSCRIBE_SUBDOMAIN = 'true';

export {};
