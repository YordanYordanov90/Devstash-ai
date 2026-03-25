"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export interface ScrollProgressProps {
  /**
   * Pixels from top of viewport.
   * Landing header is `h-16` (64px), so default is 64.
   */
  topOffsetPx?: number;
}

export function ScrollProgress({ topOffsetPx = 64 }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    mass: 0.2,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 right-0 z-50 h-px bg-white/25"
      style={{ top: topOffsetPx }}
    >
      <motion.div
        className="h-full w-full origin-left bg-white/80"
        style={{ scaleX }}
      />
    </motion.div>
  );
}

