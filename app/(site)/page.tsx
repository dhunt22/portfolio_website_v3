// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/(site)/page.tsx
// The home page - where the watershed of information begins

import Image from 'next/image';
import Link from 'next/link';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { HeroLoadIn } from '@/components/ui/HeroLoadIn';
import { PhoneShot } from '@/components/stanscribe/PhoneShot';
import { SHOTS } from '@/lib/stanscribe';

/**
 * Home page component displaying introduction and highlights
 * @returns {React.JSX.Element} The rendered home page
 */
export default function Home() {
  return (
    <div className="relative min-h-svh">
      <ContourBackdrop page="home" />

      <div className="container relative z-10 mx-auto px-6">
        <section className="grid items-center gap-10 py-16 sm:gap-12 lg:min-h-[82svh] lg:grid-cols-[minmax(0,36rem)_1fr] lg:gap-12 lg:py-0">
          <HeroLoadIn>
            <p className="eyebrow-mono mb-6">
              Water Resources Engineer &amp; Explorer
            </p>
            <h1 className="display mb-9 text-[clamp(3rem,7vw,5.25rem)]">
              Devin Hunt
            </h1>
            <p className="lead mb-12 max-w-[34rem] font-medium">
              Passionate about understanding and solving water resource challenges in California
              through data-driven approaches. Skilled in leveraging open-source data, spatial
              analysis, and groundwater modeling to support sustainable water management.
            </p>
            <nav aria-label="Hero" className="flex gap-12">
              <Link href="/portfolio" className="link-quiet-mono">Explore Portfolio</Link>
              <Link href="/resume" className="link-quiet-mono">View Resume</Link>
            </nav>
          </HeroLoadIn>

          {/* Headshot framed with a caption plate beneath it. Sits to the right of the
              hero text on desktop (lg); stacks below it on mobile. */}
          <figure className="mx-auto w-full max-w-[20rem] lg:mx-0 lg:justify-self-end">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded border border-border">
              <Image
                src="/images/devin_businessCasualCrag.webp"
                alt="Devin Hunt smiling in a knit tie and short-sleeve shirt against a sandstone crag"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 20rem, 320px"
              />
            </div>
            <figcaption className="mt-3 rounded border border-border bg-card px-4 py-3 text-sm italic leading-snug text-ink-body">
              Business casual climbing at The Mill Climbing Area near Chico, CA — October 2023
            </figcaption>
          </figure>
        </section>

        <section aria-labelledby="stanscribe-feature-title" className="pt-6 pb-0">
          <div className="panel">
            <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] md:gap-12">
              <div>
                <p className="eyebrow-mono mb-4">An app for my grandpa</p>
                <h2 id="stanscribe-feature-title" className="section-title mb-4">Stan Scribe</h2>
                <p className="mb-6 max-w-[38rem] leading-relaxed text-ink-body">
                  My grandpa Stan is hard of hearing. Live captions changed the conversations my family could have
                  with him, but the apps we found all charged a monthly fee. So I used AI to build one that reaches as
                  many people as possible: live captions in color, a free edition, and no subscription.
                </p>
                <nav aria-label="Stan Scribe" className="flex flex-wrap gap-x-10 gap-y-2">
                  <Link href="/stanscribe" className="link-quiet-mono">
                    Meet Stan Scribe <span aria-hidden="true">→</span>
                  </Link>
                  <Link href="/stanscribe#story" className="link-quiet-mono">
                    How I built it <span aria-hidden="true">→</span>
                  </Link>
                </nav>
              </div>
              <PhoneShot image={SHOTS.bothApps} className="mx-auto max-w-[15rem]" />
            </div>
          </div>
        </section>

        <section className="pt-4 pb-0">
          <div className="panel">
            <h2 className="section-title mb-8">Professional Expertise</h2>
            <div className="grid gap-12 md:grid-cols-3">
              <div>
                <h3 className="mb-3 font-display text-xl text-ink-strong">Water Resources Engineering</h3>
                <p className="leading-relaxed text-ink-body">
                  Development of CA SGMA Groundwater Sustainability Plans (GSPs), groundwater budgets,
                  and optimization of recharge and extraction through geospatial analyses.
                </p>
              </div>
              <div>
                <h3 className="mb-3 font-display text-xl text-ink-strong">Geospatial Analysis</h3>
                <p className="leading-relaxed text-ink-body">
                  Expertise in ArcGIS Pro, QGIS, and cartography. Creating innovative solutions
                  to visualize and analyze water resource data.
                </p>
              </div>
              <div>
                <h3 className="mb-3 font-display text-xl text-ink-strong">Data-Driven Approaches</h3>
                <p className="leading-relaxed text-ink-body">
                  Utilization of Python, R, and SQL to process large datasets and develop
                  automated workflows for water resource management.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-4 pb-6">
          <div className="panel">
            <h2 className="section-title mb-8">Personal Passions</h2>
            <div className="grid gap-12 md:grid-cols-2">
              <Link href="/interests#exploration" className="group block">
                <h3 className="mb-1 font-display text-xl text-ink-strong transition-colors group-hover:text-eyebrow">
                  Exploration
                </h3>
                <p className="mb-3 text-sm text-ink-muted">
                  Discovering remote natural places
                </p>
                <p className="leading-relaxed text-ink-body">
                  Traveling in my First Generation Tundra to reach desolate areas, always in search of
                  quieter places to fully immerse in nature.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-caps text-link transition-all group-hover:gap-2.5">
                  Read more <span aria-hidden="true">→</span>
                </span>
              </Link>

              <Link href="/interests#fishing" className="group block">
                <h3 className="mb-1 font-display text-xl text-ink-strong transition-colors group-hover:text-eyebrow">
                  Fishing
                </h3>
                <p className="mb-3 text-sm text-ink-muted">
                  Learning about streams from within
                </p>
                <p className="leading-relaxed text-ink-body">
                  Fishing nearly all water features encountered, understanding how fish tell stories
                  about water quality, color, cover types, and food sources.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-caps text-link transition-all group-hover:gap-2.5">
                  Read more <span aria-hidden="true">→</span>
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
