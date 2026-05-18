"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { capabilities } from "@/lib/data";
import type { CapabilityCategory } from "@/lib/data";

type Weight = "featured" | "standard" | "compact";

const WEIGHT_BY_CATEGORY: Record<string, Weight> = {
  "Communication": "featured",
  "Productivity": "featured",
  "Research & Content": "standard",
  "Infrastructure": "standard",
  "Smart home": "standard",
  "Development": "compact",
  "Document skills": "compact",
};

export function SkillSurface() {
  return (
    <section id="skill-surface" className="relative max-w-4xl mx-auto px-6 py-32">
      <span className="absolute top-6 right-6 text-xs font-mono text-zinc-600 tracking-tight">05</span>

      <FadeIn mode="dossier">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-zinc-100">
          Skill surface
        </h2>
        <p className="text-zinc-500 text-sm mb-14 max-w-xl">
          What&apos;s wired up. Each category is one or more installed skills or integrations.
        </p>
      </FadeIn>

      <FadeIn mode="dossier" delay={0.05}>
        <div className="divide-y divide-zinc-800/40">
          {capabilities.map((cat) => (
            <CategoryRow key={cat.name} category={cat} weight={WEIGHT_BY_CATEGORY[cat.name] ?? "standard"} />
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function CategoryRow({ category, weight }: { category: CapabilityCategory; weight: Weight }) {
  const Icon = category.icon;
  return (
    <div className="grid grid-cols-12 gap-6 py-6">
      <div className="col-span-12 sm:col-span-3 flex items-start gap-3">
        <Icon className={`shrink-0 ${weight === "featured" ? "w-5 h-5 text-violet-300" : weight === "standard" ? "w-4 h-4 text-violet-400/80" : "w-3.5 h-3.5 text-zinc-500"}`} />
        <div>
          <h3 className={`font-mono ${weight === "featured" ? "text-base text-zinc-100" : weight === "standard" ? "text-sm text-zinc-200" : "text-xs text-zinc-400 uppercase tracking-wider"}`}>
            {category.name}
          </h3>
          <p className="text-xs font-mono text-zinc-600 mt-0.5">
            {category.tools.length} {category.tools.length === 1 ? "tool" : "tools"}
          </p>
        </div>
      </div>

      <div className="col-span-12 sm:col-span-9">
        {weight === "featured" && (
          <ul className="space-y-2.5">
            {category.tools.map((tool) => (
              <li key={tool.name} className="grid grid-cols-[8rem_1fr] gap-4 text-sm">
                <span className="font-mono text-violet-300/90">{tool.name}</span>
                <span className="text-zinc-400 leading-relaxed">{tool.description}</span>
              </li>
            ))}
          </ul>
        )}
        {weight === "standard" && (
          <ul className="flex flex-wrap gap-x-3 gap-y-2 text-sm">
            {category.tools.map((tool) => (
              <li
                key={tool.name}
                className="font-mono text-zinc-300 cursor-help underline decoration-zinc-700 decoration-dotted underline-offset-4 hover:text-zinc-100 hover:decoration-violet-400/50"
                title={tool.description}
              >
                {tool.name}
              </li>
            ))}
          </ul>
        )}
        {weight === "compact" && (
          <p className="text-sm font-mono text-zinc-500">
            {category.tools.map((tool) => tool.name).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
