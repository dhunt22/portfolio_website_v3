// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/resume/ExperienceItem.tsx
// Documenting experience like a hydrologist documents water flow - in meticulous detail!

import React from 'react';
import { SITE_TYPE } from '@/components/site/type';
import { cn } from '@/lib/utils';

/**
 * ExperienceItem props interface
 * @interface
 * @property {string} title - Job title
 * @property {string} company - Company name
 * @property {string} period - Time period of employment
 * @property {string[]} responsibilities - List of job responsibilities
 */
interface ExperienceItemProps {
  title: string;
  company: string;
  period: string;
  responsibilities: string[];
}

/**
 * Component for displaying a work experience item in the resume
 * @param {ExperienceItemProps} props - Component props
 * @returns {React.JSX.Element} Formatted experience item
 */
const ExperienceItem: React.FC<ExperienceItemProps> = ({
  title,
  company,
  period,
  responsibilities,
}) => {
  return (
    <div className="resume-item grid grid-cols-1 gap-x-6 gap-y-1 border-0 py-6 first:pt-0 min-[861px]:grid-cols-[minmax(0,1fr)_auto]">
      <h3 className={SITE_TYPE.title}>{title}</h3>
      <p className={cn(SITE_TYPE.label, 'min-[861px]:col-start-2 min-[861px]:row-start-1 min-[861px]:whitespace-nowrap min-[861px]:pt-1.5')}>{period}</p>
      <p className={cn(SITE_TYPE.body, 'text-ink-muted')}>{company}</p>
      <ul className="col-span-full mt-3 grid max-w-[70ch] list-disc gap-2 pl-5">
        {responsibilities.map((responsibility, index) => (
          <li key={index} className={SITE_TYPE.body}>{responsibility}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExperienceItem;
