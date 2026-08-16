"use client";

import { useEffect, useRef } from "react";

/**
 * Tracks pointer position within an element and writes CSS custom properties
 * `--mx` and `--my` (both normalised to [-0.5, 0.5]) onto the element's style.
 *
 * Components can consume these vars to drive 3D tilt transforms and pointer
 * glow effects without any per-render React state overhead.
 *
 * When `prefers-reduced-motion: reduce` is set the hook installs no listeners
 * and the vars are never written (transforms should default to `none`).
 */
export function usePointerGlow<T extends HTMLElement = HTMLElement>(
  /** Factor to amplify the raw normalised value. Default 1. */
  amplify = 1
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width - 0.5) * amplify;
      const my = ((e.clientY - rect.top) / rect.height - 0.5) * amplify;
      el.style.setProperty("--mx", mx.toFixed(4));
      el.style.setProperty("--my", my.toFixed(4));
    };

    const onLeave = () => {
      // Animate back to centre by clearing — CSS transition on the consumer
      // handles the smooth return.
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [amplify]);

  return ref;
}
