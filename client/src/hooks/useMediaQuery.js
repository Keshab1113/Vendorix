import { useState, useEffect } from 'react';

/**
 * Breakpoint definitions for responsive design
 */
const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  '(max-width: 639px)': '(max-width: 639px)',
  '(max-width: 767px)': '(max-width: 767px)',
  '(max-width: 1023px)': '(max-width: 1023px)',
  '(max-width: 1279px)': '(max-width: 1279px)'
};

/**
 * Custom hook to match media queries
 * @param {string|object} query - Either a breakpoint key or a custom media query string
 * @returns {boolean} Whether the media query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Handle breakpoint key
    const mediaQuery = breakpoints[query] || query;

    const mediaQueryList = window.matchMedia(mediaQuery);

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Create listener
    const listener = (event) => {
      setMatches(event.matches);
    };

    // Add listener for changes
    mediaQueryList.addEventListener('change', listener);

    // Cleanup
    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}

/**
 * Hook to get the current breakpoint
 * @returns {string} The current breakpoint ('sm', 'md', 'lg', 'xl', '2xl')
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('lg');

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1536) setBreakpoint('2xl');
      else if (width >= 1280) setBreakpoint('xl');
      else if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else setBreakpoint('sm');
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return breakpoint;
}

export default useMediaQuery;