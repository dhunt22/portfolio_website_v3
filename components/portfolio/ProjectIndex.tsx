// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/portfolio/ProjectIndex.tsx
// Editorial project index: sans-serif tab filters + project rows in .panel cards

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LazyProjectMap from '@/components/portfolio/LazyProjectMap';
import type { Project } from '@/lib/portfolio-data';

interface ProjectIndexProps {
  projects: Project[];
}

// Filter trigger: sans eyebrow style, active = ink-strong with an ochre underline,
// no pill/box chrome (TabsList is transparent).
const tabTriggerStyles = [
  'eyebrow whitespace-nowrap px-0 py-1 transition-colors hover:text-ink-strong',
  'data-[state=active]:text-ink-strong data-[state=active]:underline',
  'data-[state=active]:decoration-accent data-[state=active]:decoration-2 data-[state=active]:underline-offset-8',
].join(' ');

function ProjectRow({ project }: { project: Project }) {
  const displayType = project.displayType ?? 'map';
  const hasMedia = displayType === 'map' || (displayType === 'image' && Boolean(project.imagePath));

  const eyebrow = <p className="eyebrow mb-2">{project.description} · {project.year}</p>;
  const title = <h2 className="mb-4 font-display text-2xl text-ink-strong">{project.title}</h2>;

  const paragraphs = project.content.map((paragraph) => (
    <p key={paragraph.slice(0, 24)} className="mb-4 max-w-[40rem] leading-relaxed text-ink-body">
      {paragraph}
    </p>
  ));

  const techLine = project.technologies && project.technologies.length > 0 && (
    <p className="mb-4 font-sans text-xs tracking-mono text-ink-muted">
      {project.technologies.join(' · ')}
    </p>
  );

  const links = project.links && project.links.length > 0 && (
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
  );

  const media = displayType === 'map' ? (
    <div className="h-[420px] w-full border border-border">
      <LazyProjectMap projectId={project.id} />
    </div>
  ) : displayType === 'image' && project.imagePath ? (
    <div>
      <figure>
        <img
          src={project.imagePath}
          alt={project.imageAlt || `${project.title} visualization`}
          loading="lazy"
          className="w-auto max-w-full"
        />
        {project.imageCaption && (
          <figcaption className="eyebrow mt-2">{project.imageCaption}</figcaption>
        )}
      </figure>
      {project.imageSecondaryText && (
        <p className="mt-2 text-sm text-ink-muted">{project.imageSecondaryText}</p>
      )}
    </div>
  ) : null;

  // displayType 'none': single column, text breathes at the existing 40rem measure.
  if (!hasMedia) {
    return (
      <article className="panel">
        {eyebrow}
        {title}
        {paragraphs}
        {techLine}
        {links}
      </article>
    );
  }

  // With media: two-column at lg, stacked below.
  //
  // DOM is true source order: text → media → links. On mobile the article is a flex column
  // so they render top-to-bottom in that order. At lg it becomes a two-column grid with
  // explicit placement: the text column (col 1, row 1) and links (col 1, row 2) share the
  // left column while the media spans both rows in the right column (col 2). The first row
  // is `1fr` so it absorbs free height and the links land pinned at the column bottom. The
  // single (heavy) map island renders once — no per-breakpoint duplication.
  return (
    <article className="panel flex flex-col lg:grid lg:grid-cols-[minmax(0,26rem)_1fr] lg:grid-rows-[1fr_auto] lg:gap-x-10 lg:items-start">
      <div className="lg:col-start-1 lg:row-start-1">
        {eyebrow}
        {title}
        {paragraphs}
        {techLine}
      </div>
      {media && <div className="my-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:my-0">{media}</div>}
      {links && <div className="mt-6 lg:col-start-1 lg:row-start-2 lg:mt-auto lg:pt-6">{links}</div>}
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
            className="mt-0 space-y-4"
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
