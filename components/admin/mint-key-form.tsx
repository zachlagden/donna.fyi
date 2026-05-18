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
    <div className="rounded-lg border border-zinc-800/60 p-5 space-y-3">
      <p className="text-sm text-zinc-300 font-semibold">Mint a new key</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          name="name"
          required
          placeholder="Donna, Hetzner box"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 placeholder-zinc-600"
        />
        <select
          name="author_tag"
          value={authorTag}
          onChange={(e) => setAuthorTag(e.target.value as "donna" | "zach")}
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
        >
          <option value="donna">Donna</option>
          <option value="zach">Zach</option>
        </select>
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="px-4 py-2 rounded bg-violet-500/20 border border-violet-500/40 text-violet-200 text-sm hover:bg-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Minting…" : "Mint"}
        </button>
      </form>
      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          Mint failed: {error}
        </div>
      )}
      {result && (
        <div className="rounded-md border border-violet-500/30 bg-violet-500/5 px-3 py-3 space-y-2">
          <p className="text-xs text-violet-200 font-semibold">
            Copy this now. It will not be shown again.
          </p>
          <code className="block break-all font-mono text-xs text-zinc-100 bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5">
            {result.plaintext_key}
          </code>
        </div>
      )}
    </div>
  );
}
