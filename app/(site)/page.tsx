// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(site)/page.tsx
// Home (DESIGN.md › Page blueprints › Home): the name on the breathing plate, then Selected work.

import Link from 'next/link';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { HighlightList, LeadProject } from '@/components/site/Highlights';
import { ReadoutDefault } from '@/components/site/Readout';
import { SITE_BUTTON, SITE_LINK, SITE_TYPE } from '@/components/site/type';
import { plateReading } from '@/lib/site/reading';
import { highlightEntries, prisonsFigure } from '@/lib/site/work';
import { cn } from '@/lib/utils';

export default function Home() {
  const [{ glyph: _glyph, ...lead }, ...highlights] = highlightEntries();
  return (
    <>
      <ContourBackdrop page="home" />
      <ReadoutDefault reading={plateReading('home')} />

      <section aria-labelledby="name" className="grid min-h-[min(76svh,760px)] content-start gap-7 px-gutter pb-16 pt-[clamp(40px,10vh,120px)]">
        <h1 id="name" className={cn(SITE_TYPE.display, 'halo')}>Devin Hunt</h1>
        <p className={cn(SITE_TYPE.lead, 'halo max-w-[30ch]')}>
          Water resources engineer in Sacramento. I model California’s groundwater and turn the slow, manual parts of
          that work into tested Python and AI tools.
        </p>
        <div className="halo flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/portfolio" className={SITE_BUTTON}>See the work</Link>
          <Link href="/resume" className={cn(SITE_LINK, 'font-site text-site-body')}>Résumé</Link>
        </div>
      </section>

      <section aria-labelledby="selected-title" className="band px-gutter">
        <h2 id="selected-title" className={SITE_TYPE.headline}>Selected work</h2>
        <p className={cn(SITE_TYPE.label, 'mt-2')}>
          Two projects, two tools, and an app. More on the <Link href="/portfolio" className={SITE_LINK}>portfolio</Link>.
        </p>
        <LeadProject
          entry={lead}
          figure={prisonsFigure()}
          description="Climate, exposure and proximity percentile scores for every prison in the study, combined into one vulnerability score per facility. Each dot is a prison."
        />
        <HighlightList entries={highlights} />
      </section>
    </>
  );
}
