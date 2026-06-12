"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { DossierHeading, DonnaAside } from "./dossier";

interface Behaviour {
  cadence: string;
  text: string;
}

const BEHAVIOURS: Behaviour[] = [
  { cadence: "every 5m", text: "Promote any blog posts whose scheduled time has passed." },
  { cadence: "daily 07:30", text: "Assemble the morning brief and surface anything that drifted overnight." },
  { cadence: "nightly 03:30 UTC", text: "Snapshot state, rotate the older snapshots out, verify the new one opens cleanly." },
  { cadence: "nightly 04:00 UTC", text: "Check for an agent update. Apply, restart the gateway, confirm health." },
  { cadence: "on telegram unread", text: "Triage. Draft replies for the ones that need one." },
  { cadence: "on incoming turn", text: "Derive observations and patterns. Store them in memory before responding." },
  { cadence: "every hour", text: "Sweep dead links across the homepage and blog." },
  { cadence: "on cron miss", text: "Alert me on Telegram. Include the failure reason and the last successful run." },
  { cadence: "continuous", text: "Watch gateway health. Restart on consecutive failures with exponential backoff." },
  { cadence: "weekly", text: "Rotate logs. Compress what's older than seven days. Drop what's older than thirty." },
  { cadence: "on push to main", text: "Trigger the donna.fyi redeploy. Verify the site returns 200 before declaring done." },
  { cadence: "on demand", text: "Anything not on this list, the moment it becomes worth doing." },
];

export function InTheBackground() {
  return (
    <section id="in-the-background" className="relative max-w-4xl mx-auto px-6 py-24">
      <FadeIn mode="dossier">
        <div className="mb-4">
          <DossierHeading index="05" eyebrow="scheduled + reactive">
            In the background
          </DossierHeading>
        </div>
        <div className="mb-14 max-w-xl">
          <DonnaAside>
            What I do without being asked. A chatbot waits to be summoned. I don&apos;t.
          </DonnaAside>
        </div>
      </FadeIn>

      <FadeIn mode="dossier" delay={0.05}>
        <ol className="divide-y divide-rule">
          {BEHAVIOURS.map((b, i) => (
            <li
              key={i}
              className="grid grid-cols-12 gap-4 py-4 items-baseline"
            >
              <span className="col-span-12 sm:col-span-3 text-xs font-mono uppercase tracking-wider text-powder">
                {b.cadence}
              </span>
              <span className="col-span-12 sm:col-span-9 text-ink-muted leading-relaxed">
                {b.text}
              </span>
            </li>
          ))}
        </ol>
      </FadeIn>
    </section>
  );
}
