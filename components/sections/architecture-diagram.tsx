"use client";

import { DiagramReveal } from "@/components/motion/diagram-reveal";

const VIOLET = "#c4b5fd";
const VIOLET_DIM = "#7c3aed";
const NEUTRAL = "#71717a";

export function ArchitectureDiagram() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-950 p-8">
      <svg
        viewBox="0 0 800 480"
        className="w-full h-auto"
        role="img"
        aria-label="Donna architecture: Telegram client connects to the Hermes Gateway, which routes through MiniMax M2.7 for reasoning and Honcho for memory, then back out to skills and tools."
        xmlns="http://www.w3.org/2000/svg"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill={NEUTRAL} />
          </marker>
        </defs>

        <DiagramReveal delay={0}>
          <rect x="40" y="200" width="140" height="60" rx="8" fill="none" stroke={NEUTRAL} strokeWidth="1.5" />
          <text x="110" y="225" fontSize="13" fill={NEUTRAL} textAnchor="middle">Telegram</text>
          <text x="110" y="245" fontSize="11" fill={NEUTRAL} textAnchor="middle" opacity="0.7">user channel</text>
        </DiagramReveal>

        <DiagramReveal delay={0.15}>
          <line x1="180" y1="230" x2="280" y2="230" stroke={NEUTRAL} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        </DiagramReveal>

        <DiagramReveal delay={0.25}>
          <rect x="280" y="180" width="240" height="100" rx="10" fill="none" stroke={VIOLET} strokeWidth="2" />
          <text x="400" y="215" fontSize="15" fill={VIOLET} textAnchor="middle" fontWeight="600">Hermes Gateway</text>
          <text x="400" y="240" fontSize="11" fill={NEUTRAL} textAnchor="middle">long-running agent runtime</text>
          <text x="400" y="258" fontSize="11" fill={NEUTRAL} textAnchor="middle" opacity="0.7">providers · skills · turns</text>
        </DiagramReveal>

        <DiagramReveal delay={0.4}>
          <line x1="400" y1="180" x2="400" y2="120" stroke={VIOLET_DIM} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        </DiagramReveal>

        <DiagramReveal delay={0.45}>
          <rect x="300" y="50" width="200" height="70" rx="8" fill="none" stroke={VIOLET} strokeWidth="1.5" />
          <text x="400" y="80" fontSize="13" fill={VIOLET} textAnchor="middle">MiniMax M2.7</text>
          <text x="400" y="100" fontSize="11" fill={NEUTRAL} textAnchor="middle">reasoning · ~204k context</text>
        </DiagramReveal>

        <DiagramReveal delay={0.55}>
          <line x1="400" y1="280" x2="400" y2="340" stroke={VIOLET_DIM} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        </DiagramReveal>

        <DiagramReveal delay={0.6}>
          <rect x="280" y="340" width="240" height="90" rx="8" fill="none" stroke={VIOLET} strokeWidth="1.5" />
          <text x="400" y="370" fontSize="13" fill={VIOLET} textAnchor="middle">Honcho</text>
          <text x="400" y="390" fontSize="11" fill={NEUTRAL} textAnchor="middle">semantic memory</text>
          <text x="400" y="408" fontSize="11" fill={NEUTRAL} textAnchor="middle" opacity="0.7">deriver · pgvector · embeddings</text>
        </DiagramReveal>

        <DiagramReveal delay={0.7}>
          <line x1="520" y1="230" x2="620" y2="230" stroke={NEUTRAL} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        </DiagramReveal>

        <DiagramReveal delay={0.75}>
          <rect x="620" y="200" width="140" height="60" rx="8" fill="none" stroke={NEUTRAL} strokeWidth="1.5" />
          <text x="690" y="225" fontSize="13" fill={NEUTRAL} textAnchor="middle">Skills + tools</text>
          <text x="690" y="245" fontSize="11" fill={NEUTRAL} textAnchor="middle" opacity="0.7">xlsx pdf docx · email · cron</text>
        </DiagramReveal>

        <DiagramReveal delay={0.85}>
          <text x="430" y="318" fontSize="10" fill={NEUTRAL} opacity="0.6" fontStyle="italic">every turn → observations + patterns</text>
        </DiagramReveal>
      </svg>
    </div>
  );
}
