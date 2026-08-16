"use client";

import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  /** The final numeric value to count toward. */
  target: number;
  /** Duration of the animation in milliseconds. Default: 2000. */
  duration?: number;
  /** Start counting only when this is true (e.g. element is in view). Default: true. */
  enabled?: boolean;
  /** Number of decimal places to preserve in the output. Default: 0. */
  decimals?: number;
  /** Easing function (t ∈ [0,1] → progress ∈ [0,1]). Default: easeOutExpo. */
  easing?: (t: number) => number;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Animates a numeric value from 0 to `target` using requestAnimationFrame.
 * Respects `prefers-reduced-motion` — jumps straight to target when reduced.
 */
export function useCountUp({
  target,
  duration = 2000,
  enabled = true,
  decimals = 0,
  easing = easeOutExpo,
}: UseCountUpOptions): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Respect prefers-reduced-motion
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setValue(target);
      return;
    }

    const tick = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      setValue(parseFloat((easedProgress * target).toFixed(decimals)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      startTimeRef.current = null;
    };
  }, [target, duration, enabled, decimals, easing]);

  return value;
}
