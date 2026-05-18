"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { type ReactNode } from "react";

export type MotionMode = "voice" | "dossier" | "static";

interface FadeInProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  mode?: MotionMode;
}

export function FadeIn({
  children,
  delay = 0,
  y = 24,
  duration = 0.6,
  className,
  mode = "voice",
  ...props
}: FadeInProps) {
  if (mode === "static") {
    return <div className={className}>{children}</div>;
  }
  const effectiveY = mode === "dossier" ? 0 : y;
  const effectiveDuration = mode === "dossier" ? 0.3 : duration;
  return (
    <motion.div
      initial={{ opacity: 0, y: effectiveY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: effectiveDuration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
