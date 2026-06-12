"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/blog/types";

interface Props {
  entries: TocEntry[];
}

export function Toc({ entries }: Props) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (entries.length === 0) return;
    const observers: IntersectionObserver[] = [];
    entries.forEach((e) => {
      const el = document.getElementById(e.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(e.id);
        },
        { rootMargin: "-30% 0px -60% 0px" },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav className="hidden xl:block sticky top-24 self-start w-56 text-sm">
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-ink-faint mb-3">Contents</p>
      <ul className="space-y-1.5 border-l border-rule">
        {entries.map((e) => (
          <li key={e.id} className={e.level === 3 ? "pl-6" : "pl-3"}>
            <a
              href={`#${e.id}`}
              className={`block py-0.5 transition-colors -ml-px border-l ${
                active === e.id
                  ? "border-accent-c text-accent-c"
                  : "border-transparent text-ink-faint hover:text-ink"
              }`}
            >
              {e.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
