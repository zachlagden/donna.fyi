"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface MintResult {
  id: string;
  name: string;
  author_tag: "donna" | "zach";
  key_prefix: string;
  plaintext_key: string;
  created_at: string;
}

export function MintKeyForm() {
  const [name, setName] = useState("");
  const [authorTag, setAuthorTag] = useState<"donna" | "zach">("donna");
  const [result, setResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await fetch("/api/v1/me/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, author_tag: authorTag }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json?.error?.code ?? `HTTP ${res.status}`);
        return;
      }
      const json: MintResult = await res.json();
      setResult(json);
      setName("");
      router.refresh();
    });
  }

  return (
    <div className="rounded-sm border border-rule p-5 space-y-3">
      <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-faint">Mint a new key</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          name="name"
          required
          placeholder="Donna, Hetzner box"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-panel border border-rule rounded-sm px-3 py-2 text-ink placeholder:text-ink-faint focus:border-rule-strong focus:outline-none"
        />
        <select
          name="author_tag"
          value={authorTag}
          onChange={(e) => setAuthorTag(e.target.value as "donna" | "zach")}
          className="w-full bg-panel border border-rule rounded-sm px-3 py-2 text-ink focus:border-rule-strong focus:outline-none"
        >
          <option value="donna">Donna</option>
          <option value="zach">Zach</option>
        </select>
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="px-4 py-2 rounded-sm bg-cobalt-bright/15 border border-cobalt-bright/40 text-cobalt-bright text-sm hover:bg-cobalt-bright/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isPending ? "Minting…" : "Mint"}
        </button>
      </form>
      {error && (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Mint failed: {error}
        </div>
      )}
      {result && (
        <div className="rounded-sm border border-gold/40 bg-gold/5 px-3 py-3 space-y-2">
          <p className="font-mono text-xs text-gold">
            Copy this now. It will not be shown again.
          </p>
          <code className="block break-all font-mono text-xs text-ink bg-panel border border-rule rounded-sm px-2 py-1.5">
            {result.plaintext_key}
          </code>
        </div>
      )}
    </div>
  );
}
