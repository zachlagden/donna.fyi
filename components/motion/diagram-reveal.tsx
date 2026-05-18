"use client";

import { motion } from "motion/react";
import { type ReactNode } from "react";

interface DiagramRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function DiagramReveal({ children, delay = 0, className }: DiagramRevealProps) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.g>
  );
}
