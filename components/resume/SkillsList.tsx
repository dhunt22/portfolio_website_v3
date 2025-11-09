// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/resume/SkillsList.tsx
// Displaying skills like tributaries flowing into a main river - each one contributes to the whole!

import React from 'react';

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
    <ul className="grid grid-cols-1 gap-2">
      {skills.map((skill, index) => (
        <li key={index} className="flex items-start">
          <span className="text-forest-600 dark:text-forest-400 mr-2">•</span>
          <span className="text-forest-800 dark:text-white">{skill}</span>
        </li>
      ))}
    </ul>
  );
};

export default SkillsList;
