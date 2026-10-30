// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(site)/portfolio/page.tsx
// Where the work is (DESIGN.md › Page blueprints › Portfolio): every project as its glyph, then the tools.

import type { Metadata } from 'next';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { ProjectsIndex } from '@/components/site/ProjectsIndex';
import { ReadoutDefault } from '@/components/site/Readout';
import { WorkList } from '@/components/site/WorkList';
import { HERO, SITE_TYPE } from '@/components/site/type';
import { pageMetadata } from '@/lib/site/metadata';
import { plateReading } from '@/lib/site/reading';
import { projectEntries, toolEntries } from '@/lib/site/work';
import { cn } from '@/lib/utils';

export const metadata: Metadata = pageMetadata(
  'Portfolio · Devin Hunt',
  'Groundwater, recharge and geospatial projects, most of them in California, and the tools Devin Hunt builds around them.',
  '/portfolio',
);

export default function PortfolioPage() {
  return (
    <>
      <ContourBackdrop page="portfolio" />
      <ReadoutDefault reading={plateReading('portfolio')} />

      <section aria-labelledby="page-title" className={cn(HERO, 'gap-[22px] pb-14 pt-[clamp(40px,9vh,104px)]')}>
        <h1 id="page-title" className={cn(SITE_TYPE.display, 'halo')}>Where the work is</h1>
        <p className={cn(SITE_TYPE.lead, 'halo max-w-[30ch]')}>
          Groundwater, recharge and geospatial projects, most of them in California, and the tools I build around them.
        </p>
      </section>

      <section aria-labelledby="projects-title" className="band px-frame">
        <h2 id="projects-title" className={SITE_TYPE.headline}>Projects</h2>
        <p className={cn(SITE_TYPE.label, 'mt-2 max-w-[60ch]')}>
          Each project is drawn as its place, or as the thing it measured. Open one for the full story.
        </p>
        <ProjectsIndex entries={projectEntries()} />
      </section>

      <section id="tools" aria-labelledby="tools-title" className="band px-frame">
        <h2 id="tools-title" className={SITE_TYPE.headline}>Tools</h2>
        <p className={cn(SITE_TYPE.label, 'mt-2 max-w-[60ch]')}>Software around the models, and one app outside them.</p>
        <WorkList id="tools-list" entries={toolEntries()} />
      </section>
    </>
  );
}
