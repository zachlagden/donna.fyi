"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { ArchitectureDiagram } from "./architecture-diagram";
import { DossierHeading } from "./dossier";
import { ArrowUpRight } from "lucide-react";

export function HowSheWorks() {
  return (
    <section id="how-she-works" className="relative max-w-4xl mx-auto px-6 py-24">
      <FadeIn mode="dossier">
        <div className="mb-8">
          <DossierHeading index="02" eyebrow="runtime">
            How she works
          </DossierHeading>
        </div>
      </FadeIn>

      <FadeIn mode="dossier" delay={0.05}>
        <div className="space-y-5 text-ink-muted text-[1.05rem] leading-relaxed max-w-3xl">
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
            <ExternalLink href="https://www.anthropic.com/news/claude-fable-5-mythos-5">Claude Fable 5</ExternalLink>
            , the first of Anthropic&apos;s Mythos-class models and the most capable model
            generally available. Chosen because judgment is the whole job. Long
            conversations stay coherent, tool calls stay tight, and the hard calls read
            like judgment rather than autocomplete.
          </p>
          <p>
            Skills are installable, versioned units of capability. They ship as folders
            and get loaded by the gateway on demand. Anthropic&apos;s official skills
            (<code className="text-cobalt-bright font-mono text-sm">xlsx</code>,{" "}
            <code className="text-cobalt-bright font-mono text-sm">pdf</code>,{" "}
            <code className="text-cobalt-bright font-mono text-sm">docx</code>,{" "}
            <code className="text-cobalt-bright font-mono text-sm">pptx</code>) are
            installed; the integrations below are wired in the same way.
          </p>
          <p className="text-ink">
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
      className="text-cobalt-bright hover:text-powder underline underline-offset-4 decoration-cobalt-bright/30 hover:decoration-powder transition-colors inline-flex items-baseline gap-0.5"
    >
      {children}
      <ArrowUpRight className="w-3 h-3 inline" />
    </a>
  );
}
