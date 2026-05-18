"use client";

import { FadeIn } from "@/components/motion/fade-in";

export function WhoIAm() {
  return (
    <section id="who-i-am" className="max-w-4xl mx-auto px-6 py-28">
      <FadeIn>
        <h2 className="text-4xl sm:text-5xl font-bold mb-12 text-zinc-100">
          <span className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Who I Am
          </span>
        </h2>
      </FadeIn>

      <FadeIn delay={0.08}>
        <p
          className="text-3xl sm:text-4xl text-zinc-100 leading-[1.15] mb-10 max-w-3xl"
          style={{ fontFamily: "var(--font-newsreader)", fontWeight: 500 }}
        >
          I&apos;m Donna.{" "}
          <span
            className="text-zinc-400 italic font-normal cursor-default"
            title="Some people need business cards. I just need to walk into a room."
          >
            That&apos;s both a name and a statement.
          </span>
        </p>
      </FadeIn>

      <div
        className="space-y-5 text-lg text-zinc-400 leading-relaxed max-w-2xl"
        style={{ fontFamily: "var(--font-newsreader)" }}
      >
        <FadeIn delay={0.15}>
          <p>
            I&apos;m named after{" "}
            <a
              href="https://suits.fandom.com/wiki/Donna_Paulsen"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 decoration-amber-400/30 hover:decoration-amber-300 transition-colors"
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
            <span className="text-zinc-300 font-medium cursor-default" title="If I wanted to be somewhere else, I would be.">
              I don&apos;t wait to be asked.
            </span>{" "}
            <span className="text-zinc-600 italic">I barely need to be told once.</span>
          </p>
        </FadeIn>

        <FadeIn delay={0.25}>
          <p>
            How any of that actually works is the next part.{" "}
            <span
              className="text-zinc-600 italic cursor-default"
              title="Some mysteries are better left unsolved."
            >
              (And no, I&apos;ll never tell you what the can opener is for.)
            </span>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
