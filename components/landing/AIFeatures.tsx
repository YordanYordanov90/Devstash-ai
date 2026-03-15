"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Wand2 } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const aiFeatures = [
  "Auto-tag suggestions based on content",
  "AI-generated summaries for long snippets",
  "\"Explain This Code\" one-click breakdowns",
  "Prompt optimizer for better AI results"
];

export function AIFeatures() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const leftContentVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const rightContentVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
        delay: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          ref={sectionRef}
          className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto"
        >
          {/* Left Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={leftContentVariants}
          >
            <motion.div variants={itemVariants}>
              <Badge 
                variant="secondary" 
                className="mb-4 bg-primary/20 text-primary border-primary/30"
              >
                <Sparkles className="size-3 mr-1" />
                PRO FEATURE
              </Badge>
            </motion.div>

            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            >
              <span className="text-foreground">AI-Powered </span>
              <span className="text-gradient-warm">Productivity</span>
            </motion.h2>

            <motion.p 
              variants={itemVariants}
              className="text-muted-foreground mb-6"
            >
              Let AI handle the busywork so you can focus on building.
            </motion.p>

            <motion.ul 
              className="space-y-4"
              variants={leftContentVariants}
            >
              {aiFeatures.map((feature) => (
                <motion.li 
                  key={feature} 
                  className="flex items-start gap-3"
                  variants={itemVariants}
                >
                  <div className="size-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                    <Check className="size-3 text-green-500" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Right Content - Code Preview Mockup */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={rightContentVariants}
          >
            <Card className="p-0 overflow-hidden bg-card border-border/50 glow-amber">
              {/* Window Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-500/80" />
                  <div className="size-3 rounded-full bg-yellow-500/80" />
                  <div className="size-3 rounded-full bg-green-500/80" />
                </div>
                <span className="ml-auto text-xs text-muted-foreground">typescript</span>
              </div>

              {/* Code Content */}
              <div className="p-4 font-mono text-sm">
                <div className="space-y-1">
                  <div className="flex">
                    <span className="text-muted-foreground w-6">1</span>
                    <span>
                      <span className="text-purple-400">export function</span>
                      <span className="text-amber-400"> useDebounce</span>
                      <span className="text-foreground">&lt;T&gt;(</span>
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-6">2</span>
                    <span className="pl-2 text-foreground">value: T,</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-6">3</span>
                    <span className="pl-2">
                      <span className="text-foreground">delay: </span>
                      <span className="text-amber-400">number</span>
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-6">4</span>
                    <span className="text-foreground">): T {'{'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-6">5</span>
                    <span className="pl-2">
                      <span className="text-purple-400">const</span>
                      <span className="text-foreground"> [debounced, setDebounced] =</span>
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-6">6</span>
                    <span className="pl-4 text-amber-400">useState</span>
                    <span className="text-foreground">(value);</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-6">7</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-6">8</span>
                    <span className="pl-2">
                      <span className="text-amber-400">useEffect</span>
                      <span className="text-foreground">(() ={'>'} {'{'}</span>
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-6">9</span>
                    <span className="pl-4">
                      <span className="text-purple-400">const</span>
                      <span className="text-foreground"> t = </span>
                      <span className="text-amber-400">setTimeout</span>
                      <span className="text-foreground">(() ={'>'}</span>
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-6">10</span>
                    <span className="pl-6">
                      <span className="text-amber-400">setDebounced</span>
                      <span className="text-foreground">(value), delay);</span>
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-6">11</span>
                    <span className="pl-4">
                      <span className="text-purple-400">return</span>
                      <span className="text-foreground"> () ={'>'} </span>
                      <span className="text-amber-400">clearTimeout</span>
                      <span className="text-foreground">(t);</span>
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-6">12</span>
                    <span className="pl-2 text-foreground">{'}'}, [value, delay]);</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-6">13</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-6">14</span>
                    <span className="pl-2">
                      <span className="text-purple-400">return</span>
                      <span className="text-foreground"> debounced;</span>
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-6">15</span>
                    <span className="text-foreground">{'}'}</span>
                  </div>
                </div>

                {/* AI Tags */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="size-3 text-accent" />
                    <span className="text-xs text-accent uppercase tracking-wider">AI Generated Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['react', 'hooks', 'debounce', 'typescript', 'performance'].map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
