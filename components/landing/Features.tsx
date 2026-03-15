"use client";

import { Card } from "@/components/ui/card";
import { 
  Code, 
  Bot, 
  Search, 
  Terminal, 
  FileText, 
  FolderOpen 
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: Code,
    title: "Code Snippets",
    description: "Save reusable code with syntax highlighting, language detection, and instant copy. Never rewrite the same function twice.",
    color: "bg-amber-500/20",
    iconColor: "text-amber-500"
  },
  {
    icon: Bot,
    title: "AI Prompts",
    description: "Store and organize your best prompts for ChatGPT, Claude, and other AI tools. Build a personal prompt library.",
    color: "bg-orange-500/20",
    iconColor: "text-orange-500"
  },
  {
    icon: Search,
    title: "Instant Search",
    description: "Find anything in milliseconds. Search across all your items by content, tags, titles, or type with Cmd+K.",
    color: "bg-yellow-500/20",
    iconColor: "text-yellow-500"
  },
  {
    icon: Terminal,
    title: "Commands",
    description: "Keep your most-used terminal commands at your fingertips. No more digging through bash history.",
    color: "bg-amber-600/20",
    iconColor: "text-amber-600"
  },
  {
    icon: FileText,
    title: "Files & Docs",
    description: "Upload and manage files, images, and documents. Keep your project assets organized alongside your code.",
    color: "bg-orange-400/20",
    iconColor: "text-orange-400"
  },
  {
    icon: FolderOpen,
    title: "Collections",
    description: "Group related items into collections. Organize by project, topic, or workflow for quick access.",
    color: "bg-amber-400/20",
    iconColor: "text-amber-400"
  }
];

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
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card 
                className="p-6 bg-card/50 border-border/50 hover:border-accent/30 transition-all group"
              >
                <div className={`size-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`size-6 ${feature.iconColor}`} />
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
