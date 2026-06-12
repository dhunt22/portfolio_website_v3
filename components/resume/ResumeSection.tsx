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
    <section className="py-6">
      <h2 className="eyebrow mb-6">{title}</h2>
      {children}
    </section>
  );
};

export default ResumeSection;
