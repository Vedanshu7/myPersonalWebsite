"use client";

import { useRef } from "react";
import type { MotionValue } from "framer-motion";
import { useScroll, useTransform } from "framer-motion";

export interface PinnedScrollValues {
  ref: React.RefObject<HTMLDivElement | null>;
  scrollYProgress: MotionValue<number>;
  phase1Opacity: MotionValue<number>;
  phase1Y: MotionValue<number>;
  phase2Opacity: MotionValue<number>;
  phase2Y: MotionValue<number>;
  phase3Opacity: MotionValue<number>;
  phase3Y: MotionValue<number>;
  glowOpacity: MotionValue<number>;
}

/**
 * Provides scroll-linked motion values for a three-phase pinned section animation.
 *
 * @returns A {@link PinnedScrollValues} object containing a container ref and Framer Motion values for each phase.
 */
export function usePinnedScroll(): PinnedScrollValues {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const phase1Opacity = useTransform(scrollYProgress, [0, 0.25, 0.38], [1, 1, 0]);
  const phase1Y = useTransform(scrollYProgress, [0, 0.25, 0.38], [0, 0, -30]);

  const phase2Opacity = useTransform(scrollYProgress, [0.35, 0.46, 0.6, 0.7], [0, 1, 1, 0]);
  const phase2Y = useTransform(scrollYProgress, [0.35, 0.46, 0.6, 0.7], [30, 0, 0, -30]);

  const phase3Opacity = useTransform(scrollYProgress, [0.68, 0.78, 0.93, 1.0], [0, 1, 1, 0]);
  const phase3Y = useTransform(scrollYProgress, [0.68, 0.78, 0.93, 1.0], [30, 0, 0, -30]);

  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.05, 0.12, 0.05]);

  return {
    ref,
    scrollYProgress,
    phase1Opacity,
    phase1Y,
    phase2Opacity,
    phase2Y,
    phase3Opacity,
    phase3Y,
    glowOpacity,
  };
}
