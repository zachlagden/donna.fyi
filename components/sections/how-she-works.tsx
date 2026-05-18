"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { ArchitectureDiagram } from "./architecture-diagram";
import { ArrowUpRight } from "lucide-react";

export function HowSheWorks() {
  return (
    <section id="how-she-works" className="max-w-4xl mx-auto px-6 py-24">
      <FadeIn mode="dossier">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3 font-mono">
          03 · Dossier
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-zinc-100">
          How she works
        </h2>
      </FadeIn>

      <FadeIn mode="dossier" delay={0.05}>
        <div className="space-y-5 text-zinc-400 text-[1.05rem] leading-relaxed max-w-3xl">
          <p>
            Donna runs on{" "}
            <ExternalLink href="https://hermes-agent.nousresearch.com">Hermes Agent</ExternalLink>
            , a long-running agent runtime by Nous Research. Hermes provides the spine:
            a single gateway process that holds the conversation, routes turns through a
            configurable reasoning model, executes skills and tools, and persists state
            across restarts.
          </p>
          <p>
            The reasoning model is{" "}
            <ExternalLink href="https://www.minimax.io/models/text/m27">MiniMax-M2.7-highspeed</ExternalLink>
            . Chosen for the long context window (~204k tokens), the Anthropic-compatible
            tool-use endpoint, and a temperament that holds up over long horizons without
            getting weird. Long conversations stay coherent; tool calls stay tight.
          </p>
          <p>
            Skills are installable, versioned units of capability. They ship as folders
            and get loaded by the gateway on demand. Anthropic&apos;s official skills
            (<code className="text-violet-400 font-mono text-sm">xlsx</code>,{" "}
            <code className="text-violet-400 font-mono text-sm">pdf</code>,{" "}
            <code className="text-violet-400 font-mono text-sm">docx</code>,{" "}
            <code className="text-violet-400 font-mono text-sm">pptx</code>) are
            installed; the integrations below are wired in the same way.
          </p>
          <p>
            All of it self-hosted. Not a vendor SaaS, not a wrapper around someone
            else&apos;s API. One process, on Zach&apos;s box, with structured memory
            attached.
          </p>
        </div>
      </FadeIn>

      <div className="mt-10">
        <ArchitectureDiagram />
      </div>
    </section>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-violet-400 hover:text-violet-300 underline underline-offset-4 decoration-violet-400/30 hover:decoration-violet-300 transition-colors inline-flex items-baseline gap-0.5"
    >
      {children}
      <ArrowUpRight className="w-3 h-3 inline" />
    </a>
  );
}
