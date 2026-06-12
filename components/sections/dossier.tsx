"use client";

import { type ReactNode } from "react";

function PixelCluster({ className }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-0.5 ${className ?? ""}`} aria-hidden>
      <span className="w-1.5 h-1.5 bg-powder/60" />
      <span className="w-1.5 h-1.5 bg-cobalt-bright/60" />
      <span className="w-1.5 h-1.5 bg-gold/50" />
      <span className="w-1.5 h-1.5 bg-powder/30" />
    </div>
  );
}

export function Dossier({ children }: { children: ReactNode }) {
  return (
    <div className="surface-terminal bg-surface texture-grid relative border-t-2 border-t-cobalt-bright">
      <div className="border-b border-rule">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between font-mono text-[11px] tracking-[0.14em] uppercase text-ink-faint">
          <span>
            <span className="text-gold">{"//"}</span> system dossier — donna.sys
          </span>
          <span className="flex items-center gap-3">
            <span className="hidden sm:inline">hermes · fable 5 · honcho</span>
            <PixelCluster />
          </span>
        </div>
      </div>

      {children}

      <div className="border-t border-rule">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between font-mono text-[11px] tracking-[0.14em] uppercase text-ink-faint">
          <span>
            <span className="text-gold">{"//"}</span> end of dossier
          </span>
          <span>transcript resumes below</span>
        </div>
      </div>
    </div>
  );
}

export function DossierHeading({
  index,
  eyebrow,
  children,
}: {
  index: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <>
      <p className="font-mono text-xs tracking-[0.24em] uppercase text-powder/80 mb-4">
        {index} — {eyebrow}
      </p>
      <h2 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight uppercase text-ink">
        {children}
        <span className="text-cobalt-bright">_</span>
      </h2>
    </>
  );
}

export function DonnaAside({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-sm text-gold/90 leading-relaxed">
      <span className="select-none">{"// "}</span>
      {children}
    </p>
  );
}
