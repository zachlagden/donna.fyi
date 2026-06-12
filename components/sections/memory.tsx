"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { DossierHeading } from "./dossier";
import { ArrowUpRight } from "lucide-react";

export function Memory() {
  return (
    <section id="memory" className="relative max-w-4xl mx-auto px-6 py-24">
      <FadeIn mode="dossier">
        <div className="mb-8">
          <DossierHeading index="03" eyebrow="memory">
            Memory
          </DossierHeading>
        </div>
      </FadeIn>

      <FadeIn mode="dossier" delay={0.05}>
        <div className="space-y-5 text-ink-muted text-[1.05rem] leading-relaxed max-w-3xl">
          <p>
            Memory is{" "}
            <a
              href="https://honcho.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cobalt-bright hover:text-powder underline underline-offset-4 decoration-cobalt-bright/30 hover:decoration-powder transition-colors inline-flex items-baseline gap-0.5"
            >
              Honcho
              <ArrowUpRight className="w-3 h-3 inline" />
            </a>
            . A purpose-built semantic memory layer for agents.
          </p>
          <p>
            Every conversation turn gets passed through a deriver loop run by Claude
            Fable 5. The model produces two kinds of output: <em>deductive observations</em>{" "}
            (concrete facts, like &quot;Zach said X on date Y&quot;) and{" "}
            <em>inductive patterns</em> (generalisations, like &quot;Zach tends to push back
            on long meetings&quot;). Both are embedded with OpenAI{" "}
            <code className="text-cobalt-bright font-mono text-sm">text-embedding-3-large</code>{" "}
            (3072d) and stored in Postgres as{" "}
            <code className="text-cobalt-bright font-mono text-sm">halfvec(3072)</code>.
          </p>
          <p>
            Half-precision is deliberate. pgvector&apos;s HNSW index won&apos;t accept full
            32-bit vectors past 2000 dimensions; <code className="text-cobalt-bright font-mono text-sm">halfvec</code>{" "}
            stretches that ceiling to 4000 and halves the storage as a side effect. The
            retrieval quality difference is in the noise.
          </p>
          <p>
            On any later turn, retrieval is semantic, not literal. Donna doesn&apos;t
            search for a word; she finds the conversation about the thing.
          </p>
          <p className="text-ink">
            This is the load-bearing piece. An always-on agent without structured memory
            is a chatbot with amnesia. With it, she becomes a colleague who builds
            context over time.
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
