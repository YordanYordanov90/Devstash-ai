"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";

import { landingFeatures } from "@/lib/landing/feature-definitions";

type DecoPlacement =
  | { top: string; left: string; opacity: number }
  | { top: string; right: string; opacity: number }
  | { bottom: string; left: string; opacity: number }
  | { bottom: string; right: string; opacity: number };

/** Percent-based placement so icons stay near edges and clear the centered auth card */
const decorativeLayout: DecoPlacement[] = [
  { top: "6%", left: "5%", opacity: 0.2 },
  { top: "12%", right: "8%", opacity: 0.16 },
  { top: "42%", left: "3%", opacity: 0.14 },
  { top: "38%", right: "4%", opacity: 0.15 },
  { bottom: "18%", left: "10%", opacity: 0.17 },
  { bottom: "10%", right: "6%", opacity: 0.18 },
];

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-glow-tl pointer-events-none" />
      <div className="absolute inset-0 bg-glow-br pointer-events-none" />

      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        {landingFeatures.map((feature, i) => {
          const layout = decorativeLayout[i];
          if (!layout) return null;
          const Icon = feature.icon;
          const placementStyle: CSSProperties =
            "top" in layout
              ? "left" in layout
                ? { top: layout.top, left: layout.left }
                : { top: layout.top, right: layout.right }
              : "left" in layout
                ? { bottom: layout.bottom, left: layout.left }
                : { bottom: layout.bottom, right: layout.right };

          return (
            <motion.div
              key={feature.title}
              className="absolute"
              style={placementStyle}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: layout.opacity, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.06 * i, ease: "easeOut" }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 5 + i * 0.45,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
                className={`flex size-12 items-center justify-center rounded-xl border border-border/20 ${feature.color} shadow-sm backdrop-blur-[2px]`}
              >
                <Icon className={`size-6 ${feature.iconColor}`} />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {children}
    </main>
  );
}
