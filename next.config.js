// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// next.config.js
// Configuring Next.js like a hydrologist configures a model - with precision and purpose!

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Netlify
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placeholder.com',
      },
    ],
  },
  
  // Enable strict mode for better development experience
  reactStrictMode: true,
  
  // Netlify handles trailing slashes correctly
  trailingSlash: false,
  
  // Enable transpilePackages if needed
  transpilePackages: ['maplibre-gl'],
  
  // Note: headers() function is not compatible with static export
  // CORS headers should be handled by Netlify via _headers file in public directory
}

module.exports = nextConfig