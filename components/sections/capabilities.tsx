"use client";

import { useState } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/motion/stagger-children";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { capabilities } from "@/lib/data";

export function Capabilities() {
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
    <section id="capabilities" className="max-w-4xl mx-auto px-6 py-24">
      <FadeIn>
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-zinc-100">
          <span className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Capabilities
          </span>
        </h2>
        <p className="text-zinc-600 text-sm mb-12 italic">
          Zach doesn&apos;t ask me to do things. He just mentions them and
          they&apos;re already done.
        </p>
      </FadeIn>

      <StaggerChildren className="space-y-4" stagger={0.08}>
        {capabilities.map((category) => {
          const Icon = category.icon;
          const isOpen = openCategories.has(category.name);

          return (
            <StaggerItem key={category.name}>
              <Collapsible open={isOpen} onOpenChange={() => toggle(category.name)}>
                <div className="rounded-2xl glass-card overflow-hidden">
                  <CollapsibleTrigger className="w-full px-6 py-5 flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-violet-400" />
                      </div>
                      <span className="text-lg font-semibold text-zinc-100">
                        {category.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-zinc-800/80 text-zinc-400 border-zinc-700/50"
                      >
                        {category.tools.length}
                      </Badge>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-6 pb-5">
                      <div className="border-t border-zinc-800/50 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {category.tools.map((tool) => (
                            <div
                              key={tool.name}
                              className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/30 hover:border-violet-500/20 transition-colors"
                            >
                              <h4 className="text-sm font-semibold text-zinc-200 mb-1">
                                {tool.name}
                              </h4>
                              <p className="text-sm text-zinc-500 leading-relaxed">
                                {tool.description}
                              </p>
                            </div>
                          ))}
                        </div>
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
