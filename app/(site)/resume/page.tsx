// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(site)/resume/page.tsx
// Résumé (DESIGN.md › Page blueprints › Résumé): the working map is the header beside the résumé's opening.

import type { Metadata } from 'next';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import ResumeSection from '@/components/resume/ResumeSection';
import ExperienceItem from '@/components/resume/ExperienceItem';
import SkillsList from '@/components/resume/SkillsList';
import { ReadoutDefault } from '@/components/site/Readout';
import { WatershedMap } from '@/components/site/WatershedMap';
import { SITE_BUTTON, SITE_LINK, SITE_TYPE } from '@/components/site/type';
import { resumeMap } from '@/lib/site/map';
import { HOME_BASE } from '@/lib/site/reading';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Résumé · Devin Hunt',
  description: 'AI specialist and groundwater modeler in Sacramento: tested Python automation, AI-grounded applications and IWFM modeling.',
  openGraph: { title: 'Résumé · Devin Hunt', description: 'AI specialist and groundwater modeler in Sacramento: tested Python automation, AI-grounded applications and IWFM modeling.', url: 'https://devinhunt.com/resume' },
  twitter: { title: 'Résumé · Devin Hunt', description: 'AI specialist and groundwater modeler in Sacramento: tested Python automation, AI-grounded applications and IWFM modeling.' },
};

export default function ResumePage() {
  // Professional skills data
  const professionalSkills = [
    "AI enablement and technical mentoring",
    "Stakeholder and leadership communication",
    "Concurrent multi-project management",
    "Cross-functional technical collaboration"
  ];

  // Technical skills data
  const technicalSkills = [
    "IWFM and C2VSimFG",
    "Groundwater Interpolation",
    "Python",
    "AI Agent Orchestration with Claude Code",
    "Test-Driven Development",
    "Git",
    "GeoPandas, GDAL",
    "SQL",
    "RESTful APIs",
    "Node.js and Full-Stack Web",
    "ArcGIS Pro and Online",
    "QGIS",
    "Leaflet and MaplibreGL",
    "Cartography",
    "R",
    "Excel LET and LAMBDA",
    "Field Documentation"
  ];

  const map = resumeMap();

  return (
    <>
      <ContourBackdrop page="resume" />
      <ReadoutDefault reading={HOME_BASE} />

      <section aria-labelledby="name" className="grid items-start gap-[clamp(24px,4vw,64px)] px-gutter pb-12 pt-[clamp(32px,6vh,72px)] min-[861px]:grid-cols-2">
        <div className="grid content-start gap-5">
          <h1 id="name" className={cn(SITE_TYPE.display, 'halo')}>Devin Hunt</h1>
          <p className={cn(SITE_TYPE.lead, 'halo font-semibold text-ink-strong')}>AI Specialist and Groundwater Modeler</p>
          <p className={cn(SITE_TYPE.label, 'halo')}>Sacramento, CA &middot; contact@devinhunt.com &middot; devinhunt.com &middot; github.com/dhunt22</p>
          <p className={cn(SITE_TYPE.body, 'halo max-w-[58ch]')}>
            Engineer who builds tested Python automation, AI-grounded applications, and agent workflows, with California SGMA groundwater modeling in IWFM as the proving ground. Turns slow, manual modeling and GIS work into reusable, tested tools, and develops AI-assisted toolkits grounded in modeling theory and documentation. Leads firm-wide adoption of AI-enriched workflows, and advises staff across practice areas on using AI for development — guiding their early ideas toward production-ready solutions.
          </p>
          <div className="halo flex flex-wrap items-center gap-x-6 gap-y-3 print:hidden">
            <a href="/data/Resume_DevinHunt_Jun2026.pdf" target="_blank" rel="noopener noreferrer" className={SITE_BUTTON} aria-label="Download PDF (opens in a new tab)">
              Download PDF
            </a>
            <a href="#experience" className={cn(SITE_LINK, 'font-site text-site-body')}>Experience</a>
          </div>
        </div>
        <WatershedMap basins={map.basins} pins={map.pins} viewBox={map.viewBox} />
      </section>

      <section id="experience" aria-label="Résumé" className="band px-gutter">
        <div className="max-w-[72rem]">
          <ResumeSection title="Experience">
          <ExperienceItem
            title="Water Resources Engineer I to II"
            company="Woodard & Curran"
            period="June 2023 – Present"
            responsibilities={[
              "Develop and maintain AIIWFM, an internal AI application that grounds language models in the IWFM user manual and modeling theory to answer groundwater modeling questions accurately.",
              "Build a Python suite of tools that automates common IWFM model workflows, including sub-setting a model domain and running automated file linting, QA/QC, and water-budget reporting.",
              "Automate post-processing of IWFM groundwater models, replacing slow manual steps with tested, reusable tools.",
              "Develop PyPEST, a Python port of the DWR IWFM PEST calibration suite, validated against the original Fortran tools to support automated model calibration.",
              "Lead the firm's monthly AI Innovators forum, a company-wide group that helps staff at any skill level learn AI and build their own tools — drawing over 100 staff and supporting several new tools.",
              "Advise staff across practice areas on AI-assisted engineering, sharing advanced Claude Code and Copilot workflows in agents, subagents, skills, and context management.",
              "Run an internal workflow that audits, refactors, and documents early-stage AI tools and returns a handoff report so staff can continue their own development — applied across five projects to date.",
              "Perform annual updates for the CoSANA Model and the Cuyama Basin Water Resources Model.",
              "Compute Recharge Suitability Index scores from open-source geospatial data for the Yuba Subbasins."
            ]}
          />

          <ExperienceItem
            title="Geospatial Analyst and Programmer"
            company="Geospatial Centroid at Colorado State University"
            period="October 2022 – May 2023"
            responsibilities={[
              "Developed R-Spatial scripts supporting the NASA Equity and Environmental Justice grant project, Environmental Justice for Prisons.",
              "Applied R and geospatial libraries across spatial projects spanning Colorado and the continental United States.",
              "Provided project planning and technical tutoring, holding office hours to support students with spatial project needs.",
              "Designed hexagonal project-spotlight displays for the Centroid office."
            ]}
          />

          <ExperienceItem
            title="Undergraduate Research Assistant"
            company="Colorado State University"
            period="January 2022 – October 2022"
            responsibilities={[
              "Supported a PhD dissertation on stream metabolism as field researcher and data analyst across four catchment basins in the Fraser Experimental Forest, Colorado.",
              "Constructed Campbell Scientific stream gauges and installed Campbell, HOBO, and other in-situ sensors.",
              "Collected stream geomorphology, velocity-area, and groundwater-level measurements and processed water samples for dissolved organic and inorganic carbon.",
              "Maintained sensors, retrieved field data, and documented all field and laboratory work."
            ]}
          />
          </ResumeSection>
          <ResumeSection title="Education">
          <div className="max-w-[70ch]">
            <h3 className={SITE_TYPE.title}>Colorado State University</h3>
            <p className={SITE_TYPE.body}>Bachelor of Science in Watershed Science, Hydrology and Water Resources Science</p>
            <p className={SITE_TYPE.body}>Minor in Geospatial Information Systems</p>
            <p className={cn(SITE_TYPE.body, 'mt-3')}>
              A multi-disciplinary education that enabled me to remotely sense and quantify my favorite natural resource: water.
            </p>
            <div className="mt-4">
              <h4 className={cn(SITE_TYPE.body, 'font-semibold text-ink-strong')}>Relevant coursework:</h4>
              <ul className={cn(SITE_TYPE.body, 'mt-2 grid list-disc gap-1 pl-5')}>
                <li>Hydraulics and Groundwater Flow; Hydrogeology, Soil Physics, Physics I and II</li>
                <li>Data Science; Programming for GIS I and II, Watershed Analysis for Environmental Data Science, Watershed Problem Analysis</li>
                <li>Remote Sensing; Geodetic and Near-surface Geophysical Methods, Remote Sensing and Image Interpretation</li>
                <li>Niche Subjects; Snow Hydrology, Field Measurements in Snow Hydrology</li>
              </ul>
            </div>
          </div>
          </ResumeSection>
          <ResumeSection title="Professional skills"><SkillsList skills={professionalSkills} /></ResumeSection>
          <ResumeSection title="Technical skills"><SkillsList skills={technicalSkills} /></ResumeSection>
          <ResumeSection title="Additional achievements">
            <div className={cn(SITE_TYPE.body, 'grid gap-2')}>
              <p>Eagle Scout Award, Boy Scouts of America, August 2018</p>
              <p>Wilderness First Aid, NOLS Wilderness Medicine, May 2016</p>
            </div>
          </ResumeSection>
        </div>
      </section>
    </>
  );
}
