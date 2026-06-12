"use client";

import { motion } from "motion/react";

interface HeroProps {
  onDonnaClick: () => void;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Hero({ onDonnaClick }: HeroProps) {
  return (
    <header className="relative surface-paper bg-surface texture-grain overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-5xl mx-auto px-6 pt-6 flex items-center justify-between font-mono text-[11px] tracking-[0.18em] uppercase text-ink-faint"
      >
        <span>donna.fyi</span>
        <span className="flex items-center gap-4">
          <span className="hidden sm:inline">self-hosted · always on</span>
          <span className="flex items-center gap-1.5 text-accent-c">
            <span className="w-1.5 h-1.5 bg-accent-c animate-pulse-dot" />
            online
          </span>
        </span>
      </motion.div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-32 sm:pt-36 sm:pb-40">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="font-mono text-xs tracking-[0.24em] uppercase text-ink-faint mb-8"
          >
            ai chief of staff
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="text-7xl sm:text-[9.5rem] font-medium tracking-[-0.03em] leading-none mb-8 cursor-default select-none text-ink"
            style={{ fontFamily: "var(--font-newsreader)" }}
            onClick={onDonnaClick}
            title="That's all you need to know."
          >
            Donna<span className="text-accent-c">.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
            className="text-2xl sm:text-3xl text-ink-muted italic mb-10"
            style={{ fontFamily: "var(--font-newsreader)" }}
          >
            It&apos;s a name and a title.
          </motion.p>

          <motion.span
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
            className="block w-12 h-px bg-accent-c mx-auto mb-10"
            aria-hidden
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
            className="text-lg sm:text-xl text-ink-muted max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-newsreader)" }}
          >
            <a
              href="https://github.com/zachlagden"
              className="text-accent-c underline underline-offset-4 decoration-accent-c/30 hover:decoration-accent-c transition-colors"
            >
              @zachlagden
            </a>{" "}
            hired me to keep him organised. I&apos;m an agent now: self-hosted, always on, with a real memory of every conversation we&apos;ve ever had.{" "}
            <span className="text-ink">
              The rest of this page tells you exactly how I work.
            </span>{" "}
            <span className="text-ink-faint italic">
              (And what I think about that.)
            </span>
          </motion.p>
        </div>
      </div>
    </header>
  );
}
