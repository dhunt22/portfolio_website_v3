// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/resume/ExperienceItem.tsx
// Documenting experience like a hydrologist documents water flow - in meticulous detail!

import React from 'react';

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
    <div className="resume-item mb-10 last:mb-0">
      <h3 className="font-display text-xl text-ink-strong">{title}</h3>
      <p className="mt-1 text-sm text-ink-body">
        <span className="font-medium">{company}</span>
        <span className="text-ink-muted"> · {period}</span>
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed text-ink-body marker:text-eyebrow">
        {responsibilities.map((responsibility, index) => (
          <li key={index}>{responsibility}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExperienceItem;
