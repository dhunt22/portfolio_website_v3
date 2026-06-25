// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/not-found.tsx
// A 404 page that flows like a river finding its way back to the source!

import Link from 'next/link';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';

/**
 * 404 Not Found page component
 * @returns {React.JSX.Element} The rendered 404 page
 */
export default function NotFound() {
  return (
    <div className="relative min-h-svh">
      <ContourBackdrop page="notFound" />

      <div className="container relative z-10 mx-auto px-6">
        <section className="flex min-h-[82svh] max-w-3xl flex-col justify-center">
          {/* Decorative error code — not a heading, so AT lands on the real h1 below. */}
          <p className="display mb-8 text-[clamp(3rem,7vw,5.25rem)]">404</p>

          <div className="panel">
            <h1 className="display mb-4 text-3xl">Page Not Found</h1>

            <p className="mb-8 max-w-[40rem] leading-relaxed text-ink-body">
              Looks like this stream dried up &mdash; the page wandered off like water finding
              a new path. Here&apos;s the way back to familiar waters.
            </p>

            {/* Recovery first, before the closing flourish. Return Home is the primary path. */}
            <nav aria-label="Site links" className="mb-12 flex flex-wrap items-center gap-x-8 gap-y-3">
              <Link href="/" className="link-quiet text-ink-strong">Return Home</Link>
              <Link href="/portfolio" className="link-quiet">View Portfolio</Link>
              <Link href="/resume" className="link-quiet">Resume</Link>
              <Link href="/interests" className="link-quiet">Interests</Link>
              <a href="mailto:contact@devinhunt.com" className="link-quiet">contact@devinhunt.com</a>
            </nav>

            <figure>
              <blockquote className="font-display italic text-xl leading-snug text-ink-strong">
                &ldquo;The best way out is always through.&rdquo;
              </blockquote>
              <figcaption className="eyebrow mt-4">Robert Frost</figcaption>
            </figure>
          </div>
        </section>
      </div>
    </div>
  );
}
