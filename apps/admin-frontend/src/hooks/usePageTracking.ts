/**
 * usePageTracking Hook
 *
 * Automatically tracks page views when route changes in React Router
 *
 * Usage:
 * In your main App component:
 * import { usePageTracking } from './hooks/usePageTracking';
 *
 * function App() {
 *   usePageTracking();
 *   return <Routes>...</Routes>
 * }
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Track page view whenever route changes
    const path = location.pathname + location.search;

    trackPageView(path);

    // Optional: Log to console in development
    if (import.meta.env.DEV) {
      console.log('📍 Page View Tracked:', {
        path: location.pathname,
        search: location.search,
        title: document.title,
      });
    }
  }, [location]);
}

/**
 * Advanced version with custom title per route
 */
export function usePageTrackingWithTitle(title?: string) {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname + location.search;

    // Update document title if provided
    if (title) {
      document.title = title;
    }

    trackPageView(path, title);

    if (import.meta.env.DEV) {
      console.log('📍 Page View Tracked:', {
        path: location.pathname,
        title: title || document.title,
      });
    }
  }, [location, title]);
}
