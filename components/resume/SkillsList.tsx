// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/resume/SkillsList.tsx
// Displaying skills like tributaries flowing into a main river - each one contributes to the whole!

import React from 'react';
import { SITE_TYPE } from '@/components/site/type';
import { cn } from '@/lib/utils';

/**
 * SkillsList props interface
 * @interface
 * @property {string[]} skills - List of skills to display
 */
interface SkillsListProps {
  skills: string[];
}

/**
 * Component for displaying a list of skills in the resume
 * @param {SkillsListProps} props - Component props
 * @returns {React.JSX.Element} Formatted skills list
 */
const SkillsList: React.FC<SkillsListProps> = ({ skills }) => {
  return (
    <ul className={cn(SITE_TYPE.body, 'list-disc pl-5 sm:columns-2 sm:gap-x-10 [&>li]:mb-1 [&>li]:break-inside-avoid')}>
      {skills.map((skill, index) => (
        <li key={index}>{skill}</li>
      ))}
    </ul>
  );
};

export default SkillsList;
