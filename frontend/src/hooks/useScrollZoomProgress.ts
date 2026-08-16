'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Tracks scroll progress (0 → 1) through a pinned outer wrapper element.
 * - 0 = the wrapper's top is at the viewport top (pin just engaged)
 * - 1 = the wrapper's bottom is at the viewport bottom (pin about to release)
 *
 * Uses a single rAF-debounced scroll/resize listener for perf.
 */
export function useScrollZoomProgress(outerRef: React.RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    const compute = () => {
      const rect = outer.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) { setProgress(0); return; }
      const raw = -rect.top / scrollable;
      setProgress(Math.min(1, Math.max(0, raw)));
    };

    const onScroll = () => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        compute();
        rafId.current = null;
      });
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [outerRef]);

  return progress;
}
