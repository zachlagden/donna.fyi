"use client";

import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { useState } from "react";
import { NAV_SECTIONS } from "@/lib/constants";

interface Props {
  variant?: "home" | "blog";
}

export function Nav({ variant = "home" }: Props) {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(variant === "blog");

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (variant === "blog") return;
    setVisible(latest > 0.05);
  });

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={variant === "blog" ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
      animate={visible ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="relative">
        <div className="flex items-center gap-1 px-2 py-2 rounded-full bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 shadow-lg shadow-black/20">
          {variant === "home" ? (
            <>
              {NAV_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 rounded-full hover:bg-zinc-800/50 transition-colors whitespace-nowrap"
                >
                  {s.label}
                </button>
              ))}
              <Link href="/blog" className="px-3 py-1.5 text-sm text-violet-300 hover:text-violet-200 rounded-full hover:bg-zinc-800/50 transition-colors whitespace-nowrap">
                Blog
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 rounded-full hover:bg-zinc-800/50 transition-colors">
                donna.fyi
              </Link>
              <Link href="/blog" className="px-3 py-1.5 text-sm text-violet-300 hover:text-violet-200 rounded-full hover:bg-zinc-800/50 transition-colors">
                Blog
              </Link>
            </>
          )}
        </div>

        {variant === "home" && (
          <motion.div
            className="absolute -bottom-1 left-4 right-4 h-0.5 bg-violet-500/50 rounded-full origin-left"
            style={{ scaleX: scrollYProgress }}
          />
        )}
      </div>
    </motion.nav>
  );
}
