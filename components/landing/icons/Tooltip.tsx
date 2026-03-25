"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface TooltipProps {
  label: string;
  description: string;
  brandColor: string;
  isVisible: boolean;
  x: number;
  y: number;
}

export function Tooltip({ label, description, brandColor, isVisible, x, y }: TooltipProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed z-50 pointer-events-none"
          style={{
            left: x,
            top: y - 80,
            transform: "translateX(-50%)",
          }}
        >
          <div
            className="relative px-3 py-2 rounded-lg shadow-lg border"
            style={{
              backgroundColor: "hsl(var(--popover))",
              borderColor: `hsl(var(--border))`,
              boxShadow: `0 0 20px ${brandColor}40`,
            }}
          >
            <div className="text-sm font-medium" style={{ color: `hsl(var(--foreground))` }}>
              {label}
            </div>
            <div className="text-xs mt-0.5" style={{ color: `hsl(var(--muted-foreground))` }}>
              {description}
            </div>
            <div
              className="absolute left-1/2 -bottom-1.5 w-3 h-3 rotate-45 border-r border-b"
              style={{
                backgroundColor: "hsl(var(--popover))",
                borderColor: `hsl(var(--border))`,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}