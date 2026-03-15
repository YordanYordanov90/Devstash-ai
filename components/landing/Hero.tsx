"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";

export function Hero() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 bg-glow-tl pointer-events-none" />
      <div className="absolute inset-0 bg-glow-br pointer-events-none" />
      
      <div className="mx-auto max-w-7xl relative px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24">
        <motion.div 
          ref={ref}
          className="mx-auto max-w-4xl text-center"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <Badge 
              variant="secondary" 
              className="mb-6 bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent/30"
            >
              <Sparkles className="size-3 mr-1" />
              Your Developer Knowledge Hub
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            <span className="text-foreground">Stop Losing Your </span>
            <span className="text-gradient-warm">Developer Knowledge</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={itemVariants}
            className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8 leading-relaxed"
          >
            Your snippets, prompts, commands, and notes are scattered across Notion, 
            GitHub, Slack, and a dozen browser tabs. DevStash brings them all into 
            one fast, searchable hub.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground glow-coral group"
            >
              Get Started Free
              <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-accent/50 text-foreground hover:bg-accent/10 hover:border-accent"
            >
              See Features
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
