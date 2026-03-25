"use client";

import { Card } from "@/components/ui/card";
import { landingFeatures } from "@/lib/landing/feature-definitions";
import { motion, useInView } from "framer-motion";
import type { CSSProperties } from "react";
import { useRef } from "react";

export function Features() {
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });
  const isGridInView = useInView(gridRef, { once: true, amount: 0.1 });

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section id="features" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section divider */}
        <div className="section-divider mb-16 md:mb-24" />

        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-12 md:mb-16"
          initial="hidden"
          animate={isHeaderInView ? "visible" : "hidden"}
          variants={headerVariants}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <span className="text-foreground">Everything You Need, </span>
            <span className="text-gradient-warm">One Place</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Stop context-switching between tools. DevStash keeps all your developer
            resources organized and searchable.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          ref={gridRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          initial="hidden"
          animate={isGridInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {landingFeatures.map((feature, i) => (
            <motion.div key={feature.title} variants={itemVariants}>
              {/*
                Card defaults to overflow-hidden, which clips translateY on the icon.
                overflow-visible restores the same floating motion as AuthPageShell.
              */}
              <Card className="group overflow-visible p-6 bg-card/60 border-white/15 card-pattern relative transition-all duration-300 hover:border-white/25 hover:bg-card/70">
                {/* Inner glow for depth */}
                <div className="absolute inset-0 rounded-xl card-inner-glow pointer-events-none" />
                
                <div className="relative mb-4 flex h-14 items-center">
                  <div
                    className="animate-feature-icon-bob inline-flex will-change-transform"
                    style={
                      {
                        "--feature-bob-duration": `${5 + i * 0.45}s`,
                        "--feature-bob-delay": `${i * 0.4}s`,
                      } as CSSProperties
                    }
                  >
                    <div
                      className={`size-12 rounded-xl ${feature.color} flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-lg`}
                      style={{ boxShadow: 'transparent' }}
                    >
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity group-hover:icon-glow" />
                      <feature.icon className={`size-6 ${feature.iconColor} relative z-10`} />
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
