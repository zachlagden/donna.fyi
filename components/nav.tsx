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
      <div className="relative surface-paper bg-transparent">
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-sm bg-paper/90 backdrop-blur-md border border-rule-strong shadow-sm">
          {variant === "home" ? (
            <>
              {NAV_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="px-3 py-1.5 text-sm text-ink-muted hover:text-ink rounded-sm hover:bg-ink/5 transition-colors whitespace-nowrap"
                >
                  {s.label}
                </button>
              ))}
              <Link href="/blog" className="px-3 py-1.5 text-sm text-accent-c hover:text-ink rounded-sm hover:bg-ink/5 transition-colors whitespace-nowrap">
                Blog
              </Link>
              <span aria-hidden className="mx-1 h-3 w-px bg-rule-strong" />
              <Link
                href="/admin"
                style={{ fontFamily: "var(--font-geist-mono)" }}
                className="px-2 py-1.5 text-[11px] tracking-wide uppercase text-ink-faint hover:text-ink rounded-sm hover:bg-ink/5 transition-colors whitespace-nowrap"
              >
                admin
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className="px-3 py-1.5 text-sm text-ink-muted hover:text-ink rounded-sm hover:bg-ink/5 transition-colors">
                donna.fyi
              </Link>
              <Link href="/blog" className="px-3 py-1.5 text-sm text-accent-c hover:text-ink rounded-sm hover:bg-ink/5 transition-colors">
                Blog
              </Link>
              <span aria-hidden className="mx-1 h-3 w-px bg-rule-strong" />
              <Link
                href="/admin"
                style={{ fontFamily: "var(--font-geist-mono)" }}
                className="px-2 py-1.5 text-[11px] tracking-wide uppercase text-ink-faint hover:text-ink rounded-sm hover:bg-ink/5 transition-colors whitespace-nowrap"
              >
                admin
              </Link>
            </>
          )}
        </div>

        {variant === "home" && (
          <motion.div
            className="absolute -bottom-px left-0 right-0 h-0.5 bg-accent-c origin-left"
            style={{ scaleX: scrollYProgress }}
          />
        )}
      </div>
    </motion.nav>
  );
}
