import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for intersection observer (infinite scroll / lazy loading)
 * @param {object} options - Intersection observer options
 * @param {string|Element|Function} options.threshold - Intersection threshold
 * @param {string} options.rootMargin - Root margin
 * @param {Element|null} options.root - Root element
 * @param {boolean} options.triggerOnce - Only trigger once when element becomes visible
 * @returns {Array} [ref, isIntersecting, entry]
 */
export function useIntersection(options = {}) {
  const {
    threshold = 0,
    rootMargin = '0px',
    root = null,
    triggerOnce = false
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const ref = useRef(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Skip if triggerOnce has already fired
    if (triggerOnce && hasTriggered.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setEntry(entry);
        setIsIntersecting(isVisible);

        if (isVisible && triggerOnce) {
          hasTriggered.current = true;
          observer.unobserve(element);
        }
      },
      {
        threshold: typeof threshold === 'number' ? threshold : threshold,
        rootMargin,
        root
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, root, triggerOnce]);

  return [ref, isIntersecting, entry];
}

/**
 * Hook for infinite scroll functionality
 * @param {object} options - Configuration options
 * @param {Function} options.onLoadMore - Callback when bottom is reached
 * @param {boolean} options.hasMore - Whether there is more data to load
 * @param {number} options.distance - Distance from bottom to trigger (default: 100)
 * @returns {object} { containerRef, isNearBottom, loading }
 */
export function useInfiniteScroll({ onLoadMore, hasMore = true, distance = 100 } = {}) {
  const [containerRef, isIntersecting] = useIntersection({
    rootMargin: `${distance}px`,
    triggerOnce: false
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      setLoading(true);
      Promise.resolve(onLoadMore()).finally(() => {
        setLoading(false);
      });
    }
  }, [isIntersecting, hasMore, loading, onLoadMore]);

  const isNearBottom = isIntersecting;

  return { containerRef, isNearBottom, loading };
}

/**
 * Hook for lazy loading elements
 * @param {object} options - Configuration options
 * @returns {object} { ref, isVisible, hasLoaded }
 */
export function useLazyLoad(options = {}) {
  const { threshold = 0.1, triggerOnce = true } = options;

  const [ref, isIntersecting] = useIntersection({
    threshold,
    triggerOnce
  });

  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isIntersecting, hasLoaded]);

  return { ref, isVisible: isIntersecting, hasLoaded };
}

export default useIntersection;