// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/resume/page.tsx
// A resume as flowing as a river - hopefully it doesn't run dry during interviews!

'use client';

import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ResumeSection from '@/components/resume/ResumeSection';
import ExperienceItem from '@/components/resume/ExperienceItem';
import SkillsList from '@/components/resume/SkillsList';
import { DownloadIcon } from '@/components/ui/icons/common-icons';

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
      {/* Background SVG */}
      <ContourBackdrop preset="americanRiver" dual />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-forest-800 dark:text-forest-200">Resume</h1>
          <Button className="bg-river-600 hover:bg-river-700">
            <a
              href="/data/devin_hunt_resume_june2025.pdf"
              download="devin_hunt_resume_june2025.pdf"
              className="flex items-center gap-2"
            >
              <DownloadIcon aria-hidden={true} />
              Download PDF
            </a>
          </Button>
        </div>

      <Card className="p-6 mb-8 bg-white/80 dark:bg-[#404040]/80 backdrop-blur-sm print:shadow-none">
        <section
          className="mb-6 print:mb-4 p-4 -m-4 rounded-lg transition-all duration-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-river-300"
          tabIndex={0}
          aria-label="Professional summary section"
        >
          <h2 className="text-3xl font-semibold text-forest-700 dark:text-forest-200 mb-2 print:text-2xl">Devin Hunt</h2>
          <h3 className="text-xl text-forest-600 dark:text-forest-300 mb-4 print:text-lg">Water Resources Engineer</h3>
          <div className="mb-4">
            <p className="italic dark:text-white">
              Hydrologist passionate about understanding and solving water resource challenges in California through data-driven approaches. Skilled in leveraging open-source data, spatial analysis, and modeling to support sustainable water management. Committed to applying technical expertise to develop innovative solutions for complex hydrologic issues.
            </p>
          </div>
        </section>

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
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-forest-700 dark:text-forest-300">Colorado State University</h4>
            <p className="text-forest-600 dark:text-white italic">BS in Watershed Science, Hydrology and Water Resources Science</p>
            <p className="text-forest-600 dark:text-white italic">Minor in Geospatial Information Systems (GIS)</p>
            <p className="mt-2 dark:text-white">
              A multi-disciplinary education that enabled me to remotely sense and quantify my favorite natural resource: water.
            </p>
            <div className="mt-3">
              <h5 className="font-medium text-forest-700 dark:text-forest-300">Relevant coursework:</h5>
              <ul className="space-y-1 mt-1 ml-2">
                <li className="flex items-start">
                  <span className="text-forest-600 dark:text-forest-400 mr-2 mt-1">•</span>
                  <span className="text-forest-800 dark:text-white">Hydraulics and Groundwater flow; Hydrogeology, Soil Physics, Physics I & II</span>
                </li>
                <li className="flex items-start">
                  <span className="text-forest-600 dark:text-forest-400 mr-2 mt-1">•</span>
                  <span className="text-forest-800 dark:text-white">Data Science; Programming for GIS I & II, Watershed Analysis for Env. Data Science, Watershed Problem Analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-forest-600 dark:text-forest-400 mr-2 mt-1">•</span>
                  <span className="text-forest-800 dark:text-white">Remote Sensing; Geodetic and Near-surface Geophysical Methods, Remote Sensing and Image Interpretation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-forest-600 dark:text-forest-400 mr-2 mt-1">•</span>
                  <span className="text-forest-800 dark:text-white">Niche Subjects; Snow Hydrology, Field Measurements in Snow Hydrology</span>
                </li>
              </ul>
            </div>
          </div>
        </ResumeSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResumeSection title="Professional Skills">
            <SkillsList skills={professionalSkills} />
          </ResumeSection>
          
          <ResumeSection title="Technical Skills">
            <SkillsList skills={technicalSkills} />
          </ResumeSection>
        </div>

        <ResumeSection title="Additional Achievements">
          <div className="mb-2">
            <p className="font-medium">EAGLE SCOUT AWARD, Boy Scouts of America, August 2018</p>
          </div>
          <div>
            <p className="font-medium">WILDERNESS FIRST AID, NOLS Wilderness Medicine, May 2016</p>
          </div>
        </ResumeSection>
      </Card>
      </div>
    </div>
  );
}
