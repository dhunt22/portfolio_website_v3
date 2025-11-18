// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/resume/ResumeSection.tsx
// Organizing resume sections like well-defined watershed basins!

import React from 'react';

/**
 * ResumeSection props interface
 * @interface
 * @property {string} title - Section title
 * @property {React.ReactNode} children - Section content
 */
interface ResumeSectionProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Component for displaying a section in the resume
 * @param {ResumeSectionProps} props - Component props
 * @returns {React.JSX.Element} Formatted resume section
 */
const ResumeSection: React.FC<ResumeSectionProps> = ({ title, children }) => {
  return (
    <section
      className="mb-6 print:mb-4 p-4 -m-4 rounded-lg transition-all duration-300 hover:bg-forest-50/50 dark:hover:bg-forest-900/20 focus-within:bg-forest-50/50 dark:focus-within:bg-forest-900/20 focus-within:outline-none focus-within:ring-2 focus-within:ring-river-300"
      tabIndex={0}
      aria-label={`${title} section`}
    >
      <h2 className="text-2xl font-semibold text-forest-700 dark:text-forest-300 mb-4 pb-2 border-b border-forest-200 dark:border-forest-700 print:text-xl">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
};

export default ResumeSection;
