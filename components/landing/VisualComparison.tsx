"use client";

import { Card } from "@/components/ui/card";
import {
  ArrowDown,
  ArrowRight,
  FolderOpen,
  Code,
  Terminal,
} from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { BouncingIcon } from "./icons/BouncingIcon";
import { toolIcons } from "./icons/iconConfig";

export function VisualComparison() {
  const ref = useRef(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const allIconPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const reducedMotion = useReducedMotion() === true;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
      },
    }),
  };

  return (
    <section id="visual-comparison" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Labels */}
        <motion.div
          ref={ref}
          className="flex justify-between max-w-5xl mx-auto mb-6 px-4"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.p
            variants={itemVariants}
            className="text-sm text-muted-foreground uppercase tracking-wider font-medium"
          >
            Your Knowledge Today...
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="text-sm text-accent uppercase tracking-wider font-medium"
          >
            ...With DevStash
          </motion.p>
        </motion.div>

        {/* Comparison: mobile = stacked; md+ = 3 columns */}
        <motion.div
          className="mx-auto flex max-w-5xl flex-col gap-6 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-x-8 lg:gap-x-12 md:gap-y-0"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Before - Scattered with bouncing icons */}
          <motion.div variants={itemVariants} className="min-w-0">
            <Card
              ref={cardRef}
              className="group/card p-8 bg-card/65 border-white/20 relative overflow-hidden min-h-[320px] card-pattern transition-all hover:border-white/30"
            >
              <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-br from-muted/30 via-muted/10 to-transparent" />

              {/* Ambient glow effect */}
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/4 w-28 h-28 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-green-500/20 rounded-full blur-3xl" />
              </div>

              {/* Inner glow for depth */}
              <div className="absolute inset-0 rounded-xl card-inner-glow pointer-events-none" />

              <div className="relative w-full h-full min-h-[260px]">
                {toolIcons.map((tile, i) => (
                  <motion.div
                    key={tile.id}
                    custom={i}
                    variants={iconVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                  >
                    <BouncingIcon
                      id={tile.id}
                      icon={tile.icon}
                      label={tile.label}
                      description={tile.description}
                      brandColor={tile.brandColor}
                      brandColorLight={tile.brandColorLight}
                      position={tile.position}
                      index={i}
                      reducedMotion={reducedMotion}
                      containerRef={cardRef}
                      allIconPositions={allIconPositions}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Chaos indicator */}
              <motion.div
                className="absolute bottom-3 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 0.6 } : { opacity: 0 }}
                transition={{ delay: 1 }}
              >
              </motion.div>
            </Card>
          </motion.div>

          {/* Arrow */}
          <motion.div
            className="flex shrink-0 justify-center py-1 md:px-2 md:py-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.35, duration: 0.45 }}
          >
            <motion.div
              className="pointer-events-none flex flex-col items-center gap-1 rounded-full border border-border/60 bg-background/95 px-5 py-3 shadow-lg ring-1 ring-accent/20 backdrop-blur-sm glow-amber md:px-4 md:py-3"
              animate={
                isInView && !reducedMotion
                  ? { scale: [1, 1.04, 1] }
                  : { scale: 1 }
              }
              transition={{
                duration: 2.8,
                repeat: isInView && !reducedMotion ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              <ArrowDown
                className="size-8 text-accent md:hidden"
                strokeWidth={2.5}
                aria-hidden
              />
              <ArrowRight
                className="hidden size-8 text-accent md:block"
                strokeWidth={2}
                aria-hidden
              />
            </motion.div>
          </motion.div>

          {/* After - Organized */}
          <motion.div variants={itemVariants} className="min-w-0">
            <Card className="p-8 bg-card/70 border-white/25 relative overflow-hidden glow-amber card-pattern transition-all hover:border-white/35">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
              
              {/* Inner glow for depth */}
              <div className="absolute inset-0 rounded-xl card-inner-glow pointer-events-none" />

              {/* Organized structure mockup */}
              <div className="relative">
                <div className="flex gap-4">
                  {/* Sidebar */}
                  <div className="w-16 space-y-2">
                    <motion.div
                      className="size-8 rounded-lg bg-primary/20 flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <FolderOpen className="size-4 text-primary" />
                    </motion.div>
                    <div className="space-y-1.5">
                      <motion.div
                        className="h-2 w-full rounded bg-muted"
                        initial={{ width: 0 }}
                        animate={isInView ? { width: "100%" } : { width: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                      />
                      <motion.div
                        className="h-2 w-3/4 rounded bg-muted"
                        initial={{ width: 0 }}
                        animate={isInView ? { width: "75%" } : { width: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                      />
                      <motion.div
                        className="h-2 w-full rounded bg-muted"
                        initial={{ width: 0 }}
                        animate={isInView ? { width: "100%" } : { width: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                      />
                    </div>
                  </div>

                  {/* Content area */}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <motion.div
                        className="h-16 rounded-lg bg-card border-l-2 border-l-accent p-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ delay: 0.8, duration: 0.4 }}
                      >
                        <div className="h-2 w-16 rounded bg-muted mb-1" />
                        <div className="h-1.5 w-8 rounded bg-muted/50" />
                      </motion.div>
                      <motion.div
                        className="h-16 rounded-lg bg-card border-l-2 border-l-primary p-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                        transition={{ delay: 0.9, duration: 0.4 }}
                      >
                        <div className="h-2 w-16 rounded bg-muted mb-1" />
                        <div className="h-1.5 w-8 rounded bg-muted/50" />
                      </motion.div>
                    </div>
                    <div className="space-y-2">
                      <motion.div
                        className="h-10 rounded-lg bg-card flex items-center gap-2 px-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ delay: 1, duration: 0.4 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                      >
                        <div className="size-6 rounded bg-accent/20 flex items-center justify-center">
                          <Code className="size-3 text-accent" />
                        </div>
                        <div className="h-2 w-24 rounded bg-muted" />
                      </motion.div>
                      <motion.div
                        className="h-10 rounded-lg bg-card flex items-center gap-2 px-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ delay: 1.1, duration: 0.4 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                      >
                        <div className="size-6 rounded bg-primary/20 flex items-center justify-center">
                          <Terminal className="size-3 text-primary" />
                        </div>
                        <div className="h-2 w-20 rounded bg-muted" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Success indicator */}
                <motion.div
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 1.5 }}
                >
                  <span className="text-[10px] text-accent/80 uppercase tracking-widest">
                    Organized and Searchable
                  </span>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}