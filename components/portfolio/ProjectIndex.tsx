// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/portfolio/ProjectIndex.tsx
// Editorial project index: quiet mono tab filters + hairline-separated project rows

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LazyProjectMap from '@/components/portfolio/LazyProjectMap';
import type { Project } from '@/lib/portfolio-data';

interface ProjectIndexProps {
  projects: Project[];
}

// Quiet mono filter trigger: eyebrow style, active = ink-strong with an ochre underline,
// no pill/box chrome (TabsList is transparent).
const tabTriggerStyles = [
  'eyebrow whitespace-nowrap px-0 py-1 transition-colors hover:text-ink-strong',
  'data-[state=active]:text-ink-strong data-[state=active]:underline',
  'data-[state=active]:decoration-accent data-[state=active]:decoration-2 data-[state=active]:underline-offset-8',
].join(' ');

function ProjectRow({ project }: { project: Project }) {
  const displayType = project.displayType ?? 'map';

  return (
    <article className="border-t border-border py-12 first:border-t-0 first:pt-4">
      <p className="eyebrow mb-2">{project.description} · {project.year}</p>
      <h2 className="mb-4 font-display text-2xl text-ink-strong">{project.title}</h2>

      {project.content.map((paragraph) => (
        <p key={paragraph.slice(0, 24)} className="mb-4 max-w-[40rem] leading-relaxed text-ink-body">
          {paragraph}
        </p>
      ))}

      {project.technologies && project.technologies.length > 0 && (
        <p className="mb-4 font-mono text-xs tracking-mono text-ink-muted">
          {project.technologies.join(' · ')}
        </p>
      )}

      {displayType === 'map' && (
        <div className="my-6 h-[420px] max-w-[40rem] border border-border">
          <LazyProjectMap projectId={project.id} />
        </div>
      )}

      {displayType === 'image' && project.imagePath && (
        <>
          <figure className="my-6 max-w-[40rem]">
            <img
              src={project.imagePath}
              alt={project.imageAlt || `${project.title} visualization`}
              loading="lazy"
              className="w-full"
            />
            {project.imageCaption && (
              <figcaption className="eyebrow mt-2">{project.imageCaption}</figcaption>
            )}
          </figure>
          {project.imageSecondaryText && (
            <p className="mt-2 max-w-[40rem] text-sm text-ink-muted">{project.imageSecondaryText}</p>
          )}
        </>
      )}

      {project.links && project.links.length > 0 && (
        <nav className="flex flex-wrap gap-8" aria-label="Project links">
          {project.links.map((link) => {
            const isInternal = link.href.startsWith('/');
            if (isInternal) {
              return (
                <Link key={link.href} href={link.href} className="link-quiet">
                  {link.label}
                </Link>
              );
            }
            return (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-quiet"
              >
                {link.label}
              </a>
            );
          })}
        </nav>
      )}
    </article>
  );
}

export function ProjectIndex({ projects }: ProjectIndexProps) {
  // Filter the single-sourced `projects` prop locally (mirrors getProjectsByCategory:
  // a project belongs to a tab when project.categories includes that category; 'all'
  // matches every project that lists 'all'). Avoids shipping PROJECTS twice.
  const projectsByCategory = useMemo(
    () => ({
      all: projects.filter((project) => project.categories.includes('all')),
      water: projects.filter((project) => project.categories.includes('water')),
      geospatial: projects.filter((project) => project.categories.includes('geospatial')),
      research: projects.filter((project) => project.categories.includes('research')),
    }),
    [projects],
  );

  const tabs: { value: keyof typeof projectsByCategory; label: string; aria: string }[] = [
    { value: 'all', label: 'All Projects', aria: 'All projects' },
    { value: 'water', label: 'Water Resources', aria: 'Water resources projects' },
    { value: 'geospatial', label: 'Geospatial Analysis', aria: 'Geospatial analysis projects' },
    { value: 'research', label: 'Research', aria: 'Research projects' },
  ];

  return (
    <Tabs defaultValue="all" className="mt-12">
      <TabsList
        className="mb-4 flex h-auto flex-wrap justify-start gap-8 rounded-none bg-transparent p-0"
        aria-label="Portfolio project categories"
      >
        {tabs.map((tab) => {
          const count = projectsByCategory[tab.value].length;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={tabTriggerStyles}
              aria-label={`${tab.aria} (${count} items)`}
            >
              {tab.label} ({count})
            </TabsTrigger>
          );
        })}
      </TabsList>

      {tabs.map((tab) => {
        const categoryProjects = projectsByCategory[tab.value];
        return (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="mt-0"
          >
            {categoryProjects.length > 0 ? (
              categoryProjects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))
            ) : (
              <p className="py-12 text-ink-muted">No projects found in this category.</p>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

export default ProjectIndex;
