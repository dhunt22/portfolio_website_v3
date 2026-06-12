// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/page.tsx
// The home page - where the watershed of information begins

import Image from 'next/image';
import Link from 'next/link';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';

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
          <p className="eyebrow-mono mb-6 animate-rise opacity-0 motion-reduce:animate-none motion-reduce:opacity-100">
            Water Resources Engineer &amp; Explorer
          </p>
          <h1 className="display mb-9 text-[clamp(3rem,7vw,5.25rem)] animate-rise opacity-0 [animation-delay:120ms] motion-reduce:animate-none motion-reduce:opacity-100">
            Devin Hunt
          </h1>
          <p className="lead mb-12 max-w-[34rem] animate-rise opacity-0 [animation-delay:260ms] motion-reduce:animate-none motion-reduce:opacity-100">
            Passionate about understanding and solving water resource challenges in California
            through data-driven approaches. Skilled in leveraging open-source data, spatial
            analysis, and groundwater modeling to support sustainable water management.
          </p>
          <nav aria-label="Hero" className="flex gap-12 animate-rise opacity-0 [animation-delay:400ms] motion-reduce:animate-none motion-reduce:opacity-100">
            <Link href="/portfolio" className="link-quiet-mono">Explore Portfolio</Link>
            <Link href="/resume" className="link-quiet-mono">View Resume</Link>
          </nav>
        </section>

        <section className="grid gap-12 py-12 md:grid-cols-2 md:items-center">
          <div className="relative aspect-[4/3] md:aspect-auto md:h-[380px]">
            <Image
              src="/images/profile.jpg"
              alt="Devin Hunt exploring nature - a water resources engineer in his element"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>
          <figure>
            <blockquote className="font-display italic text-xl leading-snug text-ink-strong">
              &ldquo;The world is big, and I want to have a good look at it before it gets dark.&rdquo;
            </blockquote>
            <figcaption className="eyebrow mt-4">John Muir</figcaption>
          </figure>
        </section>

        <section className="pt-12 pb-0">
          <div className="panel">
            <h2 className="eyebrow mb-10">Professional Expertise</h2>
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

        <section className="pt-8 pb-12">
          <div className="panel">
            <h2 className="eyebrow mb-10">Personal Passions</h2>
            <div className="grid gap-12 md:grid-cols-2">
              <Link href="/interests#exploration" className="group block">
                <h3 className="mb-1 font-display text-xl text-ink-strong transition-colors group-hover:text-eyebrow">
                  Exploration
                </h3>
                <p className="mb-3 font-sans text-xs tracking-mono text-ink-muted">
                  Discovering remote natural places
                </p>
                <p className="leading-relaxed text-ink-body">
                  Traveling in my First Generation Tundra to reach desolate areas, always in search of
                  quieter places to fully immerse in nature.
                </p>
              </Link>

              <Link href="/interests#fishing" className="group block">
                <h3 className="mb-1 font-display text-xl text-ink-strong transition-colors group-hover:text-eyebrow">
                  Fishing
                </h3>
                <p className="mb-3 font-sans text-xs tracking-mono text-ink-muted">
                  Learning about streams from within
                </p>
                <p className="leading-relaxed text-ink-body">
                  Fishing nearly all water features encountered, understanding how fish tell stories
                  about water quality, color, cover types, and food sources.
                </p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
