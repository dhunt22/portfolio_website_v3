// app/not-found.tsx
'use client';

import Link from 'next/link';

/**
 * Custom 404 page component
 * Displays when a page is not found
 */
export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-6">404 - Page Not Found</h1>
      <p className="text-lg mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/"
        className="inline-block bg-forest-600 hover:bg-forest-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200"
      >
        Back to Home
      </Link>
    </div>
  );
}
