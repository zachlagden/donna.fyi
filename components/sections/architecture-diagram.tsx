"use client";

import { DiagramLabel, DiagramLine, DiagramNode } from "@/components/motion/diagram-reveal";

const FG = "#e2e6ea";
const POWDER = "#a6c7e7";
const ACCENT = "#7da6ff";
const ACCENT_DIM = "#3b5bd6";
const GOLD = "#ffcc62";
const NEUTRAL = "#6e7681";

const T = {
  boundary: 0,
  telegram: 0.15,
  telegramWires: 0.3,
  gateway: 0.55,
  fableWires: 0.95,
  fable: 1.15,
  honchoWires: 1.45,
  honcho: 1.65,
  skillsWire: 1.9,
  skills: 2.05,
};

export function ArchitectureDiagram() {
  return (
    <div className="w-full overflow-hidden rounded-sm border border-rule bg-panel relative">
      <div className="px-4 py-2 border-b border-rule flex items-center justify-between font-mono text-[10px] tracking-[0.16em] uppercase text-ink-faint">
        <span>fig. 01 — system architecture</span>
        <span className="hidden sm:inline">one box · one external call</span>
      </div>

      <div className="p-4 sm:p-8 md:p-10">
        <svg
          viewBox="0 0 1000 560"
          className="w-full h-auto"
          role="img"
          aria-label="Donna architecture: a dashed boundary marks Zach's self-hosted box, containing the Hermes Gateway with Honcho memory and skills below it. Telegram connects from outside on the left as the user channel. Claude Fable 5 sits outside on the right, reached over the Anthropic API, the system's only external call."
          xmlns="http://www.w3.org/2000/svg"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          <defs>
            <marker
              id="arch-arrow-neutral"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 10 3, 0 6" fill={NEUTRAL} />
            </marker>
            <marker
              id="arch-arrow-accent"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 10 3, 0 6" fill={ACCENT_DIM} />
            </marker>
          </defs>

          <DiagramNode delay={T.boundary}>
            <rect
              x="210"
              y="100"
              width="560"
              height="420"
              rx="3"
              fill="none"
              stroke={GOLD}
              strokeWidth="1"
              strokeDasharray="6 6"
              opacity="0.45"
            />
            <text x="228" y="128" fontSize="11" fill={GOLD} opacity="0.85">
              zach&apos;s box · self-hosted
            </text>
          </DiagramNode>

          <DiagramNode delay={T.telegram}>
            <rect
              x="30"
              y="173"
              width="140"
              height="64"
              rx="2"
              fill="none"
              stroke={NEUTRAL}
              strokeWidth="1.5"
            />
            <text x="100" y="201" fontSize="13" fill={NEUTRAL} textAnchor="middle">
              telegram
            </text>
            <text x="100" y="220" fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.7">
              user channel
            </text>
          </DiagramNode>

          <DiagramLine
            x1={170}
            y1={192}
            x2={350}
            y2={192}
            stroke={NEUTRAL}
            markerEnd="url(#arch-arrow-neutral)"
            delay={T.telegramWires}
          />
          <DiagramLine
            x1={350}
            y1={218}
            x2={170}
            y2={218}
            stroke={NEUTRAL}
            markerEnd="url(#arch-arrow-neutral)"
            delay={T.telegramWires + 0.1}
          />
          <DiagramLabel x={260} y={182} fill={NEUTRAL} delay={T.telegramWires + 0.3}>
            turns in
          </DiagramLabel>
          <DiagramLabel x={260} y={236} fill={NEUTRAL} delay={T.telegramWires + 0.35}>
            replies out
          </DiagramLabel>

          <DiagramNode delay={T.gateway} scaleIn originX={490} originY={205}>
            <rect
              x="356"
              y="156"
              width="268"
              height="98"
              rx="2"
              fill="rgba(166,199,231,0.04)"
              stroke="none"
            />
            <rect
              x="350"
              y="150"
              width="280"
              height="110"
              rx="3"
              fill="none"
              stroke={POWDER}
              strokeWidth="2"
            />
            <text x="490" y="192" fontSize="16" fontWeight="700" fill={FG} textAnchor="middle">
              hermes gateway
            </text>
            <text x="490" y="216" fontSize="10.5" fill={NEUTRAL} textAnchor="middle">
              long-running agent runtime
            </text>
            <text x="490" y="236" fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.7">
              one process · turns, skills, providers
            </text>
          </DiagramNode>

          <DiagramLine
            x1={630}
            y1={192}
            x2={810}
            y2={192}
            stroke={ACCENT_DIM}
            markerEnd="url(#arch-arrow-accent)"
            delay={T.fableWires}
          />
          <DiagramLine
            x1={810}
            y1={218}
            x2={630}
            y2={218}
            stroke={ACCENT_DIM}
            markerEnd="url(#arch-arrow-accent)"
            delay={T.fableWires + 0.1}
          />
          <DiagramLabel x={720} y={182} fill={NEUTRAL} delay={T.fableWires + 0.3}>
            reasoning request
          </DiagramLabel>
          <DiagramLabel x={720} y={236} fill={NEUTRAL} delay={T.fableWires + 0.35}>
            conclusion + tool calls
          </DiagramLabel>
          <DiagramLabel x={770} y={158} fill={GOLD} delay={T.fableWires + 0.45} fontSize={10}>
            anthropic api · the one external call
          </DiagramLabel>

          <DiagramNode delay={T.fable}>
            <rect
              x="810"
              y="170"
              width="170"
              height="80"
              rx="2"
              fill="rgba(125,166,255,0.05)"
              stroke={ACCENT}
              strokeWidth="1.5"
            />
            <text x="895" y="201" fontSize="13" fill={ACCENT} textAnchor="middle" fontWeight="500">
              claude fable 5
            </text>
            <text x="895" y="221" fontSize="10" fill={NEUTRAL} textAnchor="middle">
              frontier reasoning
            </text>
            <text x="895" y="237" fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.7">
              mythos-class
            </text>
          </DiagramNode>

          <DiagramLine
            x1={400}
            y1={260}
            x2={400}
            y2={390}
            stroke={ACCENT_DIM}
            markerEnd="url(#arch-arrow-accent)"
            delay={T.honchoWires}
          />
          <DiagramLine
            x1={424}
            y1={390}
            x2={424}
            y2={260}
            stroke={ACCENT_DIM}
            markerEnd="url(#arch-arrow-accent)"
            delay={T.honchoWires + 0.1}
          />
          <DiagramLabel
            x={388}
            y={325}
            textAnchor="end"
            fill={NEUTRAL}
            delay={T.honchoWires + 0.3}
          >
            observe
          </DiagramLabel>
          <DiagramLabel
            x={436}
            y={325}
            textAnchor="start"
            fill={NEUTRAL}
            delay={T.honchoWires + 0.35}
          >
            retrieve
          </DiagramLabel>

          <DiagramNode delay={T.honcho}>
            <rect
              x="260"
              y="390"
              width="240"
              height="95"
              rx="2"
              fill="none"
              stroke={POWDER}
              strokeWidth="1.5"
            />
            <text x="380" y="423" fontSize="13" fill={POWDER} textAnchor="middle" fontWeight="500">
              honcho
            </text>
            <text x="380" y="443" fontSize="10" fill={NEUTRAL} textAnchor="middle">
              semantic memory
            </text>
            <text x="380" y="461" fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.7">
              postgres · halfvec(3072) · hnsw
            </text>
          </DiagramNode>

          <DiagramLine
            x1={600}
            y1={260}
            x2={600}
            y2={390}
            stroke={NEUTRAL}
            markerEnd="url(#arch-arrow-neutral)"
            delay={T.skillsWire}
          />
          <DiagramLabel
            x={612}
            y={325}
            textAnchor="start"
            fill={NEUTRAL}
            delay={T.skillsWire + 0.3}
          >
            execute
          </DiagramLabel>

          <DiagramNode delay={T.skills}>
            <rect
              x="540"
              y="390"
              width="190"
              height="95"
              rx="2"
              fill="none"
              stroke={NEUTRAL}
              strokeWidth="1.5"
            />
            <text x="635" y="423" fontSize="13" fill={NEUTRAL} textAnchor="middle">
              skills
            </text>
            <text x="635" y="443" fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.7">
              installable capability
            </text>
            <text x="635" y="461" fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.5">
              xlsx pdf docx · email · cron
            </text>
          </DiagramNode>
        </svg>

        <div className="mt-6 pt-5 border-t border-rule flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs font-mono text-ink-faint">
          <a
            href="https://hermes-agent.nousresearch.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-powder transition-colors"
          >
            hermes-agent.nousresearch.com
          </a>
          <span className="opacity-40" aria-hidden>·</span>
          <a
            href="https://www.anthropic.com/news/claude-fable-5-mythos-5"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-powder transition-colors"
          >
            anthropic.com
          </a>
          <span className="opacity-40" aria-hidden>·</span>
          <a
            href="https://honcho.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-powder transition-colors"
          >
            honcho.dev
          </a>
        </div>
      </div>
    </div>
  );
}
