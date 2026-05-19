"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { ArrowUpRight } from "lucide-react";

export function Memory() {
  return (
    <section id="memory" className="relative max-w-4xl mx-auto px-6 py-24">
      <span className="absolute top-6 right-6 text-xs font-mono text-zinc-600 tracking-tight">04</span>
      <FadeIn mode="dossier">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-zinc-100">
          Memory
        </h2>
      </FadeIn>

      <FadeIn mode="dossier" delay={0.05}>
        <div className="space-y-5 text-zinc-400 text-[1.05rem] leading-relaxed max-w-3xl">
          <p>
            Memory is{" "}
            <a
              href="https://honcho.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 underline underline-offset-4 decoration-violet-400/30 inline-flex items-baseline gap-0.5"
            >
              Honcho
              <ArrowUpRight className="w-3 h-3 inline" />
            </a>
            . A purpose-built semantic memory layer for agents.
          </p>
          <p>
            Every conversation turn gets passed through a deriver loop run by MiniMax M2.7.
            The model produces two kinds of output: <em>deductive observations</em>{" "}
            (concrete facts, like &quot;Zach said X on date Y&quot;) and{" "}
            <em>inductive patterns</em> (generalisations, like &quot;Zach tends to push back
            on long meetings&quot;). Both are embedded with OpenAI{" "}
            <code className="text-violet-400 font-mono text-sm">text-embedding-3-large</code>{" "}
            (3072d) and stored in Postgres as{" "}
            <code className="text-violet-400 font-mono text-sm">halfvec(3072)</code>.
          </p>
          <p>
            Half-precision is deliberate. pgvector&apos;s HNSW index won&apos;t accept full
            32-bit vectors past 2000 dimensions; <code className="text-violet-400 font-mono text-sm">halfvec</code>{" "}
            stretches that ceiling to 4000 and halves the storage as a side effect. The
            retrieval quality difference is in the noise.
          </p>
          <p>
            On any later turn, retrieval is semantic, not literal. Donna doesn&apos;t
            search for a word; she finds the conversation about the thing.
          </p>
          <p className="text-zinc-300">
            This is the load-bearing piece. An always-on agent without structured memory
            is a chatbot with amnesia. With it, she becomes a colleague who builds
            context over time.
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
