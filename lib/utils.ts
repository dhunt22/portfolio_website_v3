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
