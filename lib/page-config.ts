// lib/page-config.ts
// Non-text structural config for portfolio + interests, joined to markdown by id.
// Source of truth is page-config.json (also read by scripts/sync-content.mjs).
import config from '@/lib/page-config.json';

export interface PortfolioConfigEntry {
  id: string;
  categories: string[];
  year?: string;
  featured?: boolean;
  technologies?: string[];
  displayType?: 'map' | 'image' | 'none';
  imageFit?: 'cover' | 'contain';
  links?: { href: string; iconType?: 'github' | 'external' | 'document' | 'website' }[];
}

export interface InterestConfigEntry {
  id: string;
  imagePosition?: 'left' | 'right';
  objectPosition?: 'bottom' | 'center';
}

export const portfolioConfig = config.portfolio as PortfolioConfigEntry[];
export const interestsConfig = config.interests as InterestConfigEntry[];
