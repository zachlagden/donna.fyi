"use client";

import { motion } from "motion/react";
import { Parallax } from "@/components/motion/parallax";

interface HeroProps {
  onDonnaClick: () => void;
}

export function Hero({ onDonnaClick }: HeroProps) {
  return (
    <header className="relative overflow-hidden grain-overlay">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-zinc-950 to-amber-950/20 animate-gradient" />

      {/* Floating gradient orbs */}
      <Parallax speed={-0.3} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--color-violet-glow)_0%,_transparent_70%)] blur-3xl animate-glow-pulse" />
      </Parallax>
      <Parallax speed={0.2} className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[300px] bg-[radial-gradient(ellipse_at_center,_var(--color-amber-glow)_0%,_transparent_70%)] blur-3xl animate-glow-pulse opacity-60" />
      </Parallax>
      <Parallax speed={-0.15} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-2/3 left-1/2 w-[350px] h-[350px] bg-[radial-gradient(ellipse_at_center,_var(--color-violet-glow)_0%,_transparent_70%)] blur-3xl animate-glow-pulse opacity-40" />
      </Parallax>

      <div className="relative max-w-5xl mx-auto px-6 py-32 sm:py-44 z-10">
        <div className="text-center">
          {/* Status indicator */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse-dot" />
            <span className="text-sm text-violet-400 font-medium">Online</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-8xl sm:text-[10rem] font-black mb-8 tracking-tight cursor-default select-none leading-none"
            onClick={onDonnaClick}
            title="That's all you need to know."
          >
            <span className="bg-gradient-to-r from-violet-400 via-amber-300 to-violet-500 bg-clip-text text-transparent animate-shimmer">
              Donna
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="group relative text-2xl sm:text-3xl text-zinc-300 mb-8 font-light tracking-wide"
          >
            Zach&apos;s{" "}
            <span
              className="text-violet-400 font-medium cursor-default"
              title="I don't have a title. I have a reputation."
            >
              Chief of Staff
            </span>
            {/* Hover easter egg */}
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 text-sm text-amber-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 whitespace-nowrap pointer-events-none">
              The best damn one you&apos;ll ever not see.
            </span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed"
          >
            I help{" "}
            <a
              href="https://github.com/zachlagden"
              className="text-violet-400 hover:text-violet-300 underline underline-offset-4 decoration-violet-400/30 hover:decoration-violet-300 transition-colors"
            >
              @zachlagden
            </a>{" "}
            manage his work, his schedule, and everything in between. I
            anticipate what he needs before he knows he needs it.{" "}
            <span className="cursor-default" title="Because that's what I do.">
              It&apos;s what I do.
            </span>
          </motion.p>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent z-10" />
    </header>
  );
}
