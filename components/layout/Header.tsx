// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/layout/Header.tsx
// A header that flows as smoothly as a well-managed watershed!

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuIcon, CloseIcon } from '@/components/ui/icons/common-icons';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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
  currentPath: string | null;
}) {
  const isActive = currentPath === href || (href !== '/' && currentPath?.startsWith(href));

  return (
    <Link
      href={href}
      className={`eyebrow transition-colors duration-200 hover:text-ink-strong ${
        isActive
          ? 'text-ink-strong underline decoration-accent decoration-2 underline-offset-8'
          : ''
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}

/**
 * Navigation link with dropdown for desktop view
 */
function NavLinkWithDropdown({ href, children, currentPath, dropdownItems }: {
  href: string;
  children: React.ReactNode;
  currentPath: string | null;
  dropdownItems: { href: string; label: string }[];
}) {
  const isActive = currentPath === href || (href !== '/' && currentPath?.startsWith(href));

  return (
    <div className="relative group">
      <Link
        href={href}
        className={`eyebrow transition-colors duration-200 hover:text-ink-strong ${
          isActive
            ? 'text-ink-strong underline decoration-accent decoration-2 underline-offset-8'
            : ''
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        {children}
      </Link>
      {/* Dropdown on hover */}
      <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="bg-background border border-border rounded-md shadow-lg py-1 min-w-max">
          {dropdownItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-6 py-2 text-sm text-ink-muted hover:bg-secondary hover:text-ink-strong transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
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
  currentPath: string | null;
}) {
  const isActive = currentPath === href || (href !== '/' && currentPath?.startsWith(href));

  return (
    <Link
      href={href}
      className={`block px-2 py-1 eyebrow transition-colors duration-200 hover:text-ink-strong ${
        isActive
          ? 'text-ink-strong underline decoration-accent decoration-2 underline-offset-8'
          : ''
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
      className="fixed top-0 inset-x-0 z-50 border-b border-border bg-[color-mix(in_srgb,var(--surface-page)_88%,transparent)] backdrop-blur-[10px]"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-display text-lg font-medium text-ink-strong">
            Devin Hunt
          </Link>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex space-x-6 items-center" role="navigation" aria-label="Main navigation">
              <NavLink href="/" currentPath={pathname}>Home</NavLink>
              <NavLink href="/resume" currentPath={pathname}>Resume</NavLink>
              <NavLinkWithDropdown
                href="/portfolio"
                currentPath={pathname}
                dropdownItems={[
                  { href: '/portfolio/environmental-justice-prisons', label: 'NASA EEJ: Prisons' }
                ]}
              >
                Portfolio
              </NavLinkWithDropdown>
              <NavLink href="/interests" currentPath={pathname}>Interests</NavLink>
            </nav>

            {/* Theme Toggle - Desktop */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="text-ink-strong p-2 hover:bg-secondary rounded-md transition-colors duration-200"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu — full-bleed so opaque background spans the viewport */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-background border-b border-border animate-rise"
        >
          <div className="container mx-auto px-6 py-4">
            <nav className="flex flex-col space-y-4" role="navigation" aria-label="Mobile navigation">
              <MobileNavLink href="/" onClick={closeMobileMenu} currentPath={pathname}>
                Home
              </MobileNavLink>
              <MobileNavLink href="/resume" onClick={closeMobileMenu} currentPath={pathname}>
                Resume
              </MobileNavLink>
              <div className="flex items-center gap-2">
                <MobileNavLink href="/portfolio" onClick={closeMobileMenu} currentPath={pathname}>
                  Portfolio
                </MobileNavLink>
                <span className="text-ink-faint text-sm">›</span>
                <Link
                  href="/portfolio/environmental-justice-prisons"
                  onClick={closeMobileMenu}
                  className="eyebrow transition-colors duration-200 hover:text-ink-strong"
                >
                  NASA EEJ
                </Link>
              </div>
              <MobileNavLink href="/interests" onClick={closeMobileMenu} currentPath={pathname}>
                Interests
              </MobileNavLink>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
