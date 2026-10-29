// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/SiteFooter.tsx
// The portfolio's footer (DESIGN.md › Footer): one quiet line on a band.

const LINK = 'text-ink-strong underline decoration-1 underline-offset-[0.2em] hover:decoration-2';

export function SiteFooter() {
  return (
    <footer className="flex flex-wrap gap-x-7 gap-y-2 bg-site-band px-frame pb-12 pt-10 font-site text-site-label text-ink-muted print:hidden">
      <span>Devin Hunt · Sacramento, California</span>
      <a href="mailto:contact@devinhunt.com" className={LINK}>contact@devinhunt.com</a>
      <a href="https://github.com/dhunt22" target="_blank" rel="noopener noreferrer" className={LINK}>GitHub</a>
      <a href="https://www.linkedin.com/in/devinthunt" target="_blank" rel="noopener noreferrer" className={LINK}>LinkedIn</a>
    </footer>
  );
}
