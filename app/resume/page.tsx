// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/resume/page.tsx
// A resume as flowing as a river - hopefully it doesn't run dry during interviews!

import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import ResumeSection from '@/components/resume/ResumeSection';
import ExperienceItem from '@/components/resume/ExperienceItem';
import SkillsList from '@/components/resume/SkillsList';

/**
 * Resume page component showing professional experience, education, and skills
 * @returns {React.JSX.Element} The rendered resume page
 */
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

  return (
    <div className="relative min-h-svh">
      <ContourBackdrop page="resume" />

      <div className="container relative z-10 mx-auto max-w-3xl px-6">
        <header className="flex flex-wrap items-baseline justify-between gap-4 pt-16">
          <p className="eyebrow">Resume</p>
          <a
            href="/data/Resume_DevinHunt_Jun2026.pdf"
            download="Devin-Hunt-Resume-June2026.pdf"
            className="link-quiet print:hidden"
          >
            Download PDF
          </a>
        </header>

        <div className="panel mt-4">
        <div>
          <h1 className="display text-4xl">Devin Hunt</h1>
          <p className="mt-1 font-sans font-medium text-xs uppercase tracking-caps text-ink-muted">AI Automation Engineer and Groundwater Modeler</p>
          <p className="mt-2 text-sm text-ink-muted">
            Sacramento, CA &middot; contact@devinhunt.com &middot; devinhunt.com &middot; github.com/dhunt22
          </p>
          <p className="mt-4 font-display text-xl leading-snug text-ink-strong">
            Engineer who builds tested Python automation, AI-grounded applications, and agent workflows, with California SGMA groundwater modeling in IWFM as the proving ground. Turns slow, manual modeling and GIS work into reusable, tested tools, and develops AI-assisted toolkits grounded in modeling theory and documentation. Leads firm-wide adoption of AI-enriched workflows, and advises staff across practice areas on using AI for development — guiding their early ideas toward production-ready solutions.
          </p>
        </div>

        <ResumeSection title="Professional Experience">
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
          <div>
            <h3 className="font-display text-xl text-ink-strong">Colorado State University</h3>
            <p className="mt-1 text-ink-body">Bachelor of Science in Watershed Science, Hydrology and Water Resources Science</p>
            <p className="text-ink-body">Minor in Geospatial Information Systems</p>
            <p className="mt-3 leading-relaxed text-ink-body">
              A multi-disciplinary education that enabled me to remotely sense and quantify my favorite natural resource: water.
            </p>
            <div className="mt-4">
              <h4 className="font-display text-base text-ink-strong">Relevant coursework:</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed text-ink-body marker:text-eyebrow">
                <li>Hydraulics and Groundwater Flow; Hydrogeology, Soil Physics, Physics I and II</li>
                <li>Data Science; Programming for GIS I and II, Watershed Analysis for Environmental Data Science, Watershed Problem Analysis</li>
                <li>Remote Sensing; Geodetic and Near-surface Geophysical Methods, Remote Sensing and Image Interpretation</li>
                <li>Niche Subjects; Snow Hydrology, Field Measurements in Snow Hydrology</li>
              </ul>
            </div>
          </div>
        </ResumeSection>

        <ResumeSection title="Professional Skills">
          <SkillsList skills={professionalSkills} />
        </ResumeSection>

        <ResumeSection title="Technical Skills">
          <SkillsList skills={technicalSkills} />
        </ResumeSection>

        <ResumeSection title="Additional Achievements">
          <div className="space-y-2 leading-relaxed text-ink-body">
            <p>Eagle Scout Award, Boy Scouts of America, August 2018</p>
            <p>Wilderness First Aid, NOLS Wilderness Medicine, May 2016</p>
          </div>
        </ResumeSection>
        </div>
      </div>
    </div>
  );
}
