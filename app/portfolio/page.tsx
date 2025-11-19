// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/portfolio/page.tsx
// Showcasing projects like a well-mapped watershed - every tributary leading to my expertise!

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
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
  return (
    <Card
      id={project.id}
      className="bg-white/90 dark:bg-[#404040]/90 backdrop-blur-sm transition-all duration-300 hover:shadow-sm hover:border-river-300"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6">
          <CardHeader className="p-0 pb-4">
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-2xl text-forest-700 dark:text-forest-300">{project.title}</CardTitle>
              {project.year && (
                <span
                  className="text-sm text-forest-500 dark:text-forest-400 bg-forest-50 dark:bg-forest-800 px-2 py-1 rounded"
                  aria-label={`Project year: ${project.year}`}
                >
                  {project.year}
                </span>
              )}
            </div>
            <CardDescription className="text-forest-500 dark:text-forest-400">{project.description}</CardDescription>
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2" role="list" aria-label="Technologies used">
                {project.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-river-100 dark:bg-river-900 text-river-700 dark:text-river-300 px-2 py-1 rounded-full"
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
              <p key={idx} className="mb-4 text-sm leading-relaxed text-forest-800 dark:text-white">{paragraph}</p>
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
                        className="border-forest-600 dark:border-forest-400 text-forest-600 dark:text-forest-300 hover:bg-forest-50 dark:hover:bg-forest-800 transition-colors"
                        aria-label={`${link.label} - ${isInternal ? 'Navigate to' : 'Open in new tab'}`}
                      >
                        {getIconByType(link.iconType)}
                        <span className="ml-1">{link.label}</span>
                        {!isInternal && <ExternalLinkIcon className="w-3 h-3 ml-1" aria-hidden={true} />}
                      </Button>
                    </LinkComponent>
                  );
                })}
              </div>
            )}
          </CardContent>
        </div>

        <div className="relative h-[300px] md:h-auto min-h-[300px] z-10" style={{ pointerEvents: 'auto' }}>
          {project.displayType === 'image' ? (
            <div className="w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              {project.imagePath ? (
                <>
                  <img
                    src={project.imagePath}
                    alt={project.imageAlt || `${project.title} visualization`}
                    className={`w-full flex-1 ${project.id === 'sanitary-district' ? 'object-contain' : 'object-cover'}`}
                  />
                  {(project.imageCaption || project.imageSecondaryText) && (
                    <div className="bg-gray-200 dark:bg-gray-700 px-3 py-2">
                      {project.imageCaption && (
                        <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                          {project.imageCaption}
                        </p>
                      )}
                      {project.imageSecondaryText && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                          {project.imageSecondaryText}
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">Project Image Coming Soon</p>
                  <p className="text-xs mt-1">{project.title}</p>
                </div>
              )}
            </div>
          ) : (
            <LazyProjectMap projectId={project.id} />
          )}
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
  const { resolvedTheme } = useTheme();
  const [activeProject, setActiveProject] = useState<string>('prison-ej');
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Avoid hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);

    // Check if mobile on mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const backgroundImage = mounted && resolvedTheme === 'dark'
    ? 'url(/images/upper_folsom_contour_dark.svg)'
    : 'url(/images/upper_folsom_contour_bwn.svg)';

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
      <div className="absolute -top-[200px] -bottom-[200px] left-0 right-0 -z-10 overflow-hidden">
        {/* Normal orientation - single instance from top */}
        <div
          className="w-full opacity-10 dark:opacity-15 absolute top-0 left-0 right-0"
          style={{
            backgroundImage,
            backgroundSize: isMobile ? '250% auto' : '100% auto',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            height: '56.25%', // 16:9 aspect ratio (9/16 = 0.5625)
          }}
        />
        {/* Flipped SVG positioned where first instance ends */}
        <div
          className="w-full opacity-10 dark:opacity-15 absolute left-0 right-0"
          style={{
            top: '56.25%', // Start where first SVG ends
            backgroundImage,
            backgroundSize: isMobile ? '250% auto' : '100% auto',
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
          <h1 className="text-4xl font-bold text-forest-800 dark:text-forest-200 mb-4">Portfolio</h1>
          <p className="text-lg text-forest-600 dark:text-forest-300 mb-6 max-w-3xl">
            A collection of water resources and geospatial projects showcasing data-driven solutions
            for sustainable water management across California.
          </p>
        </header>

      {/* Projects Section */}
      <Tabs defaultValue="all" className="mb-8">
        <div className="relative z-10 mb-8 md:mb-8">
          <TabsList
            className="flex flex-wrap gap-2 mb-12 md:mb-6 justify-center sm:justify-start bg-transparent"
            role="tablist"
            aria-label="Portfolio project categories"
          >
            <TabsTrigger
              value="all"
              id="tab-all"
              className="px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#404040] text-gray-700 dark:text-forest-300 hover:bg-gray-100 dark:hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm font-semibold data-[state=active]:bg-forest-50 dark:data-[state=active]:bg-forest-800 data-[state=active]:text-forest-700 dark:data-[state=active]:text-forest-200 data-[state=active]:border-forest-500 z-20 transition-all"
              aria-label={`All projects (${projectsByCategory.all?.length ?? 0} items)`}
            >
              All Projects ({projectsByCategory.all?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger
              value="water"
              id="tab-water"
              className="px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#404040] text-gray-700 dark:text-forest-300 hover:bg-gray-100 dark:hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm font-semibold data-[state=active]:bg-forest-50 dark:data-[state=active]:bg-forest-800 data-[state=active]:text-forest-700 dark:data-[state=active]:text-forest-200 data-[state=active]:border-forest-500 z-20 transition-all"
              aria-label={`Water resources projects (${projectsByCategory.water?.length ?? 0} items)`}
            >
              Water Resources ({projectsByCategory.water?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger
              value="geospatial"
              id="tab-geospatial"
              className="px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#404040] text-gray-700 dark:text-forest-300 hover:bg-gray-100 dark:hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm font-semibold data-[state=active]:bg-forest-50 dark:data-[state=active]:bg-forest-800 data-[state=active]:text-forest-700 dark:data-[state=active]:text-forest-200 data-[state=active]:border-forest-500 z-20 transition-all"
              aria-label={`Geospatial analysis projects (${projectsByCategory.geospatial?.length ?? 0} items)`}
            >
              Geospatial Analysis ({projectsByCategory.geospatial?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger
              value="research"
              id="tab-research"
              className="px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#404040] text-gray-700 dark:text-forest-300 hover:bg-gray-100 dark:hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm font-semibold data-[state=active]:bg-forest-50 dark:data-[state=active]:bg-forest-800 data-[state=active]:text-forest-700 dark:data-[state=active]:text-forest-200 data-[state=active]:border-forest-500 z-20 transition-all"
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
              <div className="text-center py-12 text-forest-600 dark:text-forest-400">
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
