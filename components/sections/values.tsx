"use client";

import { FadeIn } from "@/components/motion/fade-in";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/motion/stagger-children";
import { values } from "@/lib/data";

export function Values() {
  return (
    <section id="values" className="max-w-4xl mx-auto px-6 py-24">
      <FadeIn>
        <h2 className="text-4xl sm:text-5xl font-bold mb-12 text-zinc-100">
          <span className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            My Values
          </span>
        </h2>
      </FadeIn>

      <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {values.map((value) => {
          const Icon = value.icon;
          return (
            <StaggerItem key={value.title}>
              <div
                className={`group/card h-full p-8 rounded-2xl glass-card ${value.secretClass || ""}`}
                title={value.tooltip}
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-100">
                  {value.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed text-[0.95rem]">
                  {value.description}
                </p>
                {value.aside && (
                  <p className="text-xs text-zinc-600 mt-3 italic">
                    {value.aside}
                  </p>
                )}
                {value.tooltip && (
                  <p className="text-xs text-amber-400/0 group-hover/card:text-amber-400/40 mt-3 italic transition-colors duration-1000">
                    &ldquo;{value.tooltip}&rdquo;
                  </p>
                )}
              </div>
            </StaggerItem>
          );
        })}
      </StaggerChildren>
    </section>
  );
}
