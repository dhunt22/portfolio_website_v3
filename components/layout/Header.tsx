// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/layout/Header.tsx
// A header that flows as smoothly as a well-managed watershed!

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MenuIcon, CloseIcon } from '@/components/ui/icons/common-icons';

/**
 * Navigation link component for desktop view
 * @param {Object} props - Component props
 * @param {string} props.href - Link destination
 * @param {React.ReactNode} props.children - Link text
 * @param {string} props.currentPath - Current pathname for active state
 * @returns {React.JSX.Element} Navigation link
 */
function NavLink({ href, children, currentPath }: { 
  href: string; 
  children: React.ReactNode;
  currentPath: string;
}) {
  const isActive = currentPath === href || (href !== '/' && currentPath.startsWith(href));
  
  return (
    <Link 
      href={href} 
      className={`text-forest-700 hover:text-forest-900 transition-colors duration-200 relative ${
        isActive ? 'text-forest-900 font-semibold' : ''
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-forest-700 rounded-full" />
      )}
    </Link>
  );
}

/**
 * Navigation link component for mobile view
 * @param {Object} props - Component props
 * @param {string} props.href - Link destination
 * @param {() => void} props.onClick - Click handler function
 * @param {React.ReactNode} props.children - Link text
 * @param {string} props.currentPath - Current pathname for active state
 * @returns {React.JSX.Element} Mobile navigation link
 */
function MobileNavLink({ 
  href, 
  onClick, 
  children,
  currentPath
}: { 
  href: string; 
  onClick: () => void; 
  children: React.ReactNode;
  currentPath: string;
}) {
  const isActive = currentPath === href || (href !== '/' && currentPath.startsWith(href));
  
  return (
    <Link 
      href={href} 
      className={`block px-2 py-1 text-forest-700 hover:text-forest-900 transition-colors duration-200 ${
        isActive ? 'text-forest-900 font-semibold bg-forest-50 rounded' : ''
      }`}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}

/**
 * Header component with navigation menu
 * @returns {React.JSX.Element} Header with navigation
 */
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Memoized mobile menu toggle
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full bg-white/90 backdrop-blur-md shadow-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-xl text-forest-800">
            Devin Hunt
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6" role="navigation" aria-label="Main navigation">
            <NavLink href="/" currentPath={pathname}>Home</NavLink>
            <NavLink href="/resume" currentPath={pathname}>Resume</NavLink>
            <NavLink href="/portfolio" currentPath={pathname}>Portfolio</NavLink>
            <NavLink href="/interests" currentPath={pathname}>Interests</NavLink>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-forest-800 p-2 hover:bg-forest-50 rounded-md transition-colors duration-200"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden py-4 border-t border-forest-100 animate-in slide-in-from-top-2 duration-200"
          >
            <nav className="flex flex-col space-y-4" role="navigation" aria-label="Mobile navigation">
              <MobileNavLink href="/" onClick={closeMobileMenu} currentPath={pathname}>
                Home
              </MobileNavLink>
              <MobileNavLink href="/resume" onClick={closeMobileMenu} currentPath={pathname}>
                Resume
              </MobileNavLink>
              <MobileNavLink href="/portfolio" onClick={closeMobileMenu} currentPath={pathname}>
                Portfolio
              </MobileNavLink>
              <MobileNavLink href="/interests" onClick={closeMobileMenu} currentPath={pathname}>
                Interests
              </MobileNavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
