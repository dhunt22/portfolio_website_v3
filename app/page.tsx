// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/page.tsx
// The home page - where the watershed of information begins

import Image from 'next/image';
import Link from 'next/link';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { HeroLoadIn } from '@/components/ui/HeroLoadIn';

/**
 * Home page component displaying introduction and highlights
 * @returns {React.JSX.Element} The rendered home page
 */
export default function Home() {
  return (
    <div className="relative min-h-svh">
      <ContourBackdrop page="home" />

      <div className="container relative z-10 mx-auto px-6">
        <section className="flex min-h-[82svh] max-w-3xl flex-col justify-center">
          <HeroLoadIn>
            <p className="eyebrow-mono mb-6">
              Water Resources Engineer &amp; Explorer
            </p>
            <h1 className="display mb-9 text-[clamp(3rem,7vw,5.25rem)]">
              Devin Hunt
            </h1>
            <p className="lead mb-12 max-w-[34rem]">
              Passionate about understanding and solving water resource challenges in California
              through data-driven approaches. Skilled in leveraging open-source data, spatial
              analysis, and groundwater modeling to support sustainable water management.
            </p>
            <nav aria-label="Hero" className="flex gap-12">
              <Link href="/portfolio" className="link-quiet-mono">Explore Portfolio</Link>
              <Link href="/resume" className="link-quiet-mono">View Resume</Link>
            </nav>
          </HeroLoadIn>
        </section>

        <section className="py-12">
          <figure className="grid items-center gap-12 md:grid-cols-2">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[20rem] overflow-hidden rounded md:mx-0">
              <Image
                src="/images/devin_businessCasualCrag.webp"
                alt="Devin Hunt smiling in a knit tie and short-sleeve shirt against a sandstone crag"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 320px"
              />
            </div>
            <figcaption className="max-w-[34rem] font-display text-xl italic leading-snug text-ink-strong">
              This photo was taken at the Mill climbing area near Chico, CA. I find it fun
              to climb in business casual.
            </figcaption>
          </figure>
        </section>

        <section className="pt-6 pb-0">
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
