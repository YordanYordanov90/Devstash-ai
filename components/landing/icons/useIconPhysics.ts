import { MotionValue } from "framer-motion";
import { useCallback, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

export interface IconPosition {
  x: number;
  y: number;
}

export interface UseIconPhysicsOptions {
  stiffness?: number;
  damping?: number;
  collisionRadius?: number;
  magneticRadius?: number;
  magneticStrength?: number;
}

export function useIconPhysics(options: UseIconPhysicsOptions = {}) {
  const {
    stiffness = 150,
    damping = 20,
    collisionRadius = 60,
    magneticRadius = 100,
    magneticStrength = 0.3,
  } = options;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);
  const positionRef = useRef<IconPosition>({ x: 0, y: 0 });

  const springX = useSpring(x, { stiffness, damping });
  const springY = useSpring(y, { stiffness, damping });
  const springRotate = useSpring(rotate, { stiffness, damping });

  const applyMagneticPull = useCallback(
    (mouseX: number, mouseY: number, iconCenterX: number, iconCenterY: number) => {
      const dx = mouseX - iconCenterX;
      const dy = mouseY - iconCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < magneticRadius && distance > 0) {
        const strength = (1 - distance / magneticRadius) * magneticStrength;
        const targetX = dx * strength;
        const targetY = dy * strength;

        x.set(x.get() + targetX * 0.1);
        y.set(y.get() + targetY * 0.1);
      }
    },
    [magneticRadius, magneticStrength, x, y]
  );

  const applyCollisionRepulsion = useCallback(
    (otherPositions: IconPosition[], currentIndex: number, currentX: number, currentY: number) => {
      let repelX = 0;
      let repelY = 0;

      for (let i = 0; i < otherPositions.length; i++) {
        if (i === currentIndex) continue;

        const otherPos = otherPositions[i];
        const dx = currentX - otherPos.x;
        const dy = currentY - otherPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < collisionRadius && distance > 0) {
          const overlap = collisionRadius - distance;
          const repelStrength = overlap * 0.5;
          const angle = Math.atan2(dy, dx);

          repelX += Math.cos(angle) * repelStrength;
          repelY += Math.sin(angle) * repelStrength;
        }
      }

      return { repelX, repelY };
    },
    [collisionRadius]
  );

  const resetPosition = useCallback(() => {
    x.set(0);
    y.set(0);
    rotate.set(0);
    positionRef.current = { x: 0, y: 0 };
  }, [x, y, rotate]);

  return {
    x: springX,
    y: springY,
    rotate: springRotate,
    motionX: x,
    motionY: y,
    motionRotate: rotate,
    positionRef,
    applyMagneticPull,
    applyCollisionRepulsion,
    resetPosition,
  };
}

export type IconPhysics = ReturnType<typeof useIconPhysics>;