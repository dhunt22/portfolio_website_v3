// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/portfolio/environmental-justice-prisons/page.tsx
// Environmental Justice For Prisons - dedicated project page (server shell)

import Link from 'next/link';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { IndicatorBrowser } from '@/components/portfolio/IndicatorBrowser';
import { portfolioEjPrisons as ej } from '@/content/generated/portfolioEjPrisons';
import { child } from '@/content/_helpers';
import type { Block } from '@/content/_types';

/**
 * Environmental Justice For Prisons - Dedicated Project Page
 * A comprehensive overview of the NASA-funded research project
 */
export default function EnvironmentalJusticePrisonsPage(): JSX.Element {
  const overview = ej.projectOverview as Block;
  const objectives = child(overview, 'key-project-objectives');
  const team = ej.projectTeamAndMyContribution as Block;
  const research = child(team, 'research-team');
  const role = child(team, 'my-role-and-contributions');
  const impact = child(team, 'project-impact-and-recognition');

  return (
    <div className="relative min-h-svh">
      <ContourBackdrop page="ej" />

      <div className="container relative z-10 mx-auto px-6">
        {/* Hero — compact so the dashboard enters the first viewport on desktop */}
        <header className="pt-8 pb-8">
          <p className="eyebrow mb-6">{ej.header.fields.eyebrow}</p>
          <h1 className="display text-4xl">
            {ej.header.fields.heading}
          </h1>
          <p className="lead mt-6 max-w-[40rem]">
            {ej.header.body[0]}
          </p>
          <nav aria-label="Project links" className="mt-8 flex flex-wrap gap-8">
            <a
              href={ej.header.links[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-quiet"
              aria-label="View GitHub repository for NASA Prison Environmental Justice project"
            >
              {ej.header.links[0].label}
            </a>
            <a
              href={ej.header.links[1].href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-quiet"
              aria-label="Visit NASA Applied Sciences project page"
            >
              {ej.header.links[1].label}
            </a>
          </nav>
        </header>

        {/* Dashboard — map leads as the primary element */}
        <section className="panel mb-4" aria-labelledby="indicators-heading">
          <h2 id="indicators-heading" className="section-title mb-6">{ej.environmentalRiskIndicators.title}</h2>
          <IndicatorBrowser />
        </section>

        {/* About — Project Overview */}
        <section id="about" className="panel mb-4" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="section-title mb-6">{overview.title}</h2>
          <div className="xl:grid xl:grid-cols-[minmax(0,40rem)_1fr] xl:gap-10 xl:items-start">
            {/* Overview paragraphs (left column on xl; single column below) */}
            <div className="max-w-[40rem] space-y-6 leading-relaxed text-ink-body xl:max-w-none">
              {overview.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Key Project Objectives (right column on xl) */}
            <div className="mt-6 leading-relaxed text-ink-body xl:mt-0">
              <h3 className="mb-3 font-display text-xl text-ink-strong">{objectives.title}</h3>
              <ul className="list-disc space-y-2 pl-5 marker:text-eyebrow">
                {objectives.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Long-form read — Project Team & Impact */}
        <section className="panel mb-4" aria-labelledby="team-heading">
          <h2 id="team-heading" className="section-title mb-6">{team.title}</h2>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div>
              <h3 className="mb-4 font-display text-xl text-ink-strong">{research.title}</h3>
              <div className="space-y-4 leading-relaxed text-ink-body">
                {research.children.map((person) => (
                  <div key={person.id}>
                    <p className="text-ink-strong">{person.title}</p>
                    <p className="text-sm">{person.body[0]}</p>
                    <p className="text-sm">{person.body[1]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-display text-xl text-ink-strong">{role.title}</h3>
              <div className="space-y-4 leading-relaxed text-ink-body">
                <p>
                  {role.body[0]}
                </p>
                <ul className="list-disc space-y-2 pl-5 marker:text-eyebrow">
                  {role.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 max-w-[40rem]">
            <h3 className="mb-4 font-display text-xl text-ink-strong">{impact.title}</h3>
            <div className="space-y-6 leading-relaxed text-ink-body">
              {impact.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <figure className="mt-8">
              <blockquote className="font-display italic text-xl leading-snug text-ink-strong">
                &ldquo;{impact.quote!.text}&rdquo;
              </blockquote>
              <figcaption className="eyebrow mt-4">&mdash; {impact.quote!.author}</figcaption>
            </figure>

            <p className="mt-8 text-sm text-ink-muted">
              {impact.fields.thanks}
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="panel" aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="section-title mb-6">{ej.exploreTheResearch.title}</h2>
          <p className="max-w-[40rem] leading-relaxed text-ink-body">
            {ej.exploreTheResearch.body[0]}
          </p>
          <nav aria-label="Research links" className="mt-8 flex flex-wrap gap-8">
            <Link href={ej.exploreTheResearch.links[0].href} className="link-quiet">{ej.exploreTheResearch.links[0].label}</Link>
          </nav>
        </section>
      </div>
    </div>
  );
}
