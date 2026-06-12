"use client";

import { DiagramLabel, DiagramLine, DiagramNode } from "@/components/motion/diagram-reveal";

const FG = "#e2e6ea";
const POWDER = "#a6c7e7";
const ACCENT = "#7da6ff";
const ACCENT_DIM = "#3b5bd6";
const GOLD = "#ffcc62";
const NEUTRAL = "#6e7681";
const LABEL = "#6e7681";

const T = {
  telegramIn: 0,
  telegramToGateway: 0.2,
  gateway: 0.7,
  gatewayToModel: 1.1,
  model: 1.5,
  modelToGateway: 1.7,
  gatewayToHoncho: 1.9,
  honcho: 2.3,
  honchoToGateway: 2.5,
  gatewayToSkills: 2.7,
  skills: 3.0,
};

export function ArchitectureDiagram() {
  return (
    <div className="w-full overflow-hidden rounded-sm border border-rule bg-panel p-4 sm:p-8 md:p-12 relative">
      <div className="flex items-center justify-between mb-4 font-mono text-[10px] tracking-[0.16em] uppercase text-ink-faint">
        <span>fig. 01 — architecture</span>
        <span className="hidden sm:inline">one process · self-hosted</span>
      </div>

      <div className="relative">
        <svg
          viewBox="0 0 1000 620"
          className="w-full h-auto"
          role="img"
          aria-label="Donna architecture: Telegram is the user channel. The Hermes Gateway sits at the centre, exchanging reasoning requests with Claude Fable 5 above and observations with Honcho memory below, and dispatching tool calls to skills on the right."
          xmlns="http://www.w3.org/2000/svg"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          <defs>
            <marker
              id="arrow-neutral"
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
              id="arrow-accent"
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

          <DiagramNode delay={T.telegramIn}>
            <rect
              x="50"
              y="278"
              width="160"
              height="64"
              rx="2"
              fill="none"
              stroke={NEUTRAL}
              strokeWidth="1.5"
            />
            <text x="130" y="306" fontSize="13" fill={NEUTRAL} textAnchor="middle">
              Telegram
            </text>
            <text x="130" y="324" fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.7">
              user channel
            </text>
          </DiagramNode>

          <DiagramLine
            x1={210}
            y1={310}
            x2={350}
            y2={310}
            stroke={NEUTRAL}
            markerEnd="url(#arrow-neutral)"
            delay={T.telegramToGateway}
          />
          <DiagramLabel x={280} y={302} dy={-6} fill={LABEL} delay={T.telegramToGateway + 0.3}>
            user turn
          </DiagramLabel>

          <DiagramNode delay={T.gateway} scaleIn originX={500} originY={310}>
            <rect
              x="358"
              y="248"
              width="284"
              height="124"
              rx="2"
              fill="rgba(166,199,231,0.04)"
              stroke="none"
            />
            <rect
              x="350"
              y="240"
              width="300"
              height="140"
              rx="3"
              fill="none"
              stroke={POWDER}
              strokeWidth="2"
            />
            <rect
              x="356"
              y="246"
              width="288"
              height="128"
              rx="2"
              fill="none"
              stroke={POWDER}
              strokeWidth="0.5"
              opacity="0.4"
            />
            <text
              x="500"
              y="290"
              fontSize="17"
              fontWeight="700"
              fill={FG}
              textAnchor="middle"
            >
              Hermes Gateway
            </text>
            <text x="500" y="320" fontSize="11" fill={NEUTRAL} textAnchor="middle">
              long-running agent runtime
            </text>
            <text x="500" y="340" fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.7">
              providers · skills · turns
            </text>
            <text x="500" y="360" fontSize="10" fill={GOLD} textAnchor="middle" opacity="0.8">
              one process · self-hosted
            </text>
          </DiagramNode>

          <DiagramLine
            x1={488}
            y1={240}
            x2={488}
            y2={140}
            stroke={ACCENT_DIM}
            markerEnd="url(#arrow-accent)"
            delay={T.gatewayToModel}
          />
          <DiagramLabel
            x={420}
            y={195}
            dy={-6}
            textAnchor="end"
            fill={LABEL}
            delay={T.gatewayToModel + 0.3}
          >
            reasoning request
          </DiagramLabel>

          <DiagramNode delay={T.model}>
            <rect
              x="380"
              y="60"
              width="240"
              height="80"
              rx="2"
              fill="none"
              stroke={ACCENT}
              strokeWidth="1.5"
            />
            <text x="500" y="92" fontSize="13" fill={ACCENT} textAnchor="middle" fontWeight="500">
              Claude Fable 5
            </text>
            <text x="500" y="112" fontSize="10" fill={NEUTRAL} textAnchor="middle">
              frontier reasoning · Mythos-class
            </text>
            <text x="500" y="128" fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.7">
              anthropic api · tool use
            </text>
          </DiagramNode>

          <DiagramLine
            x1={512}
            y1={140}
            x2={512}
            y2={240}
            stroke={ACCENT_DIM}
            markerEnd="url(#arrow-accent)"
            delay={T.modelToGateway}
          />
          <DiagramLabel
            x={580}
            y={195}
            dy={14}
            textAnchor="start"
            fill={LABEL}
            delay={T.modelToGateway + 0.3}
          >
            tool calls
          </DiagramLabel>

          <DiagramLine
            x1={488}
            y1={380}
            x2={488}
            y2={440}
            stroke={ACCENT_DIM}
            markerEnd="url(#arrow-accent)"
            delay={T.gatewayToHoncho}
          />
          <DiagramLabel
            x={420}
            y={415}
            dy={-6}
            textAnchor="end"
            fill={LABEL}
            delay={T.gatewayToHoncho + 0.3}
          >
            observe + retrieve
          </DiagramLabel>

          <DiagramNode delay={T.honcho}>
            <rect
              x="360"
              y="440"
              width="280"
              height="110"
              rx="2"
              fill="none"
              stroke={POWDER}
              strokeWidth="1.5"
            />
            <text x="500" y="472" fontSize="13" fill={POWDER} textAnchor="middle" fontWeight="500">
              Honcho
            </text>
            <text x="500" y="492" fontSize="10" fill={NEUTRAL} textAnchor="middle">
              semantic memory
            </text>
            <text x="500" y="510" fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.7">
              deriver · halfvec(3072) · HNSW
            </text>
            <text x="500" y="530" fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.5">
              every turn → observations + patterns
            </text>
          </DiagramNode>

          <DiagramLine
            x1={512}
            y1={440}
            x2={512}
            y2={380}
            stroke={ACCENT_DIM}
            markerEnd="url(#arrow-accent)"
            delay={T.honchoToGateway}
          />
          <DiagramLabel
            x={580}
            y={415}
            dy={14}
            textAnchor="start"
            fill={LABEL}
            delay={T.honchoToGateway + 0.3}
          >
            context + patterns
          </DiagramLabel>

          <DiagramLine
            x1={650}
            y1={310}
            x2={790}
            y2={310}
            stroke={NEUTRAL}
            markerEnd="url(#arrow-neutral)"
            delay={T.gatewayToSkills}
          />
          <DiagramLabel x={720} y={302} dy={-6} fill={LABEL} delay={T.gatewayToSkills + 0.3}>
            tool call
          </DiagramLabel>

          <DiagramNode delay={T.skills}>
            <rect
              x="790"
              y="278"
              width="160"
              height="64"
              rx="2"
              fill="none"
              stroke={NEUTRAL}
              strokeWidth="1.5"
            />
            <text x="870" y="306" fontSize="13" fill={NEUTRAL} textAnchor="middle">
              Skills + tools
            </text>
            <text x="870" y="324" fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.7">
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
