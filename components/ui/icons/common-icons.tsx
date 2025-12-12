// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/ui/icons/common-icons.tsx
// Common reusable SVG icons for better performance and consistency

import React from 'react';

interface IconProps {
  className?: string;
  'aria-hidden'?: boolean;
}

export const DownloadIcon: React.FC<IconProps> = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);

export const ExternalLinkIcon: React.FC<IconProps> = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

export const MapIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

export const FishingPoleIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 512 512" {...props}>
    <path d="M500.241,40.147c0-4.41-1.752-8.64-4.872-11.759L471.853,4.869c-6.49-6.491-17.026-6.493-23.518,0
      c-7.509,7.509-414.51,414.51-421.987,421.987c-19.453,19.452-19.453,51.103,0,70.556c19.451,19.451,51.103,19.452,70.556,0
      l69.883-69.883c25.996,25.997,68.075,25.999,94.074,0c25.936-25.936,25.936-68.137,0-94.074
      c-17.473-17.473-42.044-23.143-64.263-17.227l-6.293-6.293l47.037-47.038l11.759,11.76c6.493,6.495,17.023,6.495,23.518,0
      c6.495-6.495,6.495-17.024,0-23.518l-11.759-11.76l47.038-47.037l11.759,11.76c6.493,6.495,17.022,6.495,23.518,0
      c6.495-6.495,6.495-17.024,0-23.518l-11.759-11.76l47.038-47.038l11.759,11.76c6.493,6.495,17.022,6.495,23.518,0
      c6.495-6.495,6.495-17.024,0-23.518L401.97,98.27l58.124-58.124l6.888,6.888v411.465c0,10.282-8.366,18.648-18.648,18.648
      c-10.282,0-18.647-8.365-18.647-18.648v-11.76c0-9.184-7.446-16.63-16.63-16.63c-9.184,0-16.63,7.446-16.63,16.63v11.76
      c0,28.621,23.286,51.908,51.908,51.908s51.907-23.285,51.907-51.908V40.147H500.241z M149.596,397.682l-76.211,76.211
      c-6.485,6.486-17.035,6.485-23.519,0s-6.485-17.035,0-23.519l116.92-116.919C149.414,350.826,143.697,375.491,149.596,397.682z
       M237.34,356.973c12.967,12.968,12.967,34.068,0,47.037c-12.998,12.998-34.038,12.999-47.037,0
      c-12.967-12.968-12.967-34.068,0-47.037C203.302,343.975,224.341,343.973,237.34,356.973z"/>
  </svg>
);

// Legacy alias for backward compatibility
export const FishIcon = FishingPoleIcon;

export const MenuIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const EmailIcon: React.FC<IconProps> = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const LinkedInIcon: React.FC<IconProps> = ({ className = "w-4 h-4", ...props }) => (
  <img
    src="/icons/InBug-White.png"
    alt="LinkedIn"
    className={className}
    {...props}
  />
);

// GitHub icon that switches based on theme (for portfolio/project pages)
export const GitHubIcon: React.FC<IconProps> = ({ className = "w-4 h-4", ...props }) => (
  <>
    <img
      src="/icons/github-mark.svg"
      alt="GitHub"
      className={`${className} dark:hidden`}
      {...props}
    />
    <img
      src="/icons/github-mark-white.svg"
      alt="GitHub"
      className={`${className} hidden dark:block`}
      {...props}
    />
  </>
);

// GitHub icon that's always white (for footer)
export const GitHubIconWhite: React.FC<IconProps> = ({ className = "w-4 h-4", ...props }) => (
  <img
    src="/icons/github-mark-white.svg"
    alt="GitHub"
    className={className}
    {...props}
  />
);
