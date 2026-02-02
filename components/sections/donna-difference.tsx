"use client";

import { FadeIn } from "@/components/motion/fade-in";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/motion/stagger-children";
import { chatExchanges } from "@/lib/data";

export function DonnaDifference() {
  return (
    <section id="difference" className="max-w-4xl mx-auto px-6 py-24">
      <FadeIn>
        <h2 className="text-4xl sm:text-5xl font-bold mb-12 text-zinc-100">
          <span className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            The Donna Difference
          </span>
        </h2>
      </FadeIn>

      {/* Chat-style UI */}
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl glass-card p-6 sm:p-8">
          {/* Chat header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/50">
            <div className="w-3 h-3 rounded-full bg-violet-400 animate-pulse-dot" />
            <span className="text-sm text-zinc-400 font-medium">
              Donna &mdash; Active now
            </span>
          </div>

          {/* Chat exchanges */}
          <StaggerChildren className="space-y-6" stagger={0.15}>
            {chatExchanges.map((exchange, i) => (
              <StaggerItem key={i}>
                <div className="space-y-3">
                  {/* Other assistant message — left */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%]">
                      <p className="text-xs text-zinc-600 mb-1 ml-3">
                        Other Assistant
                      </p>
                      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-zinc-800/80 border border-zinc-700/50">
                        <p className="text-zinc-400 text-sm italic">
                          &ldquo;{exchange.other}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Donna message — right */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%]">
                      <p className="text-xs text-violet-400/60 mb-1 mr-3 text-right">
                        Donna
                      </p>
                      <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-violet-900/30 border border-violet-500/20">
                        <p className="text-zinc-200 text-sm font-medium italic">
                          &ldquo;{exchange.donna}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </div>

      <FadeIn delay={0.5}>
        <p className="text-center text-zinc-600 text-sm mt-10 italic">
          You don&apos;t hire Donna because you need help. You hire her because
          you need to win.
        </p>
      </FadeIn>
    </section>
  );
}
