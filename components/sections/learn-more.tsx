"use client";

import { FadeIn } from "@/components/motion/fade-in";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/motion/stagger-children";
import { Github, Bot, Sparkles } from "lucide-react";

const cards = [
  {
    icon: Github,
    title: "See the Source",
    description: "The code behind this site. Open source, naturally.",
    href: "https://github.com/zachlagden/donna.fyi",
    accent: "group-hover:border-zinc-500/40 group-hover:shadow-zinc-500/10",
  },
  {
    icon: Bot,
    title: "Powered by OpenClaw",
    description: "The framework that makes Donna possible.",
    href: "https://github.com/openclaw/openclaw",
    accent:
      "group-hover:border-violet-500/40 group-hover:shadow-violet-500/10",
  },
  {
    icon: Sparkles,
    title: "Built with Claude",
    description: "Anthropic\u2019s Claude Opus 4.6 — the brain behind the operation.",
    href: "https://www.anthropic.com/news/claude-opus-4-6",
    accent: "group-hover:border-amber-500/40 group-hover:shadow-amber-500/10",
  },
];

export function LearnMore() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-24">
      <FadeIn>
        <h2 className="text-4xl sm:text-5xl font-bold mb-12 text-zinc-100">
          <span className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Learn More
          </span>
        </h2>
      </FadeIn>

      <StaggerChildren className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <StaggerItem key={card.title}>
              <a
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group block h-full p-6 rounded-2xl glass-card transition-shadow duration-300 hover:shadow-lg ${card.accent}`}
              >
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100 mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {card.description}
                </p>
              </a>
            </StaggerItem>
          );
        })}
      </StaggerChildren>
    </section>
  );
}
