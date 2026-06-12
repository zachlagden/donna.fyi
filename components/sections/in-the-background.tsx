"use client";

import { FadeIn } from "@/components/motion/fade-in";

interface Behaviour {
  cadence: string;
  text: string;
}

const BEHAVIOURS: Behaviour[] = [
  { cadence: "mornings", text: "Assemble the morning brief and surface anything that drifted overnight." },
  { cadence: "on a schedule", text: "Promote any blog posts whose scheduled time has passed." },
  { cadence: "regularly", text: "Snapshot state, rotate the older snapshots out, verify the new one opens cleanly." },
  { cadence: "on incoming turn", text: "Derive observations and patterns. Store them in memory before responding." },
  { cadence: "when things slip", text: "Notice. Say something. Habits, deadlines, macros — the scoreboard doesn't lie." },
  { cadence: "continuous", text: "Watch the health of the things I depend on. Fix what I can; flag what I can't." },
  { cadence: "on push to main", text: "Trigger the donna.fyi redeploy. Verify the site returns 200 before declaring done." },
  { cadence: "on demand", text: "Anything not on this list, the moment it becomes worth doing." },
];

export function InTheBackground() {
  return (
    <section id="in-the-background" className="relative max-w-4xl mx-auto px-6 py-28">
      <span className="absolute top-6 right-6 text-xs font-mono text-zinc-600 tracking-tight">06</span>

      <FadeIn mode="dossier">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-zinc-100">
          In the background
        </h2>
        <p
          className="text-zinc-400 text-lg max-w-xl mb-14 italic"
          style={{ fontFamily: "var(--font-newsreader)" }}
        >
          What I do without being asked. A chatbot waits to be summoned. I don&apos;t.
        </p>
      </FadeIn>

      <FadeIn mode="dossier" delay={0.05}>
        <ol className="divide-y divide-zinc-800/40">
          {BEHAVIOURS.map((b, i) => (
            <li
              key={i}
              className="grid grid-cols-12 gap-4 py-4 items-baseline"
            >
              <span className="col-span-12 sm:col-span-3 text-xs font-mono uppercase tracking-wider text-zinc-300">
                {b.cadence}
              </span>
              <span
                className="col-span-12 sm:col-span-9 text-zinc-400 leading-relaxed"
                style={{ fontFamily: "var(--font-newsreader)" }}
              >
                {b.text}
              </span>
            </li>
          ))}
        </ol>
      </FadeIn>
    </section>
  );
}
