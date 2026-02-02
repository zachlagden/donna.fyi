"use client";

import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { useState } from "react";
import { NAV_SECTIONS } from "@/lib/constants";

export function Nav() {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setVisible(latest > 0.05);
  });

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={visible ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="relative">
        <div className="flex items-center gap-1 px-2 py-2 rounded-full bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 shadow-lg shadow-black/20">
          {NAV_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollTo(section.id)}
              className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 rounded-full hover:bg-zinc-800/50 transition-colors whitespace-nowrap"
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Scroll progress bar */}
        <motion.div
          className="absolute -bottom-1 left-4 right-4 h-0.5 bg-violet-500/50 rounded-full origin-left"
          style={{ scaleX: scrollYProgress }}
        />
      </div>
    </motion.nav>
  );
}
