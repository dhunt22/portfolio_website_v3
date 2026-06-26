// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/resume/page.tsx
// A resume as flowing as a river - hopefully it doesn't run dry during interviews!

import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import ResumeSection from '@/components/resume/ResumeSection';
import ExperienceItem from '@/components/resume/ExperienceItem';
import SkillsList from '@/components/resume/SkillsList';
import { resume } from '@/content/generated/resume';
import { child } from '@/content/_helpers';
import type { Block } from '@/content/_types';

/**
 * Resume page component showing professional experience, education, and skills
 * @returns {React.JSX.Element} The rendered resume page
 */
export default function ResumePage() {
  const edu = child(resume.education as Block, 'colorado-state-university');

  return (
    <div className="relative min-h-svh">
      <ContourBackdrop page="resume" />

      <div className="container relative z-10 mx-auto max-w-3xl px-6">
        <header className="flex flex-wrap items-baseline justify-between gap-4 pt-16">
          <p className="eyebrow">{resume.header.fields.eyebrow}</p>
          <a
            href={resume.header.links[0].href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View résumé PDF (opens in a new tab)"
            className="link-quiet print:hidden"
          >
            {resume.header.links[0].label}
          </a>
        </header>

        <div className="panel mt-4">
        <div>
          <h1 className="display text-4xl">{resume.header.fields.heading}</h1>
          <p className="mt-1 font-sans font-medium text-xs uppercase tracking-caps text-ink-muted">{resume.header.fields.title}</p>
          <p className="mt-2 text-sm text-ink-muted">
            {resume.header.fields.contact}
          </p>
          <p className="mt-4 font-display text-xl leading-snug text-ink-strong">
            {resume.header.body[0]}
          </p>
        </div>

        <ResumeSection title={resume.professionalExperience.title}>
          {resume.professionalExperience.children.map((job) => (
            <ExperienceItem
              key={job.id}
              title={job.title}
              company={job.fields.company}
              period={job.fields.period}
              responsibilities={job.items}
            />
          ))}
        </ResumeSection>

        <ResumeSection title={resume.education.title}>
          <div>
            <h3 className="font-display text-xl text-ink-strong">{edu.title}</h3>
            <p className="mt-1 text-ink-body">{edu.fields.degree}</p>
            <p className="text-ink-body">{edu.fields.minor}</p>
            <p className="mt-3 leading-relaxed text-ink-body">
              {edu.body[0]}
            </p>
            <div className="mt-4">
              <h4 className="font-display text-base text-ink-strong">{edu.fields['coursework-heading']}</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed text-ink-body marker:text-eyebrow">
                {edu.items.map((course, index) => (
                  <li key={index}>{course}</li>
                ))}
              </ul>
            </div>
          </div>
        </ResumeSection>

        <ResumeSection title={resume.professionalSkills.title}>
          <SkillsList skills={resume.professionalSkills.items} />
        </ResumeSection>

        <ResumeSection title={resume.technicalSkills.title}>
          <SkillsList skills={resume.technicalSkills.items} />
        </ResumeSection>

        <ResumeSection title={resume.additionalAchievements.title}>
          <div className="space-y-2 leading-relaxed text-ink-body">
            {resume.additionalAchievements.body.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </ResumeSection>
        </div>
      </div>
    </div>
  );
}
