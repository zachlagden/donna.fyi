"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode } from "react";
import { FadeIn } from "@/components/motion/fade-in";

const VIOLET = "#c4b5fd";
const VIOLET_STRONG = "#a78bfa";
const VIOLET_DIM = "#7c3aed";
const NEUTRAL = "#71717a";
const NEUTRAL_FAINT = "#3f3f46";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const T = {
  step1: 0,
  step2: 0.6,
  step3: 1.4,
  step4: 2.4,
  step5: 3.0,
} as const;

const MEMORY_DOTS: { cx: number; cy: number; r: number; o: number }[] = [
  { cx: 508, cy: 14, r: 1.6, o: 0.18 },
  { cx: 542, cy: 8, r: 1.4, o: 0.24 },
  { cx: 578, cy: 28, r: 1.8, o: 0.16 },
  { cx: 612, cy: 10, r: 1.5, o: 0.22 },
  { cx: 648, cy: 38, r: 1.6, o: 0.18 },
  { cx: 686, cy: 12, r: 1.4, o: 0.26 },
  { cx: 724, cy: 26, r: 1.7, o: 0.2 },
  { cx: 760, cy: 16, r: 1.5, o: 0.22 },
  { cx: 522, cy: 52, r: 1.6, o: 0.2 },
  { cx: 560, cy: 66, r: 1.8, o: 0.16 },
  { cx: 596, cy: 58, r: 1.5, o: 0.24 },
  { cx: 632, cy: 76, r: 1.4, o: 0.18 },
  { cx: 670, cy: 60, r: 1.7, o: 0.22 },
  { cx: 708, cy: 72, r: 1.6, o: 0.2 },
  { cx: 744, cy: 64, r: 1.5, o: 0.24 },
  { cx: 778, cy: 50, r: 1.4, o: 0.18 },
  { cx: 514, cy: 96, r: 1.7, o: 0.22 },
  { cx: 550, cy: 110, r: 1.5, o: 0.18 },
  { cx: 588, cy: 102, r: 1.6, o: 0.24 },
  { cx: 624, cy: 118, r: 1.4, o: 0.16 },
  { cx: 660, cy: 108, r: 1.8, o: 0.2 },
  { cx: 698, cy: 116, r: 1.5, o: 0.22 },
  { cx: 736, cy: 102, r: 1.6, o: 0.18 },
  { cx: 770, cy: 114, r: 1.4, o: 0.24 },
];

const ILLUMINATED_INDICES = [3, 9, 14, 18, 21];

const REASONING_CENTER = { x: 360, y: 60 };

interface StepProps {
  number: string;
  label: string;
  caption: string;
  children: ReactNode;
  delay: number;
  ariaLabel: string;
}

function ReasoningStep({ number, label, caption, children, delay, ariaLabel }: StepProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className="relative pl-16 sm:pl-24"
    >
      <div className="flex items-baseline gap-3 mb-3">
        <span className="font-mono text-xs text-zinc-500 tabular-nums">{number}</span>
        <span className="font-mono text-xs text-zinc-500">{label}</span>
      </div>

      <div className="relative">
        <svg
          viewBox="0 0 800 120"
          className="w-full h-auto block"
          role="img"
          aria-label={ariaLabel}
          xmlns="http://www.w3.org/2000/svg"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          {children}
        </svg>
      </div>

      <p
        className="text-zinc-400 italic text-base sm:text-[1.05rem] leading-relaxed max-w-2xl mt-4"
        style={{ fontFamily: "var(--font-newsreader)" }}
      >
        {caption}
      </p>
    </motion.div>
  );
}

function Step1UserTurn() {
  const reduce = useReducedMotion();
  const start = T.step1;
  return (
    <ReasoningStep
      number="01"
      label="user.turn"
      delay={start}
      caption="The cycle begins. A message arrives over Telegram and enters the gateway as a turn."
      ariaLabel="Step one: a user message arrives in a Telegram-style bubble from the left."
    >
      <defs>
        <marker
          id="hit-arrow-neutral"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 8 3, 0 6" fill={NEUTRAL} />
        </marker>
      </defs>

      <motion.g
        initial={reduce ? false : { opacity: 0, x: -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: start + 0.1, ease: EASE }}
      >
        <rect
          x="20"
          y="22"
          width="380"
          height="76"
          rx="14"
          fill="rgba(39,39,42,0.5)"
          stroke={NEUTRAL_FAINT}
          strokeWidth="1"
        />
        <path
          d="M 20 76 L 14 90 L 28 86 Z"
          fill="rgba(39,39,42,0.5)"
          stroke={NEUTRAL_FAINT}
          strokeWidth="1"
        />
        <text x="42" y="52" fontSize="11" fill={NEUTRAL} opacity="0.7">
          you
        </text>
        <text x="42" y="80" fontSize="13" fill="#d4d4d8">
          anything urgent in the inbox?
        </text>
      </motion.g>

      <motion.line
        x1={415}
        y1={60}
        x2={520}
        y2={60}
        stroke={NEUTRAL}
        strokeWidth="1.25"
        strokeLinecap="round"
        markerEnd="url(#hit-arrow-neutral)"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{
          pathLength: { duration: 0.6, delay: start + 0.55, ease: EASE },
          opacity: { duration: 0.2, delay: start + 0.55 },
        }}
      />

      <motion.text
        x={780}
        y={64}
        fontSize="10"
        fill={NEUTRAL}
        textAnchor="end"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 0.7 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.3, delay: start + 1.05 }}
      >
        gateway.in
      </motion.text>
    </ReasoningStep>
  );
}

function Step2MemoryRetrieve() {
  const reduce = useReducedMotion();
  const start = T.step2;
  return (
    <ReasoningStep
      number="02"
      label="memory.retrieve"
      delay={start}
      caption="Honcho is queried. A handful of past observations light up and feed into the reasoning context."
      ariaLabel="Step two: scattered memory dots illuminate and converge toward the centre, representing semantic retrieval from Honcho."
    >
      <motion.text
        x={20}
        y={20}
        fontSize="10"
        fill={NEUTRAL}
        opacity="0.7"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 0.7 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4, delay: start + 0.1 }}
      >
        honcho.search
      </motion.text>
      <motion.text
        x={20}
        y={36}
        fontSize="9"
        fill={NEUTRAL}
        opacity="0.5"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 0.5 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4, delay: start + 0.2 }}
      >
        peer=zach · top_k=5
      </motion.text>

      <motion.g
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4, delay: start + 0.1 }}
      >
        <rect
          x="478"
          y="0"
          width="316"
          height="120"
          rx="8"
          fill="none"
          stroke={NEUTRAL_FAINT}
          strokeDasharray="2 4"
          strokeWidth="1"
          opacity="0.5"
        />
        <text x="494" y="14" fontSize="9" fill={NEUTRAL} opacity="0.5">
          memory field
        </text>
      </motion.g>

      {MEMORY_DOTS.map((dot, i) => {
        const illuminated = ILLUMINATED_INDICES.includes(i);
        return (
          <motion.circle
            key={i}
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            fill={illuminated ? VIOLET : NEUTRAL}
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{
              opacity: illuminated ? [0, dot.o, 0.9] : dot.o,
              r: illuminated ? [dot.r, dot.r, dot.r * 1.4] : dot.r,
            }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              opacity: illuminated
                ? {
                    duration: 1.2,
                    delay: start + 0.4,
                    times: [0, 0.4, 1],
                    ease: EASE,
                  }
                : { duration: 0.5, delay: start + 0.3 + (i % 6) * 0.04 },
              r: illuminated
                ? { duration: 1.2, delay: start + 0.4, times: [0, 0.4, 1], ease: EASE }
                : { duration: 0 },
            }}
          />
        );
      })}

      {ILLUMINATED_INDICES.map((idx, i) => {
        const dot = MEMORY_DOTS[idx];
        return (
          <motion.line
            key={`conn-${i}`}
            x1={dot.cx}
            y1={dot.cy}
            x2={440}
            y2={60}
            stroke={VIOLET_DIM}
            strokeWidth="0.75"
            strokeLinecap="round"
            opacity="0.55"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.55 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              pathLength: { duration: 0.7, delay: start + 1.0 + i * 0.06, ease: EASE },
              opacity: { duration: 0.3, delay: start + 1.0 + i * 0.06 },
            }}
          />
        );
      })}

      <motion.circle
        cx={440}
        cy={60}
        r={3}
        fill={VIOLET}
        initial={reduce ? false : { opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4, delay: start + 1.55, ease: EASE }}
      />
    </ReasoningStep>
  );
}

function Step3ModelReason() {
  const reduce = useReducedMotion();
  const start = T.step3;
  const pulseDelay = start + 1.2;

  return (
    <ReasoningStep
      number="03"
      label="model.reason"
      delay={start}
      caption="MiniMax M2.7 reasons over the turn plus retrieved context. The chain of thought stays internal; only the conclusion ships."
      ariaLabel="Step three: a central reasoning node with MiniMax thought tokens appearing inside, gently pulsing once revealed."
    >
      <defs>
        <filter id="reason-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <motion.g
        initial={reduce ? false : { opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: start + 0.1, ease: EASE }}
        style={{ transformOrigin: `${REASONING_CENTER.x}px ${REASONING_CENTER.y}px`, transformBox: "fill-box" }}
      >
        <rect
          x="180"
          y="10"
          width="360"
          height="100"
          rx="14"
          fill="none"
          stroke={VIOLET_DIM}
          strokeWidth="1"
          opacity="0.35"
          filter="url(#reason-glow)"
        />
        <rect
          x="190"
          y="20"
          width="340"
          height="80"
          rx="10"
          fill="rgba(124,58,237,0.04)"
          stroke="none"
        />

        {reduce ? (
          <rect
            x="184"
            y="14"
            width="352"
            height="92"
            rx="12"
            fill="none"
            stroke={VIOLET_STRONG}
            strokeWidth="2"
          />
        ) : (
          <motion.rect
            x="184"
            y="14"
            width="352"
            height="92"
            rx="12"
            fill="none"
            stroke={VIOLET_STRONG}
            initial={{ strokeWidth: 2 }}
            animate={{ strokeWidth: [2, 2.5, 2] }}
            transition={{
              repeat: Infinity,
              duration: 2.5,
              ease: "easeInOut",
              delay: pulseDelay,
            }}
          />
        )}
      </motion.g>

      <motion.text
        x={360}
        y={36}
        fontSize="11"
        fill={VIOLET}
        textAnchor="middle"
        fontWeight="500"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4, delay: start + 0.45 }}
      >
        MiniMax M2.7
      </motion.text>

      {[
        { text: "assess.unread", y: 60 },
        { text: "check.priorities", y: 78 },
        { text: "compose.summary", y: 96 },
      ].map((tok, i) => (
        <motion.text
          key={tok.text}
          x={360}
          y={tok.y}
          fontSize="11"
          fill="#d4d4d8"
          textAnchor="middle"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.35, delay: start + 0.7 + i * 0.18 }}
        >
          {tok.text}
        </motion.text>
      ))}
    </ReasoningStep>
  );
}

function Step4ToolCall() {
  const reduce = useReducedMotion();
  const start = T.step4;
  return (
    <ReasoningStep
      number="04"
      label="tool.call"
      delay={start}
      caption="The model emits a tool call. The skill executes against the real Gmail account and returns structured data."
      ariaLabel="Step four: a connector reaches from the reasoning node to a tool-call marker, which scales briefly when fired."
    >
      <defs>
        <marker
          id="hit-arrow-violet"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 8 3, 0 6" fill={VIOLET_DIM} />
        </marker>
      </defs>

      <motion.g
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4, delay: start + 0.05 }}
      >
        <circle cx={140} cy={60} r={5} fill={VIOLET} />
        <circle cx={140} cy={60} r={10} fill="none" stroke={VIOLET_DIM} strokeWidth="1" opacity="0.4" />
        <text x={140} y={88} fontSize="10" fill={NEUTRAL} textAnchor="middle" opacity="0.7">
          model
        </text>
      </motion.g>

      <motion.line
        x1={150}
        y1={60}
        x2={480}
        y2={60}
        stroke={VIOLET_DIM}
        strokeWidth="1.25"
        strokeLinecap="round"
        markerEnd="url(#hit-arrow-violet)"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{
          pathLength: { duration: 0.7, delay: start + 0.2, ease: EASE },
          opacity: { duration: 0.2, delay: start + 0.2 },
        }}
      />

      <motion.text
        x={315}
        y={52}
        fontSize="10"
        fill={NEUTRAL}
        textAnchor="middle"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 0.8 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.3, delay: start + 0.75 }}
      >
        tool_use
      </motion.text>

      <motion.g
        initial={reduce ? false : { opacity: 0, scale: 0.9 }}
        whileInView={{
          opacity: 1,
          scale: [0.9, 1, 1.05, 1],
        }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{
          opacity: { duration: 0.3, delay: start + 0.9 },
          scale: {
            duration: 0.9,
            delay: start + 0.9,
            times: [0, 0.4, 0.7, 1],
            ease: EASE,
          },
        }}
        style={{ transformOrigin: "620px 60px", transformBox: "fill-box" }}
      >
        <rect
          x="494"
          y="36"
          width="252"
          height="50"
          rx="6"
          fill="rgba(124,58,237,0.06)"
          stroke={VIOLET_STRONG}
          strokeWidth="1.25"
        />
        <text x={620} y={66} fontSize="12" fill={VIOLET} textAnchor="middle" fontWeight="500">
          gmail.list(unread=true)
        </text>
      </motion.g>

      <motion.text
        x={620}
        y={106}
        fontSize="10"
        fill={NEUTRAL}
        textAnchor="middle"
        opacity="0.7"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 0.7 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.3, delay: start + 1.25 }}
      >
        → 7 messages
      </motion.text>
    </ReasoningStep>
  );
}

function Step5ResponseSend() {
  const reduce = useReducedMotion();
  const start = T.step5;
  return (
    <ReasoningStep
      number="05"
      label="response.send"
      delay={start}
      caption="A response goes back to Telegram. The cycle closes. The next message will start it again, with this turn now in memory."
      ariaLabel="Step five: a Donna response bubble exits to the left toward the user channel."
    >
      <defs>
        <marker
          id="hit-arrow-violet-rev"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 8 3, 0 6" fill={VIOLET_DIM} />
        </marker>
      </defs>

      <motion.text
        x={780}
        y={20}
        fontSize="10"
        fill={NEUTRAL}
        textAnchor="end"
        opacity="0.7"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 0.7 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.3, delay: start + 0.1 }}
      >
        gateway.out
      </motion.text>

      <motion.line
        x1={680}
        y1={60}
        x2={440}
        y2={60}
        stroke={VIOLET_DIM}
        strokeWidth="1.25"
        strokeLinecap="round"
        markerEnd="url(#hit-arrow-violet-rev)"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{
          pathLength: { duration: 0.55, delay: start + 0.2, ease: EASE },
          opacity: { duration: 0.2, delay: start + 0.2 },
        }}
      />

      <motion.g
        initial={reduce ? false : { opacity: 0, x: 80 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, delay: start + 0.55, ease: EASE }}
      >
        <rect
          x="20"
          y="14"
          width="420"
          height="92"
          rx="14"
          fill="rgba(124,58,237,0.08)"
          stroke={VIOLET_STRONG}
          strokeOpacity="0.5"
          strokeWidth="1"
        />
        <path
          d="M 440 52 L 452 60 L 440 68 Z"
          fill="rgba(124,58,237,0.08)"
          stroke={VIOLET_STRONG}
          strokeOpacity="0.5"
          strokeWidth="1"
        />
        <text x="42" y="44" fontSize="11" fill={VIOLET} opacity="0.8">
          donna
        </text>
        <text x="42" y="70" fontSize="12" fill="#e4e4e7">
          7 unread. 2 need a reply today.
        </text>
        <text x="42" y="92" fontSize="12" fill="#e4e4e7">
          4 can wait. 1 was phishing; deleted.
        </text>
      </motion.g>
    </ReasoningStep>
  );
}

export function HowIThink() {
  return (
    <section
      id="how-i-think"
      className="relative max-w-4xl mx-auto px-6 py-32"
      aria-label="One end-to-end reasoning cycle: user turn, memory retrieval, model reasoning, tool call, response."
    >
      <span className="absolute top-6 right-6 text-xs font-mono text-zinc-600 tracking-tight">
        07
      </span>

      <FadeIn mode="dossier">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-zinc-100">
          How I think
        </h2>
        <p
          className="text-zinc-400 text-lg max-w-xl mb-16 italic"
          style={{ fontFamily: "var(--font-newsreader)" }}
        >
          One end-to-end cycle. Message in, response out. Everything between is the work.
        </p>
      </FadeIn>

      <div className="relative">
        <div
          aria-hidden
          className="hidden sm:block absolute top-0 bottom-0 left-[60px] w-px bg-zinc-800/40"
        />

        <div className="space-y-14 sm:space-y-16">
          <Step1UserTurn />
          <Step2MemoryRetrieve />
          <Step3ModelReason />
          <Step4ToolCall />
          <Step5ResponseSend />
        </div>
      </div>
    </section>
  );
}
