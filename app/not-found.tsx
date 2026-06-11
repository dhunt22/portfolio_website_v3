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
    <div className="relative min-h-screen">
      <ContourBackdrop preset="americanRiver" />

      <div className="container relative z-10 mx-auto px-6">
        <section className="flex min-h-[82vh] max-w-3xl flex-col justify-center">
          <h1 className="display mb-4 text-[clamp(3rem,7vw,5.25rem)]">404</h1>
          <h2 className="display mb-10 text-3xl">Page Not Found</h2>

          <p className="mb-6 font-display text-xl text-ink-strong">
            Looks like this stream dried up!
          </p>

          <p className="mb-4 max-w-[40rem] leading-relaxed text-ink-body">
            The page you&apos;re looking for seems to have wandered off like water finding a new path.
            Let&apos;s get you back to familiar waters.
          </p>
          <p className="mb-12 max-w-[40rem] leading-relaxed text-ink-body">
            Don&apos;t worry &ndash; even the best explorers sometimes take unexpected detours.
            Every watershed eventually finds its way back to the main channel.
          </p>

          <nav aria-label="Site links" className="mb-16 flex flex-wrap gap-x-12 gap-y-4">
            <Link href="/" className="link-quiet">Return Home</Link>
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
        </section>
      </div>
    </div>
  );
}
