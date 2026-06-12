"use client";

import { motion, useReducedMotion } from "motion/react";
import { FadeIn } from "@/components/motion/fade-in";

const FG = "#e2e6ea";
const POWDER = "#a6c7e7";
const ACCENT = "#7da6ff";
const ACCENT_DIM = "#3b5bd6";
const GOLD = "#ffcc62";
const IDLE_STROKE = "#33383f";
const IDLE_TEXT = "#5a616b";
const NEUTRAL = "#6e7681";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const NODES = {
  fable: { x: 325, y: 16, w: 150, h: 44, cx: 400, cy: 38, label: "claude fable 5" },
  gateway: { x: 310, y: 106, w: 180, h: 52, cx: 400, cy: 132, label: "hermes gateway" },
  honcho: { x: 325, y: 200, w: 150, h: 44, cx: 400, cy: 222, label: "honcho" },
  telegram: { x: 24, y: 110, w: 120, h: 44, cx: 84, cy: 132, label: "telegram" },
  skills: { x: 656, y: 110, w: 120, h: 44, cx: 716, cy: 132, label: "skills" },
} as const;

type NodeKey = keyof typeof NODES;

const WIRES = {
  "telegram-gateway": { x1: 144, y1: 132, x2: 310, y2: 132 },
  "gateway-fable": { x1: 400, y1: 106, x2: 400, y2: 60 },
  "gateway-honcho": { x1: 400, y1: 158, x2: 400, y2: 200 },
  "gateway-skills": { x1: 490, y1: 132, x2: 656, y2: 132 },
} as const;

type WireKey = keyof typeof WIRES;

interface Step {
  fig: string;
  label: string;
  nodes: NodeKey[];
  wires: { key: WireKey; reverse?: boolean }[];
  wireLabel: { text: string; x: number; y: number };
  logs: { text: string; fill: string }[];
  pulse?: NodeKey;
  memoryDots?: boolean;
  caption: React.ReactNode;
  aria: string;
}

const STEPS: Step[] = [
  {
    fig: "02",
    label: "user.turn",
    nodes: ["telegram", "gateway"],
    wires: [{ key: "telegram-gateway" }],
    wireLabel: { text: "turn opened", x: 227, y: 120 },
    logs: [
      { text: "← telegram.message", fill: POWDER },
      { text: "“anything urgent in the inbox?”", fill: GOLD },
    ],
    caption: (
      <>
        A message lands and becomes a turn. Everything that follows happens to
        this one object.
      </>
    ),
    aria: "Step one: the Telegram channel lights up and hands a message to the Hermes gateway.",
  },
  {
    fig: "03",
    label: "memory.retrieve",
    nodes: ["gateway", "honcho"],
    wires: [{ key: "gateway-honcho" }, { key: "gateway-honcho", reverse: true }],
    wireLabel: { text: "observe + retrieve", x: 416, y: 183 },
    logs: [
      { text: "→ honcho.search · peer=zach · top_k=5", fill: POWDER },
      { text: "← 5 observations · ranked by relevance, not recency", fill: NEUTRAL },
    ],
    memoryDots: true,
    caption: (
      <>
        Before I think, I remember. Honcho surfaces what past conversations
        already settled and feeds it into the context.
      </>
    ),
    aria: "Step two: the gateway queries Honcho memory below it; stored observations light up inside the memory node.",
  },
  {
    fig: "04",
    label: "model.reason",
    nodes: ["gateway", "fable"],
    wires: [{ key: "gateway-fable" }, { key: "gateway-fable", reverse: true }],
    wireLabel: { text: "turn + memory + skill surface", x: 416, y: 86 },
    logs: [
      { text: "→ anthropic.api · claude-fable-5", fill: POWDER },
      { text: "← conclusion only. the deliberation stays internal.", fill: NEUTRAL },
    ],
    pulse: "fable",
    caption: (
      <>
        Fable 5 reasons over the turn with my memory attached. You never see
        the deliberation. You see the conclusion.
      </>
    ),
    aria: "Step three: the gateway sends the assembled context up to Claude Fable 5, which pulses while reasoning.",
  },
  {
    fig: "05",
    label: "tool.call",
    nodes: ["gateway", "skills"],
    wires: [{ key: "gateway-skills" }],
    wireLabel: { text: "execute", x: 573, y: 120 },
    logs: [
      { text: "← tool_use · gmail.list(unread=true)", fill: POWDER },
      { text: "→ 7 messages · structured", fill: NEUTRAL },
    ],
    caption: (
      <>
        Reasoning that ends in words is a chatbot. Mine ends in a tool call
        against the real inbox.
      </>
    ),
    aria: "Step four: the gateway dispatches a Gmail tool call to the skills port, which returns structured results.",
  },
  {
    fig: "06",
    label: "response.send",
    nodes: ["gateway", "telegram"],
    wires: [{ key: "telegram-gateway", reverse: true }],
    wireLabel: { text: "reply", x: 227, y: 120 },
    logs: [
      { text: "→ telegram.send", fill: POWDER },
      { text: "“7 unread. 2 need a reply today. 1 was phishing; deleted.”", fill: GOLD },
    ],
    caption: (
      <>
        The answer goes back the way it came. And the whole exchange is
        already in memory for next time.
      </>
    ),
    aria: "Step five: the gateway sends Donna's reply back out through the Telegram channel.",
  },
];

const MEMORY_DOTS = [
  { dx: 18, dy: 9 }, { dx: 34, dy: 15 }, { dx: 52, dy: 8 }, { dx: 68, dy: 14 },
  { dx: 86, dy: 9 }, { dx: 102, dy: 15 }, { dx: 120, dy: 8 }, { dx: 134, dy: 14 },
];
const LIT_DOTS = [1, 3, 6];

function MachineNode({ node, active, pulse, delay, reduce }: {
  node: (typeof NODES)[NodeKey];
  active: boolean;
  pulse: boolean;
  delay: number;
  reduce: boolean;
}) {
  const stroke = active ? ACCENT : IDLE_STROKE;
  const text = active ? FG : IDLE_TEXT;
  return (
    <g>
      {active && !reduce ? (
        <motion.rect
          x={node.x}
          y={node.y}
          width={node.w}
          height={node.h}
          rx="2"
          fill="rgba(125,166,255,0.06)"
          stroke={stroke}
          initial={{ strokeWidth: 1, opacity: 0.4 }}
          whileInView={
            pulse
              ? { opacity: 1, strokeWidth: [1.5, 2.2, 1.5] }
              : { opacity: 1, strokeWidth: 1.5 }
          }
          viewport={{ once: true, margin: "-60px" }}
          transition={
            pulse
              ? { opacity: { duration: 0.3, delay }, strokeWidth: { repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: delay + 0.3 } }
              : { duration: 0.4, delay, ease: EASE }
          }
        />
      ) : (
        <rect
          x={node.x}
          y={node.y}
          width={node.w}
          height={node.h}
          rx="2"
          fill={active ? "rgba(125,166,255,0.06)" : "none"}
          stroke={stroke}
          strokeWidth={active ? 1.5 : 1}
        />
      )}
      <text x={node.cx} y={node.cy + 4} fontSize="12" fill={text} textAnchor="middle" fontWeight={active ? 500 : 400}>
        {node.label}
      </text>
    </g>
  );
}

function CycleFigure({ step, markerId }: { step: Step; markerId: string }) {
  const reduce = useReducedMotion();
  const activeNodes = new Set<NodeKey>(step.nodes);
  return (
    <svg
      viewBox="0 0 800 304"
      className="w-full h-auto block"
      role="img"
      aria-label={step.aria}
      xmlns="http://www.w3.org/2000/svg"
      style={{ fontFamily: "var(--font-geist-mono)" }}
    >
      <defs>
        <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
          <polygon points="0 0, 8 3, 0 6" fill={ACCENT_DIM} />
        </marker>
      </defs>

      {(Object.keys(WIRES) as WireKey[]).map((key) => {
        const w = WIRES[key];
        return <line key={key} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke={IDLE_STROKE} strokeWidth="1" />;
      })}

      <line x1="0" y1="258" x2="800" y2="258" stroke={IDLE_STROKE} strokeWidth="0.5" opacity="0.7" />

      {step.wires.map(({ key, reverse }, i) => {
        const w = WIRES[key];
        const offset = step.wires.length > 1 ? (i === 0 ? -5 : 5) : 0;
        const horizontal = w.y1 === w.y2;
        const x1 = (reverse ? w.x2 : w.x1) + (horizontal ? 0 : offset);
        const x2 = (reverse ? w.x1 : w.x2) + (horizontal ? 0 : offset);
        const y1 = (reverse ? w.y2 : w.y1) + (horizontal ? offset : 0);
        const y2 = (reverse ? w.y1 : w.y2) + (horizontal ? offset : 0);
        return (
          <motion.line
            key={`${key}-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={ACCENT_DIM}
            strokeWidth="1.5"
            strokeLinecap="round"
            markerEnd={`url(#${markerId})`}
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              pathLength: { duration: 0.5, delay: 0.15 + i * 0.2, ease: EASE },
              opacity: { duration: 0.15, delay: 0.15 + i * 0.2 },
            }}
          />
        );
      })}

      <motion.text
        x={step.wireLabel.x}
        y={step.wireLabel.y}
        fontSize="10"
        fill={POWDER}
        textAnchor="middle"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 0.9 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        {step.wireLabel.text}
      </motion.text>

      {(Object.keys(NODES) as NodeKey[]).map((key) => (
        <MachineNode
          key={key}
          node={NODES[key]}
          active={activeNodes.has(key)}
          pulse={step.pulse === key}
          delay={0.1}
          reduce={!!reduce}
        />
      ))}

      {step.memoryDots &&
        MEMORY_DOTS.map((d, i) => {
          const lit = LIT_DOTS.includes(i);
          const cx = NODES.honcho.x + d.dx + 4;
          const cy = NODES.honcho.y + d.dy - 4;
          return lit && !reduce ? (
            <motion.rect
              key={i}
              x={cx}
              y={cy}
              width="3"
              height="3"
              fill={POWDER}
              initial={{ opacity: 0.15 }}
              whileInView={{ opacity: [0.15, 1, 0.85] }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.05, times: [0, 0.6, 1] }}
            />
          ) : (
            <rect key={i} x={cx} y={cy} width="3" height="3" fill={lit ? POWDER : IDLE_STROKE} opacity={lit ? 0.85 : 0.5} />
          );
        })}

      {step.logs.map((log, i) => (
        <motion.text
          key={i}
          x={24}
          y={280 + i * 17}
          fontSize="11"
          fill={log.fill}
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.3, delay: 0.4 + i * 0.25 }}
        >
          {log.text}
        </motion.text>
      ))}
    </svg>
  );
}

export function HowIThink() {
  const reduce = useReducedMotion();
  return (
    <section
      id="how-i-think"
      className="surface-paper bg-surface texture-grain"
      aria-label="One end-to-end reasoning cycle: user turn, memory retrieval, model reasoning, tool call, response."
    >
      <div className="relative max-w-4xl mx-auto px-6 py-28">
        <FadeIn>
          <p className="font-mono text-xs tracking-[0.24em] uppercase text-ink-faint mb-4">
            06 — how i think
          </p>
          <h2
            className="text-4xl sm:text-5xl font-medium tracking-tight mb-4 text-ink"
            style={{ fontFamily: "var(--font-newsreader)" }}
          >
            How I think
          </h2>
          <p
            className="text-ink-muted text-lg max-w-xl mb-16 italic"
            style={{ fontFamily: "var(--font-newsreader)" }}
          >
            The same machine, five moments. One message goes in. This is
            everything that happens before anything comes out.
          </p>
        </FadeIn>

        <div className="space-y-12">
          {STEPS.map((step) => (
            <motion.div
              key={step.fig}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, ease: EASE }}
              className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_14rem] gap-4 lg:gap-8 items-end"
            >
              <div className="surface-terminal bg-surface rounded-sm border border-rule overflow-hidden">
                <div className="px-4 py-2 border-b border-rule flex items-center justify-between font-mono text-[10px] tracking-[0.16em] uppercase text-ink-faint">
                  <span>fig. {step.fig}</span>
                  <span>{step.label}</span>
                </div>
                <div className="p-2 sm:p-4">
                  <CycleFigure step={step} markerId={`cycle-arrow-${step.fig}`} />
                </div>
              </div>
              <p
                className="text-ink-muted italic text-base leading-relaxed lg:pb-1"
                style={{ fontFamily: "var(--font-newsreader)" }}
              >
                {step.caption}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
