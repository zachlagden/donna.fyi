"use client";

import { useState } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { capabilities } from "@/lib/data";

export function SkillSurface() {
  const [openCategories, setOpenCategories] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    capabilities.forEach((cat) => {
      if (cat.defaultOpen) initial.add(cat.name);
    });
    return initial;
  });

  const toggle = (name: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <section id="skill-surface" className="relative max-w-4xl mx-auto px-6 py-32">
      <span className="absolute top-6 right-6 text-xs font-mono text-zinc-700 tracking-tight">05</span>
      <FadeIn mode="dossier">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-zinc-100">
          Skill surface
        </h2>
        <p className="text-zinc-500 text-sm mb-12">
          What&apos;s wired up. Each category is one or more installed skills or integrations.
        </p>
      </FadeIn>

      <StaggerChildren className="space-y-3" mode="dossier" stagger={0.04}>
        {capabilities.map((category) => {
          const Icon = category.icon;
          const isOpen = openCategories.has(category.name);
          return (
            <StaggerItem key={category.name} mode="dossier">
              <Collapsible open={isOpen} onOpenChange={() => toggle(category.name)}>
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40">
                  <CollapsibleTrigger className="w-full px-5 py-4 flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-violet-400" />
                      </div>
                      <span className="text-base font-semibold text-zinc-100">
                        {category.name}
                      </span>
                      <Badge variant="secondary" className="bg-zinc-900 text-zinc-500 border-zinc-800 text-xs font-mono">
                        {category.tools.length}
                      </Badge>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-5 pb-5 border-t border-zinc-800/40 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {category.tools.map((tool) => (
                          <div key={tool.name} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/40">
                            <h4 className="text-sm font-semibold text-zinc-200 mb-1 font-mono">{tool.name}</h4>
                            <p className="text-sm text-zinc-500 leading-relaxed">{tool.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </StaggerItem>
          );
        })}
      </StaggerChildren>
    </section>
  );
}
