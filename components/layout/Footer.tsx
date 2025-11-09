// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/layout/Footer.tsx
// The bottom of our watershed - where all information collects before flowing out to sea!

import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { GitHubIcon, LinkedInIcon, EmailIcon } from '@/components/ui/icons/common-icons';

/**
 * Footer component with contact information and site links
 * @returns {React.JSX.Element} Footer with navigation and contact info
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-forest-900 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: About */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Devin Hunt</h3>
            <p className="text-forest-100 mb-4">
              Water Resources Engineer with a passion for sustainable water management and
              outdoor exploration.
            </p>
            <p className="text-forest-100">
              Based in California, working across multiple basins to address water resource challenges.
            </p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Site Navigation</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-forest-100 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/resume" className="text-forest-100 hover:text-white transition-colors">
                Resume
              </Link>
              <Link href="/portfolio" className="text-forest-100 hover:text-white transition-colors">
                Portfolio
              </Link>
              <Link href="/interests" className="text-forest-100 hover:text-white transition-colors">
                Personal Interests
              </Link>
            </nav>
          </div>
          
          {/* Column 3: Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Contact</h3>
            <p className="flex items-center text-forest-100 mb-2">
              <EmailIcon className="mr-2 w-5 h-5" aria-hidden={true} />
              <a href="mailto:contact@devinhunt.com" className="hover:underline">
                contact@devinhunt.com
              </a>
            </p>
            <div className="flex space-x-5 mt-5">
              <a 
                href="https://github.com/dhunt22" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-forest-100 hover:text-white transition-colors"
                aria-label="GitHub Profile"
              >
                <GitHubIcon className="w-5 h-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/devinthunt" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-forest-100 hover:text-white transition-colors"
                aria-label="LinkedIn Profile"
              >
                <LinkedInIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <Separator className="my-6 bg-forest-700" />
        
        <div className="text-center text-forest-300 text-sm">
          <p>&copy; {currentYear} Devin Hunt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
