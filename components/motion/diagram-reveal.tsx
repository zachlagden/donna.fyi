"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode } from "react";

interface DiagramRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function DiagramReveal({ children, delay = 0, className }: DiagramRevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.g
      initial={reduce ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.g>
  );
}

interface DiagramLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth?: number;
  markerEnd?: string;
  delay?: number;
  duration?: number;
}

export function DiagramLine({
  x1,
  y1,
  x2,
  y2,
  stroke,
  strokeWidth = 1.5,
  markerEnd,
  delay = 0,
  duration = 0.6,
}: DiagramLineProps) {
  const reduce = useReducedMotion();
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      markerEnd={markerEnd}
      initial={reduce ? false : { pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        pathLength: { duration, delay, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.2, delay },
      }}
    />
  );
}

interface DiagramLabelProps {
  x: number;
  y: number;
  children: ReactNode;
  textAnchor?: "start" | "middle" | "end";
  delay?: number;
  fill?: string;
  fontSize?: number;
  dy?: number | string;
}

export function DiagramLabel({
  x,
  y,
  children,
  textAnchor = "middle",
  delay = 0,
  fill = "#71717a",
  fontSize = 10,
  dy,
}: DiagramLabelProps) {
  const reduce = useReducedMotion();
  return (
    <motion.text
      x={x}
      y={y}
      dy={dy}
      fontSize={fontSize}
      fill={fill}
      textAnchor={textAnchor}
      initial={reduce ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.text>
  );
}

interface DiagramNodeProps {
  children: ReactNode;
  delay?: number;
  scaleIn?: boolean;
  originX?: number;
  originY?: number;
}

export function DiagramNode({
  children,
  delay = 0,
  scaleIn = false,
  originX,
  originY,
}: DiagramNodeProps) {
  const reduce = useReducedMotion();
  if (scaleIn && originX !== undefined && originY !== undefined) {
    return (
      <motion.g
        initial={reduce ? false : { opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: `${originX}px ${originY}px`, transformBox: "fill-box" }}
      >
        {children}
      </motion.g>
    );
  }
  return (
    <motion.g
      initial={reduce ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.g>
  );
}
