// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/not-found.tsx
// A 404 page that flows like a river finding its way back to the source!

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapIcon } from '@/components/ui/icons/common-icons';

/**
 * 404 Not Found page component
 * @returns {React.JSX.Element} The rendered 404 page
 */
export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-forest-100 mb-6">
            <MapIcon className="w-12 h-12 text-forest-600" aria-hidden={true} />
          </div>
          
          <h1 className="text-6xl font-bold text-forest-800 mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-semibold text-forest-700 mb-6">
            Page Not Found
          </h2>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-forest-200">
          <CardHeader className="text-center">
            <CardTitle className="text-forest-700">
              Looks like this stream dried up!
            </CardTitle>
            <CardDescription className="text-forest-600">
              The page you're looking for seems to have wandered off like water finding a new path. 
              Let's get you back to familiar waters.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center pb-8">
            <div className="space-y-4">
              <p className="text-forest-600 mb-6">
                Don't worry – even the best explorers sometimes take unexpected detours. 
                Every watershed eventually finds its way back to the main channel.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button className="bg-river-600 hover:bg-river-700 w-full sm:w-auto">
                    Return Home
                  </Button>
                </Link>
                
                <Link href="/portfolio">
                  <Button 
                    variant="outline" 
                    className="border-forest-600 text-forest-600 hover:bg-forest-50 w-full sm:w-auto"
                  >
                    View Portfolio
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 pt-6 border-t border-forest-200">
                <p className="text-sm text-forest-500 mb-4">
                  Looking for something specific?
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center text-sm">
                  <Link 
                    href="/resume" 
                    className="text-forest-600 hover:text-forest-800 underline underline-offset-2"
                  >
                    Resume
                  </Link>
                  <span className="text-forest-400">•</span>
                  <Link 
                    href="/interests" 
                    className="text-forest-600 hover:text-forest-800 underline underline-offset-2"
                  >
                    Interests
                  </Link>
                  <span className="text-forest-400">•</span>
                  <a 
                    href="mailto:contact@devinhunt.com" 
                    className="text-forest-600 hover:text-forest-800 underline underline-offset-2"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8">
          <blockquote className="text-forest-600 italic">
            "The best way out is always through."
            <footer className="text-forest-500 mt-1">— Robert Frost</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
