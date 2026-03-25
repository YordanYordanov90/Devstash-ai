"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Tooltip } from "./Tooltip";

interface BouncingIconProps {
  id: string;
  icon: ReactNode;
  label: string;
  description: string;
  brandColor: string;
  brandColorLight: string;
  position: { x: number; y: number };
  index: number;
  reducedMotion: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  allIconPositions: React.MutableRefObject<Map<string, { x: number; y: number }>>;
}

export function BouncingIcon({
  id,
  icon,
  label,
  description,
  brandColor,
  brandColorLight,
  position,
  index,
  reducedMotion,
  containerRef,
  allIconPositions,
}: BouncingIconProps) {
  const iconRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [localPos, setLocalPos] = useState({ x: 0, y: 0 });

  // Motion values for physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);

  // Spring physics for smooth movement
  const springConfig = { stiffness: 200, damping: 20 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const springRotate = useSpring(rotate, { stiffness: 150, damping: 15 });

  // Glow intensity based on hover
  const glowOpacity = useTransform(
    springX,
    [-50, 0, 50],
    [0.3, 0.6, 0.3]
  );

  // Idle floating animation
  useEffect(() => {
    if (reducedMotion || isHovered) return;
    
    let animationId: number;
    let time = index * 1000; // Stagger start time
    
    const animate = () => {
      time += 16;
      const floatY = Math.sin(time / 1200) * 5;
      const floatRotate = Math.sin(time / 1500) * 3;
      
      y.set(floatY);
      rotate.set(floatRotate);
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationId);
  }, [reducedMotion, isHovered, index, y, rotate]);

  // Update position ref for collision detection
  useEffect(() => {
    const updatePosition = () => {
      const currentX = springX.get();
      const currentY = springY.get();
      allIconPositions.current.set(id, { x: currentX, y: currentY });
      setLocalPos({ x: currentX, y: currentY });
    };
    
    updatePosition();
    const unsubscribe = springX.on("change", updatePosition);
    return () => unsubscribe();
  }, [id, springX, springY, allIconPositions]);

  // Magnetic pull effect
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (reducedMotion || !iconRef.current) return;

      const rect = iconRef.current.getBoundingClientRect();
      const iconCenterX = rect.left + rect.width / 2;
      const iconCenterY = rect.top + rect.height / 2;
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const dx = mouseX - iconCenterX;
      const dy = mouseY - iconCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const magneticRadius = 100;
      if (distance < magneticRadius && distance > 0) {
        const strength = (1 - distance / magneticRadius) * 0.15;
        x.set(dx * strength);
        y.set(dy * strength);
      }

      // Update tooltip position
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
    },
    [reducedMotion, x, y]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    // Reset position with spring animation
    x.set(0);
    y.set(0);
    rotate.set(0);
  }, [x, y, rotate]);

  // Collision detection
  useEffect(() => {
    if (!isHovered) return;

    const checkCollisions = () => {
      const positions = Array.from(allIconPositions.current.entries());
      const myPos = positions.find(([key]) => key === id)?.[1];
      if (!myPos) return;

      let repelX = 0;
      let repelY = 0;
      const collisionRadius = 60;

      positions.forEach(([key, pos]) => {
        if (key === id) return;

        const dx = (position.x / 100) * 300 - (pos.x); // Approximate conversion
        const dy = (position.y / 100) * 240 - (pos.y);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < collisionRadius && distance > 0) {
          const overlap = collisionRadius - distance;
          const angle = Math.atan2(dy, dx);
          repelX += Math.cos(angle) * overlap * 0.3;
          repelY += Math.sin(angle) * overlap * 0.3;
        }
      });

      if (Math.abs(repelX) > 0.1 || Math.abs(repelY) > 0.1) {
        x.set(x.get() + repelX);
        y.set(y.get() + repelY);
      }
    };

    const interval = setInterval(checkCollisions, 16);
    return () => clearInterval(interval);
  }, [isHovered, id, position, allIconPositions, x, y]);

  // Reduced motion fallback
  if (reducedMotion) {
    return (
      <div
        className="absolute flex flex-col items-center gap-2 cursor-pointer"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className="size-14 rounded-xl flex items-center justify-center shadow-md transition-shadow hover:shadow-lg"
          style={{
            backgroundColor: brandColorLight,
            boxShadow: `0 2px 8px ${brandColor}20`,
          }}
        >
          <div style={{ color: brandColor }}>{icon}</div>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
          {label}
        </span>
      </div>
    );
  }

  return (
    <>
      <motion.div
        ref={iconRef}
        className="absolute flex flex-col items-center gap-2 cursor-pointer group"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          x: springX,
          y: springY,
          rotate: springRotate,
          transform: "translate(-50%, -50%)",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.div
          className="size-14 rounded-xl flex items-center justify-center shadow-md relative overflow-hidden"
          style={{
            backgroundColor: brandColorLight,
          }}
          animate={
            isHovered
              ? {
                  boxShadow: [
                    `0 0 20px ${brandColor}40`,
                    `0 0 30px ${brandColor}60`,
                    `0 0 20px ${brandColor}40`,
                  ],
                }
              : {
                  boxShadow: `0 2px 8px ${brandColor}20`,
                }
          }
          transition={
            isHovered
              ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
        >
          <div style={{ color: brandColor }}>{icon}</div>
          <div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"
            style={{ background: `linear-gradient(135deg, ${brandColor}40, transparent)` }}
          />
        </motion.div>
        <span className="text-xs text-muted-foreground whitespace-nowrap font-medium opacity-70 group-hover:opacity-100 transition-opacity">
          {label}
        </span>
      </motion.div>

      <Tooltip
        label={label}
        description={description}
        brandColor={brandColor}
        isVisible={isHovered}
        x={tooltipPos.x}
        y={tooltipPos.y}
      />
    </>
  );
}