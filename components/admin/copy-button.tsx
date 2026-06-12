"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface Props {
  value: string;
  label?: string;
  size?: "sm" | "md";
  variant?: "ghost" | "filled";
}

export function CopyButton({ value, label = "Copy", size = "sm", variant = "ghost" }: Props) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  const base =
    "inline-flex items-center gap-1.5 rounded-sm font-mono uppercase tracking-wider transition-all duration-200 active:scale-[0.97] cursor-pointer";
  const sizing = size === "sm" ? "text-[10px] px-2 py-1" : "text-xs px-3 py-1.5";
  const styles =
    variant === "filled"
      ? "bg-cobalt-bright/15 border border-cobalt-bright/40 text-cobalt-bright hover:bg-cobalt-bright/25 hover:border-cobalt-bright/60"
      : "bg-panel border border-rule text-ink-muted hover:text-ink hover:border-rule-strong";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${sizing} ${styles}`}
      aria-label={copied ? "Copied" : label}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" strokeWidth={2.4} />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" strokeWidth={2} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
