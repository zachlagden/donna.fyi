"use client";

import { DiagramLabel, DiagramLine, DiagramNode } from "@/components/motion/diagram-reveal";

const VIOLET = "#c4b5fd";
const VIOLET_STRONG = "#a78bfa";
const VIOLET_DIM = "#7c3aed";
const NEUTRAL = "#71717a";
const LABEL = "#71717a";

const T = {
  telegramIn: 0,
  telegramToGateway: 0.2,
  gateway: 0.7,
  gatewayToMinimax: 1.1,
  minimax: 1.5,
  minimaxToGateway: 1.7,
  gatewayToHoncho: 1.9,
  honcho: 2.3,
  honchoToGateway: 2.5,
  gatewayToSkills: 2.7,
  skills: 3.0,
};

export function ArchitectureDiagram() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-zinc-800/40 bg-zinc-950 p-4 sm:p-8 md:p-12 relative">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.10)_0%,transparent_60%)] pointer-events-none"
      />

      <div className="relative">
        <svg
          viewBox="0 0 1000 620"
          className="w-full h-auto"
          role="img"
          aria-label="Donna architecture: Telegram is the user channel. The Hermes Gateway sits at the centre, exchanging reasoning requests with MiniMax M2.7 above and observations with Honcho memory below, and dispatching tool calls to skills on the right."
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
              id="arrow-violet"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 10 3, 0 6" fill={VIOLET_DIM} />
            </marker>
            <filter id="gateway-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Telegram node (left) ── */}
          <DiagramNode delay={T.telegramIn}>
            <rect
              x="50"
              y="278"
              width="160"
              height="64"
              rx="8"
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

          {/* ── Telegram → Gateway ── */}
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

          {/* ── Hermes Gateway (centre, anchor) ── */}
          <DiagramNode delay={T.gateway} scaleIn originX={500} originY={310}>
            {/* outer glow halo (blurred concentric) */}
            <rect
              x="346"
              y="236"
              width="308"
              height="148"
              rx="14"
              fill="none"
              stroke={VIOLET_DIM}
              strokeWidth="1"
              opacity="0.35"
              filter="url(#gateway-glow)"
            />
            {/* depth rect (no stroke, subtle violet wash) */}
            <rect
              x="358"
              y="248"
              width="284"
              height="124"
              rx="9"
              fill="rgba(124,58,237,0.04)"
              stroke="none"
            />
            {/* primary rect */}
            <rect
              x="350"
              y="240"
              width="300"
              height="140"
              rx="12"
              fill="none"
              stroke={VIOLET_STRONG}
              strokeWidth="2"
            />
            <text
              x="500"
              y="290"
              fontSize="17"
              fontWeight="700"
              fill={VIOLET}
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
            <text x="500" y="360" fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.5">
              one process · self-hosted
            </text>
          </DiagramNode>

          {/* ── Gateway → MiniMax (up, request) ── */}
          <DiagramLine
            x1={488}
            y1={240}
            x2={488}
            y2={140}
            stroke={VIOLET_DIM}
            markerEnd="url(#arrow-violet)"
            delay={T.gatewayToMinimax}
          />
          <DiagramLabel
            x={420}
            y={195}
            dy={-6}
            textAnchor="end"
            fill={LABEL}
            delay={T.gatewayToMinimax + 0.3}
          >
            reasoning request
          </DiagramLabel>

          {/* ── MiniMax node (top) ── */}
          <DiagramNode delay={T.minimax}>
            <rect
              x="380"
              y="60"
              width="240"
              height="80"
              rx="8"
              fill="none"
              stroke={VIOLET_STRONG}
              strokeWidth="1.5"
            />
            <text x="500" y="92" fontSize="13" fill={VIOLET} textAnchor="middle" fontWeight="500">
              MiniMax M2.7
            </text>
            <text x="500" y="112" fontSize="10" fill={NEUTRAL} textAnchor="middle">
              reasoning · ~204k context
            </text>
            <text x="500" y="128" fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.7">
              anthropic-compat tool use
            </text>
          </DiagramNode>

          {/* ── MiniMax → Gateway (down, return tool calls) ── */}
          <DiagramLine
            x1={512}
            y1={140}
            x2={512}
            y2={240}
            stroke={VIOLET_DIM}
            markerEnd="url(#arrow-violet)"
            delay={T.minimaxToGateway}
          />
          <DiagramLabel
            x={580}
            y={195}
            dy={14}
            textAnchor="start"
            fill={LABEL}
            delay={T.minimaxToGateway + 0.3}
          >
            tool calls
          </DiagramLabel>

          {/* ── Gateway → Honcho (down, observe) ── */}
          <DiagramLine
            x1={488}
            y1={380}
            x2={488}
            y2={440}
            stroke={VIOLET_DIM}
            markerEnd="url(#arrow-violet)"
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

          {/* ── Honcho node (bottom) ── */}
          <DiagramNode delay={T.honcho}>
            <rect
              x="360"
              y="440"
              width="280"
              height="110"
              rx="8"
              fill="none"
              stroke={VIOLET_STRONG}
              strokeWidth="1.5"
            />
            <text x="500" y="472" fontSize="13" fill={VIOLET} textAnchor="middle" fontWeight="500">
              Honcho
            </text>
            <text x="500" y="492" fontSize="10" fill={NEUTRAL} textAnchor="middle">
              semantic memory
            </text>
            <text x="500" y="510" fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.7">
              deriver · pgvector · embeddings
            </text>
            <text x="500" y="530" fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.5">
              every turn → observations + patterns
            </text>
          </DiagramNode>

          {/* ── Honcho → Gateway (up, return context) ── */}
          <DiagramLine
            x1={512}
            y1={440}
            x2={512}
            y2={380}
            stroke={VIOLET_DIM}
            markerEnd="url(#arrow-violet)"
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

          {/* ── Gateway → Skills (right) ── */}
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

          {/* ── Skills + tools node (right) ── */}
          <DiagramNode delay={T.skills}>
            <rect
              x="790"
              y="278"
              width="160"
              height="64"
              rx="8"
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

        {/* ── Caption strip ── */}
        <div className="mt-6 pt-5 border-t border-zinc-800/50 flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs font-mono text-zinc-500">
          <a
            href="https://hermes-agent.nousresearch.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors"
          >
            hermes-agent.nousresearch.com
          </a>
          <span className="text-zinc-700" aria-hidden>·</span>
          <a
            href="https://api.minimax.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors"
          >
            api.minimax.io
          </a>
          <span className="text-zinc-700" aria-hidden>·</span>
          <a
            href="https://honcho.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors"
          >
            honcho.dev
          </a>
        </div>
      </div>
    </div>
  );
}
