// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/resume/ResumeSection.tsx
// Organizing resume sections like well-defined watershed basins!

import React from 'react';
import { SITE_TYPE } from '@/components/site/type';

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
    <section className="pt-12 first:pt-0">
      <h2 className={SITE_TYPE.headline}>{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
};

export default ResumeSection;
