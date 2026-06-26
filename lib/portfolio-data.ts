// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// lib/portfolio-data.ts
// Portfolio projects: structural config (lib/page-config.json) merged with the
// editable text from content/portfolio.md (content/generated/portfolio.ts), joined by id.

import { portfolio as content } from '@/content/generated/portfolio';
import { portfolioConfig } from '@/lib/page-config';
import { field } from '@/content/_helpers';
import type { Block } from '@/content/_types';

/**
 * Interface for portfolio project data
 */
export interface Project {
  id: string;
  title: string;
  description: string;
  categories: string[];
  content: string[];
  links?: {
    href: string;
    label: string;
    iconType?: 'github' | 'external' | 'document' | 'website';
  }[];
  featured?: boolean;
  year?: string;
  technologies?: string[];
  displayType?: 'map' | 'image' | 'none';
  imagePath?: string;
  imageAlt?: string;
  imageCaption?: string;
  imageSecondaryText?: string;
  imageFit?: 'cover' | 'contain';
}

// Index the markdown project cards by their **id:** field for the config join.
const cardsById = Object.fromEntries(
  (content.projects.children as Block[]).map((card) => [field(card, 'id'), card]),
);

/**
 * Project data array — assembled from structural config + markdown text.
 */
export const PROJECTS: Project[] = portfolioConfig.map((cfg) => {
  const card = cardsById[cfg.id];
  if (!card) throw new Error(`portfolio: no markdown card for "${cfg.id}"`);
  const links = (cfg.links ?? []).map((l) => {
    const md = card.links.find((m) => m.href === l.href);
    return { href: l.href, label: md ? md.label : l.href, iconType: l.iconType };
  });
  return {
    id: cfg.id,
    title: card.title,
    description: field(card, 'description'),
    categories: [...cfg.categories],
    content: card.body,
    links: links.length ? links : undefined,
    featured: cfg.featured,
    year: cfg.year,
    technologies: cfg.technologies ? [...cfg.technologies] : undefined,
    displayType: cfg.displayType,
    imagePath: card.image?.src,
    imageAlt: card.image?.alt,
    imageCaption: card.image?.caption,
    imageSecondaryText: card.fields['image-note'],
    imageFit: cfg.imageFit,
  };
});

/**
 * Get projects filtered by category
 */
export function getProjectsByCategory(category: string): Project[] {
  return PROJECTS.filter((project) => project.categories.includes(category));
}

/**
 * Get featured projects
 */
export function getFeaturedProjects(): Project[] {
  return PROJECTS.filter((project) => project.featured);
}

/**
 * Get project by ID
 */
export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find((project) => project.id === id);
}
