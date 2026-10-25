// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// lib/utils.ts
// Utility functions flowing like groundwater - invisible but essential!

import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Without this, tailwind-merge reads the text-site-* font sizes as text colours and drops them.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['site-display', 'site-headline', 'site-title', 'site-lead', 'site-body', 'site-label'] }],
    },
  },
})

/**
 * Combines class names with tailwind merge for optimized class usage
 * @param {ClassValue[]} inputs - Class values to merge
 * @returns {string} Merged and optimized class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to a readable string
 * @param {Date} date - Date to format
 * @param {Intl.DateTimeFormatOptions} options - Format options
 * @returns {string} Formatted date string
 */
export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
): string {
  return new Date(date).toLocaleDateString('en-US', options)
}

/**
 * Truncates text to a specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Creates a slug from a string
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}
