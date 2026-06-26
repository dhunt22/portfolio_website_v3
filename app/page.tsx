// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/page.tsx
// The home page - where the watershed of information begins

import Image from 'next/image';
import Link from 'next/link';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { HeroLoadIn } from '@/components/ui/HeroLoadIn';
import { home } from '@/content/generated/home';

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
              {home.hero.fields.eyebrow}
            </p>
            <h1 className="display mb-9 text-[clamp(3rem,7vw,5.25rem)]">
              {home.hero.fields.heading}
            </h1>
            <p className="lead mb-12 max-w-[34rem] font-medium">
              {home.hero.body[0]}
            </p>
            <nav aria-label="Hero" className="flex gap-12">
              {home.hero.links.map((link) => (
                <Link key={link.href} href={link.href} className="link-quiet-mono">{link.label}</Link>
              ))}
            </nav>
          </HeroLoadIn>

          {/* Headshot framed with a caption plate beneath it. Sits to the right of the
              hero text on desktop (lg); stacks below it on mobile. */}
          <figure className="mx-auto w-full max-w-[20rem] lg:mx-0 lg:justify-self-end">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded border border-border">
              <Image
                src={home.hero.image!.src}
                alt={home.hero.image!.alt}
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 20rem, 320px"
              />
            </div>
            <figcaption className="mt-3 rounded border border-border bg-card px-4 py-3 text-sm italic leading-snug text-ink-body">
              {home.hero.image!.caption}
            </figcaption>
          </figure>
        </section>

        <section className="pt-6 pb-0">
          <div className="panel">
            <h2 className="section-title mb-8">{home.professionalExpertise.title}</h2>
            <div className="grid gap-12 md:grid-cols-3">
              {home.professionalExpertise.children.map((card) => (
                <div key={card.id}>
                  <h3 className="mb-3 font-display text-xl text-ink-strong">{card.title}</h3>
                  <p className="leading-relaxed text-ink-body">
                    {card.body[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-4 pb-6">
          <div className="panel">
            <h2 className="section-title mb-8">{home.personalPassions.title}</h2>
            <div className="grid gap-12 md:grid-cols-2">
              {home.personalPassions.children.map((card) => (
                <Link key={card.id} href={card.links[0].href} className="group block">
                  <h3 className="mb-1 font-display text-xl text-ink-strong transition-colors group-hover:text-eyebrow">
                    {card.title}
                  </h3>
                  <p className="mb-3 text-sm text-ink-muted">
                    {card.fields.subtitle}
                  </p>
                  <p className="leading-relaxed text-ink-body">
                    {card.body[0]}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-caps text-link transition-all group-hover:gap-2.5">
                    Read more <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
