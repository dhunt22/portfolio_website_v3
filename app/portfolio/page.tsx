// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/portfolio/page.tsx
// Showcasing projects like a well-mapped watershed - every tributary leading to my expertise!

import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { ProjectIndex } from '@/components/portfolio/ProjectIndex';
import { PROJECTS } from '@/lib/portfolio-data';

/**
 * Portfolio page component displaying various professional projects
 * @returns {React.JSX.Element} The rendered portfolio page
 */
export default function PortfolioPage() {
  return (
    <div className="relative min-h-screen">
      <ContourBackdrop page="portfolio" />

      <div className="container relative z-10 mx-auto px-6">
        <header className="pt-16">
          <h1 className="display text-4xl">Portfolio</h1>
          <p className="lead mt-6 max-w-[40rem]">
            A collection of water resources and geospatial projects showcasing data-driven solutions
            for sustainable water management across California.
          </p>
        </header>

        <ProjectIndex projects={PROJECTS} />
      </div>
    </div>
  );
}
