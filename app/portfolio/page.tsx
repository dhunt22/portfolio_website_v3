// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/portfolio/page.tsx
// Showcasing projects like a well-mapped watershed - every tributary leading to my expertise!

'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import LazyProjectMap from '@/components/portfolio/LazyProjectMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PROJECTS, Project, getProjectsByCategory } from '@/lib/portfolio-data';
import { ExternalLinkIcon, GitHubIcon, DownloadIcon } from '@/components/ui/icons/common-icons';

/**
 * Get icon component based on icon type
 * @param iconType - Type of icon to render
 * @returns Icon component
 */
function getIconByType(iconType?: string) {
  switch (iconType) {
    case 'github':
      return <GitHubIcon className="w-4 h-4" />;
    case 'document':
    case 'external':
    case 'website':
      return <ExternalLinkIcon className="w-4 h-4" />;
    case 'download':
      return <DownloadIcon className="w-4 h-4" />;
    default:
      return <ExternalLinkIcon className="w-4 h-4" />;
  }
}

/**
 * ProjectCard component for rendering individual project cards
 * Enhanced with better accessibility and keyboard navigation
 */
interface ProjectCardProps {
  project: Project;
  isActive: boolean;
  onClick: () => void;
}

function ProjectCard({ project, isActive, onClick }: ProjectCardProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      id={project.id}
      className={`bg-white/90 backdrop-blur-sm transition-all duration-300 cursor-pointer ${
        isActive ? 'border-river-500 shadow-md ring-2 ring-river-200' : 'hover:shadow-sm hover:border-river-300'
      }`}
      onClick={onClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-pressed={isActive}
      aria-label={`View ${project.title} project details`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6">
          <CardHeader className="p-0 pb-4">
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-2xl text-forest-700">{project.title}</CardTitle>
              {project.year && (
                <span
                  className="text-sm text-forest-500 bg-forest-50 px-2 py-1 rounded"
                  aria-label={`Project year: ${project.year}`}
                >
                  {project.year}
                </span>
              )}
            </div>
            <CardDescription className="text-forest-500">{project.description}</CardDescription>
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2" role="list" aria-label="Technologies used">
                {project.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-river-100 text-river-700 px-2 py-1 rounded-full"
                    role="listitem"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0 pb-4">
            {project.content.map((paragraph, idx) => (
              <p key={idx} className="mb-4 text-sm leading-relaxed text-forest-800">{paragraph}</p>
            ))}

            {project.links && project.links.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2" role="list" aria-label="Project links">
                {project.links.map((link, idx) => {
                  // Internal links use Next.js Link, external use anchor
                  const isInternal = link.href.startsWith('/');
                  const LinkComponent = isInternal ? Link : 'a';
                  const linkProps = isInternal
                    ? { href: link.href }
                    : { href: link.href, target: "_blank", rel: "noopener noreferrer" };

                  return (
                    <LinkComponent key={idx} {...linkProps as any}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-forest-600 text-forest-600 hover:bg-forest-50 transition-colors"
                        aria-label={`${link.label} - ${isInternal ? 'Navigate to' : 'Open in new tab'}`}
                      >
                        {getIconByType(link.iconType)}
                        <span className="ml-1">{link.label}</span>
                        {!isInternal && <ExternalLinkIcon className="w-3 h-3 ml-1" aria-hidden="true" />}
                      </Button>
                    </LinkComponent>
                  );
                })}
              </div>
            )}
          </CardContent>
        </div>

        <div className="relative h-[300px] md:h-auto min-h-[300px]">
          <LazyProjectMap projectId={project.id} />
        </div>
      </div>
    </Card>
  );
}

/**
 * Portfolio page component displaying various professional projects
 * @returns {React.JSX.Element} The rendered portfolio page
 */
export default function PortfolioPage() {
  const [activeProject, setActiveProject] = useState<string>('prison-ej');

  // Memoize filtered projects for better performance
  const projectsByCategory = useMemo(() => {
    const categories = {
      all: getProjectsByCategory('all') || [],
      water: getProjectsByCategory('water') || [],
      geospatial: getProjectsByCategory('geospatial') || [],
      research: getProjectsByCategory('research') || []
    };
    
    // Ensure all arrays are valid and have length property
    Object.keys(categories).forEach(key => {
      const categoryKey = key as keyof typeof categories;
      if (!Array.isArray(categories[categoryKey])) {
        categories[categoryKey] = [];
      }
    });
    
    return categories;
  }, []);

  // Memoize project click handler
  const handleProjectClick = useCallback((projectId: string) => {
    setActiveProject(projectId);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Background SVG */}
      <div className="absolute -inset-[200px] -z-10 overflow-hidden">
        {/* Normal orientation - single instance from top */}
        <div
          className="w-full opacity-10 absolute top-0 left-0 right-0"
          style={{
            backgroundImage: 'url(/images/upper_folsom_contour_bwn.svg)',
            backgroundSize: '100% auto',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            height: '56.25%', // 16:9 aspect ratio (9/16 = 0.5625)
          }}
        />
        {/* Flipped SVG positioned where first instance ends */}
        <div
          className="w-full opacity-10 absolute left-0 right-0"
          style={{
            top: '56.25%', // Start where first SVG ends
            backgroundImage: 'url(/images/upper_folsom_contour_bwn.svg)',
            backgroundSize: '100% auto',
            backgroundPosition: 'center top',
            backgroundRepeat: 'repeat-y',
            transform: 'scaleY(-1)',
            height: 'calc(100% - 56.25%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-forest-800 mb-4">Portfolio</h1>
          <p className="text-lg text-forest-600 mb-6 max-w-3xl">
            A collection of water resources and geospatial projects showcasing data-driven solutions
            for sustainable water management across California.
          </p>
        </header>

      {/* Projects Section */}
      <Tabs defaultValue="all" className="mb-8">
        <div className="relative z-10 mb-8">
          <TabsList
            className="flex flex-wrap gap-2 mb-6 justify-center sm:justify-start bg-transparent"
            role="tablist"
            aria-label="Portfolio project categories"
          >
            <TabsTrigger
              value="all"
              id="tab-all"
              className="px-4 py-2 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm font-semibold data-[state=active]:bg-forest-50 data-[state=active]:text-forest-700 data-[state=active]:border-forest-500 data-[state=active]:border z-20 transition-all"
              aria-label={`All projects (${projectsByCategory.all?.length ?? 0} items)`}
            >
              All Projects ({projectsByCategory.all?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger
              value="water"
              id="tab-water"
              className="px-4 py-2 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm font-semibold data-[state=active]:bg-forest-50 data-[state=active]:text-forest-700 data-[state=active]:border-forest-500 data-[state=active]:border z-20 transition-all"
              aria-label={`Water resources projects (${projectsByCategory.water?.length ?? 0} items)`}
            >
              Water Resources ({projectsByCategory.water?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger
              value="geospatial"
              id="tab-geospatial"
              className="px-4 py-2 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm font-semibold data-[state=active]:bg-forest-50 data-[state=active]:text-forest-700 data-[state=active]:border-forest-500 data-[state=active]:border z-20 transition-all"
              aria-label={`Geospatial analysis projects (${projectsByCategory.geospatial?.length ?? 0} items)`}
            >
              Geospatial Analysis ({projectsByCategory.geospatial?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger
              value="research"
              id="tab-research"
              className="px-4 py-2 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm font-semibold data-[state=active]:bg-forest-50 data-[state=active]:text-forest-700 data-[state=active]:border-forest-500 data-[state=active]:border z-20 transition-all"
              aria-label={`Research projects (${projectsByCategory.research?.length ?? 0} items)`}
            >
              Research ({projectsByCategory.research?.length ?? 0})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Contents */}
        {Object.entries(projectsByCategory).map(([category, projects]) => (
          <TabsContent
            key={category}
            value={category}
            id={`panel-${category}`}
            className="mt-0 relative z-0"
            role="tabpanel"
            aria-labelledby={`tab-${category}`}
          >
            {projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 pt-2">
                {projects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isActive={activeProject === project.id}
                    onClick={() => handleProjectClick(project.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-forest-600">
                <p>No projects found in this category.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      </div>
    </div>
  );
}
