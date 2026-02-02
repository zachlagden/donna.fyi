"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { timeline } from "@/lib/data";

export function DayWithDonna() {
  return (
    <section id="day-with-donna" className="max-w-4xl mx-auto px-6 py-24">
      <FadeIn>
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-zinc-100">
          <span className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            A Day with Donna
          </span>
        </h2>
        <p className="text-zinc-600 text-sm mb-12 italic">
          This isn&apos;t hypothetical. This is a Tuesday.
        </p>
      </FadeIn>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[4.5rem] sm:left-[5.5rem] top-0 bottom-12 w-px bg-gradient-to-b from-violet-500/30 via-violet-500/10 to-transparent" />

        <div className="space-y-1">
          {timeline.map((entry, i) => (
            <FadeIn key={i} delay={i * 0.08} y={16}>
              <div className="flex gap-4 sm:gap-6 group">
                {/* Time */}
                <div className="w-14 sm:w-18 shrink-0 pt-5 text-right">
                  <span className="text-sm font-mono font-semibold text-zinc-500 group-hover:text-violet-400 transition-colors">
                    {entry.time}
                  </span>
                </div>

                {/* Dot */}
                <div className="relative shrink-0 pt-5">
                  <div className="w-3 h-3 rounded-full bg-zinc-800 border-2 border-zinc-600 group-hover:border-violet-400 group-hover:bg-violet-500/20 transition-colors" />
                </div>

                {/* Card */}
                <div className="flex-1 pb-6">
                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/30 group-hover:border-violet-500/20 transition-colors">
                    <p className="text-zinc-300 text-[0.95rem] leading-relaxed mb-3">
                      {entry.action}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs ${entry.channelColor}`}
                    >
                      {entry.channel}
                    </Badge>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Closing note */}
        <FadeIn delay={timeline.length * 0.08 + 0.1}>
          <p className="text-center text-zinc-600 text-sm mt-8 italic">
            And that&apos;s just a quiet day.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
