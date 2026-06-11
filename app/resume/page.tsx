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
    "Teamwork",
    "Multi-project management",
    "Deadline management",
    "Deliverables coordination",
    "Project scope & budget management",
    "Workflow & task planning",
    "In-person collaboration"
  ];

  // Technical skills data
  const technicalSkills = [
    "Integrated Water Flow Model (IWFM)",
    "ArcGIS Pro and Online",
    "Python",
    "QGIS",
    "R",
    "SQL (Postgres & PostGIS)",
    "Groundwater Interpolation",
    "Excel LET and LAMBDA",
    "Field Documentation",
    "Cartography"
  ];

  return (
    <div className="relative min-h-screen">
      <ContourBackdrop page="resume" />

      <div className="container relative z-10 mx-auto px-6">
        <header className="flex flex-wrap items-baseline justify-between gap-4 pt-16">
          <h1 className="display text-4xl">Resume</h1>
          <a
            href="/data/devin_hunt_resume_june2025.pdf"
            download
            className="link-quiet"
          >
            Download PDF
          </a>
        </header>

        <div className="mt-10">
          <h2 className="font-display text-2xl text-ink-strong">Devin Hunt</h2>
          <p className="mt-1 font-mono text-xs uppercase tracking-caps text-ink-muted">Water Resources Engineer</p>
          <p className="mt-4 max-w-[40rem] font-display italic text-xl leading-snug text-ink-strong">
            Hydrologist passionate about understanding and solving water resource challenges in California through data-driven approaches. Skilled in leveraging open-source data, spatial analysis, and modeling to support sustainable water management. Committed to applying technical expertise to develop innovative solutions for complex hydrologic issues.
          </p>
        </div>

        <ResumeSection title="Professional Experience">
          <ExperienceItem
            title="Water Resources Engineer II"
            company="Woodard & Curran"
            period="June 2023 - Present"
            responsibilities={[
              "Engineer 2 involved in the development of CA SGMA Groundwater Sustainability Plans (GSPs), groundwater budgets through CA IWFM modeling, and recharge and extraction optimization through geospatial analyses.",
              "Developed new figures, basemap, and layout templates for the Cuyama 2025 GSP using Esri ArcGIS Pro",
              "Performed annual updates for the CoSANA Model and Cuyama Basin Water Resources Model (CBWRM)",
              "Utilized python, arcpy, and open-source geospatial libraries to automate large dataset processing",
              "Computed Recharge Suitability Index (RSI) scores using open-source geospatial data for the Yuba Subbasins",
              "Executed independent analysis of well sites in Southern California that provide reliable, clean water for future development",
              "Wrote technical memorandums and deliverable packages for clients"
            ]}
          />

          <ExperienceItem
            title="Geospatial Analyst and Programmer"
            company="Geospatial Centroid at Colorado State University"
            period="October 2022 - May 2023"
            responsibilities={[
              "Involved in various spatial projects in Colorado and CONUS. Also provided project planning and technical tutoring for students.",
              "Developed R-Spatial scripts for NASA-Equity and Environmental Justice Grant project: Environmental Justice for Prisons",
              "Held office hours and supported students with any spatial project needs",
              "Utilize R and geospatial libraries to support project work",
              "Designed hexagonal project spotlight decorations for Centroid office",
              "Executed independent analysis of well sites in Southern California that provide reliable, clean water for future development",
              "Wrote technical memorandums and deliverable packages for clients"
            ]}
          />

          <ExperienceItem
            title="Undergraduate Research Assistant"
            company="Colorado State University"
            period="January 2022 - October 2022"
            responsibilities={[
              "Field researcher and data analyst supporting a PhD Dissertation on stream metabolism. Study area was Fraser Experimental Forest, CO across four catchment basins. (Project Lead Lauren Kremer in Watershed Analysis Group)",
              "Constructed Campbell Scientific stream gauges and planned on-site solar panel locations",
              "Installed Campbell Scientific, HOBO, and other in-situ sensors",
              "Collected stream geomorphology, velocity-area, and groundwater level measurements",
              "Read data and maintained sensors",
              "Processed water samples for Dissolved Organic Carbon (DOC), and Inorganic Carbon (IC)",
              "Documented all actions taken in the field and laboratory"
            ]}
          />
        </ResumeSection>

        <ResumeSection title="Education">
          <div className="max-w-[40rem]">
            <h3 className="font-display text-xl text-ink-strong">Colorado State University</h3>
            <p className="mt-1 italic text-ink-body">BS in Watershed Science, Hydrology and Water Resources Science</p>
            <p className="italic text-ink-body">Minor in Geospatial Information Systems (GIS)</p>
            <p className="mt-3 leading-relaxed text-ink-body">
              A multi-disciplinary education that enabled me to remotely sense and quantify my favorite natural resource: water.
            </p>
            <div className="mt-4">
              <h4 className="font-display text-base text-ink-strong">Relevant coursework:</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed text-ink-body marker:text-eyebrow">
                <li>Hydraulics and Groundwater flow; Hydrogeology, Soil Physics, Physics I &amp; II</li>
                <li>Data Science; Programming for GIS I &amp; II, Watershed Analysis for Env. Data Science, Watershed Problem Analysis</li>
                <li>Remote Sensing; Geodetic and Near-surface Geophysical Methods, Remote Sensing and Image Interpretation</li>
                <li>Niche Subjects; Snow Hydrology, Field Measurements in Snow Hydrology</li>
              </ul>
            </div>
          </div>
        </ResumeSection>

        <div className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
          <ResumeSection title="Professional Skills">
            <SkillsList skills={professionalSkills} />
          </ResumeSection>

          <ResumeSection title="Technical Skills">
            <SkillsList skills={technicalSkills} />
          </ResumeSection>
        </div>

        <ResumeSection title="Additional Achievements">
          <div className="max-w-[40rem] space-y-2 leading-relaxed text-ink-body">
            <p>EAGLE SCOUT AWARD, Boy Scouts of America, August 2018</p>
            <p>WILDERNESS FIRST AID, NOLS Wilderness Medicine, May 2016</p>
          </div>
        </ResumeSection>
      </div>
    </div>
  );
}
