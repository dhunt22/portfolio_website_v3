// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/portfolio/environmental-justice-prisons/page.tsx
// Environmental Justice For Prisons - dedicated project page (server shell)

import Link from 'next/link';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { IndicatorBrowser } from '@/components/portfolio/IndicatorBrowser';

/**
 * Environmental Justice For Prisons - Dedicated Project Page
 * A comprehensive overview of the NASA-funded research project
 */
export default function EnvironmentalJusticePrisonsPage(): JSX.Element {
  return (
    <div className="relative min-h-screen">
      <ContourBackdrop preset="upperFolsom" />

      <div className="container relative z-10 mx-auto px-6">
        {/* Hero */}
        <header className="py-12">
          <p className="eyebrow mb-6">Geospatial Analysis, NASA Grant Project · 2022-2023</p>
          <h1 className="display text-4xl">
            Environmental Justice For Prisons
          </h1>
          <p className="lead mt-6 max-w-[40rem]">
            Leveraging NASA Earth Science Data to Map Environmental Injustices in U.S. Prisons
          </p>
          <nav aria-label="Project links" className="mt-8 flex flex-wrap gap-8">
            <a
              href="https://github.com/GeospatialCentroid/NASA-prison-EJ/releases/tag/v2023-1"
              target="_blank"
              rel="noopener noreferrer"
              className="link-quiet"
              aria-label="View GitHub repository for NASA Prison Environmental Justice project"
            >
              Published Dataset
            </a>
            <a
              href="https://ui.adsabs.harvard.edu/abs/2023AGUFMINV31C0.1M/abstract"
              target="_blank"
              rel="noopener noreferrer"
              className="link-quiet"
              aria-label="Visit NASA Applied Sciences project page"
            >
              Publication
            </a>
          </nav>
        </header>

        {/* Project Overview */}
        <section className="py-12" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="eyebrow mb-6">Project Overview</h2>
          <div className="max-w-[40rem] space-y-6 leading-relaxed text-ink-body">
            <p>
              Despite documented environmental injustices in U.S. prisons, this area remains understudied. Prisons are EJ communities by definition&mdash;overrepresented by people of color, indigenous persons, and low-income individuals who cannot escape environmental health threats. This groundbreaking research initiative was funded by NASA&apos;s $100,000 Equity and Environmental Justice Grant to address this critical gap.
            </p>

            <div>
              <h3 className="mb-3 font-display text-xl text-ink-strong">Key Project Objectives</h3>
              <ul className="list-disc space-y-2 pl-5 marker:text-eyebrow">
                <li>Quantify environmental conditions at all 1,865 state and federal prisons in the U.S.</li>
                <li>Calculate a standardized vulnerability index for each prison</li>
                <li>Create an open-access geospatial dataset and reproducible code base</li>
              </ul>
            </div>

            <p>
              This research leverages NASA&apos;s Earth science data&mdash;including satellite, land cover, climate, and air quality datasets&mdash;to characterize environmental harms faced by incarcerated people across all U.S. state and federal prisons. The method incorporates 11 environmental indicators grouped into three components: climate risk (heat index, canopy cover, wildfire risk and flood hazard), environmental exposures (ozone, PM 2.5, pesticide use, and traffic density), and environmental effects (proximity to superfund sites, risk management plan facilities and hazardous waste sites).
            </p>

            <p>
              Explore the interactive map below to visualize how these environmental factors impact prisons across the United States.
            </p>
          </div>
        </section>

        {/* Interactive Indicator Browser */}
        <section className="py-12" aria-labelledby="indicators-heading">
          <h2 id="indicators-heading" className="eyebrow mb-6">Environmental Risk Indicators</h2>
          <IndicatorBrowser />
        </section>

        {/* Project Team */}
        <section className="py-12" aria-labelledby="team-heading">
          <h2 id="team-heading" className="eyebrow mb-6">Project Team &amp; My Contribution</h2>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div>
              <h3 className="mb-4 font-display text-xl text-ink-strong">Research Team</h3>
              <div className="space-y-4 leading-relaxed text-ink-body">
                <div>
                  <p className="text-ink-strong">Dr. Caitlin Mothes</p>
                  <p className="text-sm">Principal Investigator, Research and Program Coordinator</p>
                  <p className="text-sm">Geospatial Centroid, Colorado State University</p>
                </div>
                <div>
                  <p className="text-ink-strong">Dan Carver</p>
                  <p className="text-sm">Geospatial Technical Manager</p>
                  <p className="text-sm">Geospatial Centroid, Colorado State University</p>
                </div>
                <div>
                  <p className="text-ink-strong">Dr. Carrie Chennault</p>
                  <p className="text-sm">Assistant Professor of Geography</p>
                  <p className="text-sm">Prison Agriculture Lab, Colorado State University</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-display text-xl text-ink-strong">My Role &amp; Contributions</h3>
              <div className="space-y-4 leading-relaxed text-ink-body">
                <p>
                  As a Geospatial Analyst and Programmer at the Geospatial Centroid, I worked closely with
                  Caitlin Mothes to develop R-spatial scripts for data processing and analysis.
                </p>
                <ul className="list-disc space-y-2 pl-5 marker:text-eyebrow">
                  <li>Processed open-source datasets for environmental indicators</li>
                  <li>Calculated percentile scores for climate, exposure, and effects categories</li>
                  <li>Developed vulnerability scoring algorithms combining all risk factors</li>
                  <li>Contributed to repository management and large dataset processing workflows</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 max-w-[40rem]">
            <h3 className="mb-4 font-display text-xl text-ink-strong">Project Impact &amp; Recognition</h3>
            <div className="space-y-6 leading-relaxed text-ink-body">
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
              <blockquote className="font-display italic text-xl leading-snug text-ink-strong">
                &ldquo;This project taught me about managing a repository and working with large data, and using multiple datasets to contribute to environmental justice research that highlights the intersection of incarceration and environmental harm.&rdquo;
              </blockquote>
              <figcaption className="eyebrow mt-4">&mdash; Devin Hunt, Project Contributor</figcaption>
            </figure>

            <p className="mt-8 text-sm text-ink-muted">
              Special thanks to the Geospatial Centroid at Colorado State University and NASA&apos;s Equity and Environmental Justice Grant program
              for making this critical research possible.
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12" aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="eyebrow mb-6">Explore the Research</h2>
          <p className="max-w-[40rem] leading-relaxed text-ink-body">
            Access the open-source code, data, and methodology of this environmental justice research.
          </p>
          <nav aria-label="Research links" className="mt-8 flex flex-wrap gap-8">
            <Link href="/portfolio" className="link-quiet">Back to Portfolio</Link>
          </nav>
        </section>
      </div>
    </div>
  );
}
