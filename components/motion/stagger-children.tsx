"use client";

import { motion } from "motion/react";
import { type ReactNode } from "react";
import type { MotionMode } from "./fade-in";

interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  duration?: number;
  mode?: MotionMode;
}

export function StaggerChildren({
  children,
  className,
  stagger = 0.1,
  mode = "voice",
}: StaggerChildrenProps) {
  if (mode === "static") {
    return <div className={className}>{children}</div>;
  }
  const effectiveStagger = mode === "dossier" ? 0.04 : stagger;
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: effectiveStagger } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 24,
  duration = 0.5,
  mode = "voice",
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  mode?: MotionMode;
}) {
  if (mode === "static") {
    return <div className={className}>{children}</div>;
  }
  const effectiveY = mode === "dossier" ? 0 : y;
  const effectiveDuration = mode === "dossier" ? 0.3 : duration;
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: effectiveY, scale: mode === "dossier" ? 1 : 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: effectiveDuration, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
