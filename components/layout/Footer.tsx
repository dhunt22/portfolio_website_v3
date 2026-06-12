// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/layout/Footer.tsx
// The bottom of our watershed - where all information collects before flowing out to sea!

import Link from 'next/link';
import { GitHubIcon, LinkedInIcon, EmailIcon } from '@/components/ui/icons/common-icons';

/**
 * Footer component with contact information and site links
 * @returns {React.JSX.Element} Footer with navigation and contact info
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between py-10">
          {/* Block 1: About */}
          <div>
            <h3 className="font-display text-ink-strong">Devin Hunt</h3>
            <p className="text-sm text-ink-muted max-w-xs mt-3">
              Water Resources Engineer with a passion for sustainable water management and
              outdoor exploration.
            </p>
            <p className="text-sm text-ink-muted max-w-xs mt-3">
              Based in California, working across multiple groundwater basins to address water resource challenges.
            </p>
          </div>

          {/* Block 2: Quick Links */}
          <div>
            <p className="eyebrow mb-3">Site Navigation</p>
            <nav className="flex flex-col gap-2 items-start" aria-label="Footer">
              <Link href="/" className="link-quiet">
                Home
              </Link>
              <Link href="/resume" className="link-quiet">
                Resume
              </Link>
              <Link href="/portfolio" className="link-quiet">
                Portfolio
              </Link>
              <Link href="/interests" className="link-quiet">
                Personal Interests
              </Link>
            </nav>
          </div>

          {/* Block 3: Contact */}
          <div>
            <p className="eyebrow mb-3">Contact</p>
            <a href="mailto:contact@devinhunt.com" className="link-quiet inline-flex items-center gap-2">
              <EmailIcon className="w-4 h-4" aria-hidden={true} />
              contact@devinhunt.com
            </a>
            <div className="flex gap-5 mt-5">
              <a
                href="https://github.com/dhunt22"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-muted hover:text-ink-strong transition-colors"
                aria-label="GitHub Profile"
              >
                <GitHubIcon className="w-5 h-5" aria-hidden={true} />
              </a>
              <a
                href="https://www.linkedin.com/in/devinthunt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-muted hover:text-ink-strong transition-colors"
                aria-label="LinkedIn Profile"
              >
                <LinkedInIcon className="w-5 h-5" aria-hidden={true} />
              </a>
            </div>
          </div>
        </div>

        <div className="pb-10">
          <p className="font-sans text-[0.6875rem] text-ink-faint">&copy; {currentYear} Devin Hunt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
