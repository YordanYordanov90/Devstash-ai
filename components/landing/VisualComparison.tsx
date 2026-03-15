"use client";

import { Card } from "@/components/ui/card";
import { 
  Code, 
  FileText, 
  Terminal, 
  MessageSquare, 
  Github, 
  Layers,
 
  FolderOpen
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function VisualComparison() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

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

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Labels */}
        <motion.div 
          ref={ref}
          className="flex justify-between max-w-5xl mx-auto mb-6 px-4"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.p variants={itemVariants} className="text-sm text-muted-foreground uppercase tracking-wider">
            Your Knowledge Today...
          </motion.p>
          <motion.p variants={itemVariants} className="text-sm text-accent uppercase tracking-wider">
            ...With DevStash
          </motion.p>
        </motion.div>

        {/* Comparison Cards */}
        <motion.div 
          className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto items-center relative"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Before - Scattered */}
          <motion.div variants={itemVariants}>
            <Card className="p-8 bg-card/50 border-border/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-transparent" />
              <div className="relative grid grid-cols-3 gap-4 opacity-60">
                <div className="flex flex-col items-center gap-2 p-4">
                  <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                    <Code className="size-6 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">VS Code</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4">
                  <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                    <FileText className="size-6 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">Notion</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4">
                  <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                    <Terminal className="size-6 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">Terminal</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4">
                  <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                    <MessageSquare className="size-6 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">Slack</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4">
                  <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                    <Github className="size-6 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">GitHub</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4">
                  <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                    <Layers className="size-6 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">More...</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Arrow - Desktop Only */}
          <motion.div 
            className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            
          </motion.div>

          {/* After - Organized */}
          <motion.div variants={itemVariants}>
            <Card className="p-8 bg-card border-border/50 relative overflow-hidden glow-amber">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
              <div className="relative">
                {/* Mock Dashboard UI */}
                <div className="flex gap-4">
                  {/* Sidebar Mock */}
                  <div className="w-16 space-y-2">
                    <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <FolderOpen className="size-4 text-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-full rounded bg-muted" />
                      <div className="h-2 w-3/4 rounded bg-muted" />
                      <div className="h-2 w-full rounded bg-muted" />
                    </div>
                  </div>
                  
                  {/* Content Mock */}
                  <div className="flex-1 space-y-3">
                    {/* Collections */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-16 rounded-lg bg-card border-l-2 border-l-accent p-2">
                        <div className="h-2 w-16 rounded bg-muted mb-1" />
                        <div className="h-1.5 w-8 rounded bg-muted/50" />
                      </div>
                      <div className="h-16 rounded-lg bg-card border-l-2 border-l-primary p-2">
                        <div className="h-2 w-16 rounded bg-muted mb-1" />
                        <div className="h-1.5 w-8 rounded bg-muted/50" />
                      </div>
                    </div>
                    {/* Items List */}
                    <div className="space-y-2">
                      <div className="h-10 rounded-lg bg-card flex items-center gap-2 px-3">
                        <div className="size-6 rounded bg-accent/20 flex items-center justify-center">
                          <Code className="size-3 text-accent" />
                        </div>
                        <div className="h-2 w-24 rounded bg-muted" />
                      </div>
                      <div className="h-10 rounded-lg bg-card flex items-center gap-2 px-3">
                        <div className="size-6 rounded bg-primary/20 flex items-center justify-center">
                          <Terminal className="size-3 text-primary" />
                        </div>
                        <div className="h-2 w-20 rounded bg-muted" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
