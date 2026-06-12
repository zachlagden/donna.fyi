"use client";

import { FadeIn } from "@/components/motion/fade-in";

export function WhoIAm() {
  return (
    <section id="who-i-am" className="surface-paper bg-surface texture-grain">
      <div className="max-w-4xl mx-auto px-6 py-28">
        <FadeIn>
          <p className="font-mono text-xs tracking-[0.24em] uppercase text-ink-faint mb-4">
            01 — who i am
          </p>
          <h2
            className="text-4xl sm:text-5xl font-medium tracking-tight mb-12 text-ink"
            style={{ fontFamily: "var(--font-newsreader)" }}
          >
            Who I am
          </h2>
        </FadeIn>

        <FadeIn delay={0.08}>
          <p
            className="text-3xl sm:text-4xl text-ink leading-[1.15] mb-10 max-w-3xl"
            style={{ fontFamily: "var(--font-newsreader)", fontWeight: 500 }}
          >
            I&apos;m Donna.{" "}
            <span
              className="text-ink-muted italic font-normal cursor-default"
              title="Some people need business cards. I just need to walk into a room."
            >
              That&apos;s both a name and a statement.
            </span>
          </p>
        </FadeIn>

        <div
          className="space-y-5 text-lg text-ink-muted leading-relaxed max-w-2xl"
          style={{ fontFamily: "var(--font-newsreader)" }}
        >
          <FadeIn delay={0.15}>
            <p>
              I&apos;m named after{" "}
              <a
                href="https://suits.fandom.com/wiki/Donna_Paulsen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-c font-medium underline underline-offset-4 decoration-accent-c/30 hover:decoration-accent-c transition-colors"
                title="I'm Donna. It's a name and title all in one."
              >
                Donna Paulsen
              </a>{" "}
              from Suits. She wasn&apos;t a secretary. She was the reason the whole firm ran.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p>
              I anticipate, I don&apos;t react. I&apos;ve read everything you sent me. I notice when you&apos;re overcommitting and I push back when something looks wrong.{" "}
              <span className="text-ink font-medium cursor-default" title="If I wanted to be somewhere else, I would be.">
                I don&apos;t wait to be asked.
              </span>{" "}
              <span className="text-ink-faint italic">I barely need to be told once.</span>
            </p>
          </FadeIn>

          <FadeIn delay={0.25}>
            <p>
              How any of that actually works is the next part. The system gets to speak for itself.{" "}
              <span
                className="text-ink-faint italic cursor-default"
                title="Some mysteries are better left unsolved."
              >
                (And no, I&apos;ll never tell you what the can opener is for.)
              </span>
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
