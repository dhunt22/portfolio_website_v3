// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/(site)/portfolio/environmental-justice-prisons/page.tsx
// Environmental Justice For Prisons - dedicated project page (server shell)

import type { Metadata } from 'next';
import type { JSX } from 'react';
import Link from 'next/link';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { IndicatorBrowser } from '@/components/portfolio/IndicatorBrowser';
import { ReadoutDefault } from '@/components/site/Readout';
import { HERO, SITE_LINK, SITE_TYPE } from '@/components/site/type';
import { labelReading } from '@/lib/site/reading';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Environmental Justice For Prisons · Devin Hunt',
  description: 'Leveraging NASA Earth Science Data to Map Environmental Injustices in U.S. Prisons',
  openGraph: { title: 'Environmental Justice For Prisons · Devin Hunt', description: 'Leveraging NASA Earth Science Data to Map Environmental Injustices in U.S. Prisons', url: 'https://devinhunt.com/portfolio/environmental-justice-prisons' },
  twitter: { title: 'Environmental Justice For Prisons · Devin Hunt', description: 'Leveraging NASA Earth Science Data to Map Environmental Injustices in U.S. Prisons' },
};

/**
 * Environmental Justice For Prisons - Dedicated Project Page
 * A comprehensive overview of the NASA-funded research project
 */
export default function EnvironmentalJusticePrisonsPage(): JSX.Element {
  return (
    <>
      <ContourBackdrop page="ej" />
      <ReadoutDefault reading={labelReading('Prisons', '1,865 across the United States')} />
        {/* Hero — compact so the dashboard enters the first viewport on desktop */}
        <header className={cn(HERO, 'gap-5 pb-12 pt-[clamp(32px,6vh,72px)]')}>
          <h1 className={cn(SITE_TYPE.display, 'halo max-w-[18ch]')}>
            Environmental Justice For Prisons
          </h1>
          <p className={cn(SITE_TYPE.label, 'halo')}>Geospatial analysis · NASA grant project · 2022 to 2023</p>
          <p className={cn(SITE_TYPE.lead, 'halo max-w-[40rem]')}>
            Leveraging NASA Earth Science Data to Map Environmental Injustices in U.S. Prisons
          </p>
          <nav aria-label="Project links" className="halo flex flex-wrap justify-center gap-8">
            <a
              href="https://github.com/GeospatialCentroid/NASA-prison-EJ/releases/tag/v2023-1"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(SITE_LINK, 'font-site text-site-body')}
              aria-label="View GitHub repository for NASA Prison Environmental Justice project"
            >
              Published Dataset
            </a>
            <a
              href="https://ui.adsabs.harvard.edu/abs/2023AGUFMINV31C0.1M/abstract"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(SITE_LINK, 'font-site text-site-body')}
              aria-label="Visit NASA Applied Sciences project page"
            >
              Publication
            </a>
          </nav>
        </header>

        {/* Dashboard — map leads as the primary element */}
        <section className="band px-frame" aria-labelledby="indicators-heading">
          <h2 id="indicators-heading" className={cn(SITE_TYPE.headline, 'mb-6')}>Environmental Risk Indicators</h2>
          <IndicatorBrowser />
        </section>

        {/* About — Project Overview */}
        <section id="about" className="band px-frame" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={cn(SITE_TYPE.headline, 'mb-6')}>Project Overview</h2>
          <div className="max-w-[76rem] xl:grid xl:grid-cols-[minmax(0,40rem)_minmax(0,1fr)] xl:items-start xl:gap-10">
            {/* Overview paragraphs (left column on xl; single column below) */}
            <div className={cn(SITE_TYPE.body, 'max-w-[40rem] space-y-6 xl:max-w-none')}>
              <p>
                Despite documented environmental injustices in U.S. prisons, this area remains understudied. Prisons are EJ communities by definition&mdash;overrepresented by people of color, indigenous persons, and low-income individuals who cannot escape environmental health threats. This groundbreaking research initiative was funded by NASA&apos;s $100,000 Equity and Environmental Justice Grant to address this critical gap.
              </p>

              <p>
                This research leverages NASA&apos;s Earth science data&mdash;including satellite, land cover, climate, and air quality datasets&mdash;to characterize environmental harms faced by incarcerated people across all U.S. state and federal prisons. The method incorporates 11 environmental indicators grouped into three components: climate risk (heat index, canopy cover, wildfire risk and flood hazard), environmental exposures (ozone, PM 2.5, pesticide use, and traffic density), and environmental effects (proximity to superfund sites, risk management plan facilities and hazardous waste sites).
              </p>

              <p>
                Explore the interactive map below to visualize how these environmental factors impact prisons across the United States.
              </p>
            </div>

            {/* Key Project Objectives (right column on xl) */}
            <div className={cn(SITE_TYPE.body, 'mt-6 max-w-[40rem] xl:mt-0')}>
              <h3 className={cn(SITE_TYPE.title, 'mb-3')}>Key Project Objectives</h3>
              <ul className="list-disc space-y-2 pl-5">
                <li>Quantify environmental conditions at all 1,865 state and federal prisons in the U.S.</li>
                <li>Calculate a standardized vulnerability index for each prison</li>
                <li>Create an open-access geospatial dataset and reproducible code base</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Long-form read — Project Team & Impact */}
        <section className="band px-frame" aria-labelledby="team-heading">
          <h2 id="team-heading" className={cn(SITE_TYPE.headline, 'mb-6')}>Project Team &amp; My Contribution</h2>

          <div className="grid max-w-[76rem] grid-cols-1 gap-12 md:grid-cols-2">
            <div>
              <h3 className={cn(SITE_TYPE.title, 'mb-4')}>Research Team</h3>
              <div className={cn(SITE_TYPE.body, 'space-y-4')}>
                <div>
                  <p className="text-ink-strong">Dr. Caitlin Mothes</p>
                  <p className={SITE_TYPE.label}>Principal Investigator, Research and Program Coordinator</p>
                  <p className={SITE_TYPE.label}>Geospatial Centroid, Colorado State University</p>
                </div>
                <div>
                  <p className="text-ink-strong">Dan Carver</p>
                  <p className={SITE_TYPE.label}>Geospatial Technical Manager</p>
                  <p className={SITE_TYPE.label}>Geospatial Centroid, Colorado State University</p>
                </div>
                <div>
                  <p className="text-ink-strong">Dr. Carrie Chennault</p>
                  <p className={SITE_TYPE.label}>Assistant Professor of Geography</p>
                  <p className={SITE_TYPE.label}>Prison Agriculture Lab, Colorado State University</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className={cn(SITE_TYPE.title, 'mb-4')}>My Role &amp; Contributions</h3>
              <div className={cn(SITE_TYPE.body, 'space-y-4')}>
                <p>
                  As a Geospatial Analyst and Programmer at the Geospatial Centroid, I worked closely with
                  Caitlin Mothes to develop R-spatial scripts for data processing and analysis.
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Processed open-source datasets for environmental indicators</li>
                  <li>Calculated percentile scores for climate, exposure, and effects categories</li>
                  <li>Developed vulnerability scoring algorithms combining all risk factors</li>
                  <li>Contributed to repository management and large dataset processing workflows</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 max-w-[40rem]">
            <h3 className={cn(SITE_TYPE.title, 'mb-4')}>Project Impact &amp; Recognition</h3>
            <div className={cn(SITE_TYPE.body, 'space-y-6')}>
              <p>
                The main deliverables of our project are 1) an open-access geospatial dataset with calculated values for each environmental indicator and a final environmental vulnerability index for 1,865 U.S. prisons and 2) an open-access, reproducible code base for every step of our analysis to promote the application of these assessments to other institutions and make our data and methods transparent.
              </p>
              <p>
                This research has provided critical data for activists, researchers, policy makers,
                and government agencies to understand and address environmental injustices in the prison system.
                The work represents a significant contribution to both environmental justice and geospatial science.
              </p>
            </div>

            <figure className="mt-8">
              <blockquote className={cn(SITE_TYPE.lead, 'm-0 text-ink-strong')}>
                &ldquo;This project taught me about managing a repository and working with large data, and using multiple datasets to contribute to environmental justice research that highlights the intersection of incarceration and environmental harm.&rdquo;
              </blockquote>
              <figcaption className={cn(SITE_TYPE.label, 'mt-4')}>&mdash; Devin Hunt, Project Contributor</figcaption>
            </figure>

            <p className={cn(SITE_TYPE.label, 'mt-8')}>
              Special thanks to the Geospatial Centroid at Colorado State University and NASA&apos;s Equity and Environmental Justice Grant program
              for making this critical research possible.
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="band px-frame" aria-labelledby="cta-heading">
          <h2 id="cta-heading" className={cn(SITE_TYPE.headline, 'mb-6')}>Explore the Research</h2>
          <p className={cn(SITE_TYPE.body, 'max-w-[40rem]')}>
            Access the open-source code, data, and methodology of this environmental justice research.
          </p>
          <nav aria-label="Research links" className="mt-8 flex flex-wrap gap-8">
            <Link href="/portfolio" className={cn(SITE_LINK, 'font-site text-site-body')}>Back to Portfolio</Link>
          </nav>
        </section>
    </>
  );
}
