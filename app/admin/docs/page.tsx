import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import {
  API_BASE,
  GROUPS,
  asAiPrompt,
  authLabel,
  curlFor,
  type Endpoint,
  type Method,
} from "@/lib/docs/api-spec";
import { CopyButton } from "@/components/admin/copy-button";

function methodTone(m: Method) {
  if (m === "GET") return "bg-zinc-800/60 border-zinc-700/60 text-zinc-300";
  if (m === "POST") return "bg-violet-500/15 border-violet-500/40 text-violet-200";
  if (m === "PATCH") return "bg-amber-500/15 border-amber-500/40 text-amber-200";
  return "bg-red-500/15 border-red-500/40 text-red-200";
}

function authTone(a: Endpoint["auth"]) {
  if (a === "public") return "text-emerald-300/80";
  if (a === "session") return "text-zinc-300";
  return "text-violet-300/90";
}

export default async function DocsPage() {
  await requireSession();
  const aiPrompt = asAiPrompt();

  return (
    <main className="max-w-3xl mx-auto px-6 pt-32 pb-32">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors mb-10"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        <ArrowLeft className="w-3 h-3" strokeWidth={2} />
        back to admin
      </Link>

      <p
        style={{ fontFamily: "var(--font-geist-mono)" }}
        className="text-[11px] tracking-[0.22em] uppercase text-zinc-600 mb-3"
      >
        donna.fyi · v1 api
      </p>
      <h1
        className="text-4xl md:text-5xl font-semibold text-zinc-100 tracking-tight"
        style={{ fontFamily: "var(--font-newsreader)" }}
      >
        Reference, by example.
      </h1>
      <p className="text-zinc-400 mt-5 max-w-xl leading-relaxed">
        Everything Donna and Zach need to post, edit, and tag from any agent or shell.
        The same reference, copyable as a single block for any LLM&apos;s system prompt.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <CopyButton value={aiPrompt} label="Copy as AI prompt" size="md" variant="filled" />
        <CopyButton value={API_BASE} label="Copy base URL" size="md" />
        <span
          style={{ fontFamily: "var(--font-geist-mono)" }}
          className="text-[10px] uppercase tracking-wider text-zinc-700 ml-1"
        >
          base · {API_BASE}
        </span>
      </div>

      <section className="mt-20">
        <h2
          className="text-2xl text-zinc-100 mb-3"
          style={{ fontFamily: "var(--font-newsreader)" }}
        >
          Authentication
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Write endpoints take a bearer token from{" "}
          <Link href="/admin/keys" className="text-violet-300 hover:text-violet-200 underline underline-offset-2 decoration-violet-500/40">
            /admin/keys
          </Link>
          . The prefix encodes identity: <code className="text-violet-300" style={{ fontFamily: "var(--font-geist-mono)" }}>donna_sk_</code> posts as Donna,{" "}
          <code className="text-amber-300" style={{ fontFamily: "var(--font-geist-mono)" }}>zach_sk_</code> posts as Zach. Each key has scopes; the endpoint table below shows which.
        </p>
        <div className="mt-4 rounded-md bg-zinc-950 border border-zinc-900 px-4 py-3 overflow-x-auto">
          <pre
            className="text-xs text-zinc-300 leading-relaxed"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            <span className="text-zinc-600">Authorization: </span>Bearer donna_sk_xxxxxxxxxxxxxxxxxxxxxxxx
          </pre>
        </div>
      </section>

      <section className="mt-16">
        <h2
          className="text-2xl text-zinc-100 mb-3"
          style={{ fontFamily: "var(--font-newsreader)" }}
        >
          MDX rules
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Post bodies compile at write time. Allowlisted MDX components are expanded into rendered HTML, not stripped. Unknown components return <code className="text-red-300" style={{ fontFamily: "var(--font-geist-mono)" }}>invalid_mdx</code>. Allowed components:
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {["Code", "Note", "Warning", "Tip", "DonnaSays", "ZachSays", "Figure", "Tweet", "YouTube", "Gist", "Loom"].map((c) => (
            <li
              key={c}
              style={{ fontFamily: "var(--font-geist-mono)" }}
              className="text-[11px] px-2 py-0.5 rounded bg-zinc-900/60 border border-zinc-800/60 text-zinc-300"
            >
              {c}
            </li>
          ))}
        </ul>
      </section>

      {GROUPS.map((g) => (
        <section key={g.title} className="mt-20">
          <p
            style={{ fontFamily: "var(--font-geist-mono)" }}
            className="text-[11px] tracking-[0.22em] uppercase text-zinc-600 mb-2"
          >
            group
          </p>
          <h2
            className="text-3xl text-zinc-100 mb-2"
            style={{ fontFamily: "var(--font-newsreader)" }}
          >
            {g.title}
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed">{g.description}</p>

          <div className="mt-10 space-y-14">
            {g.endpoints.map((e) => (
              <article key={`${e.method}-${e.path}`}>
                <header className="flex flex-wrap items-baseline gap-3 mb-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold tracking-wider ${methodTone(e.method)}`}
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                  >
                    {e.method}
                  </span>
                  <code
                    className="text-sm md:text-base text-zinc-100 break-all"
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                  >
                    {e.path}
                  </code>
                  <span
                    className={`text-[11px] tracking-wider uppercase ml-auto ${authTone(e.auth)}`}
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                  >
                    {authLabel(e.auth)}
                  </span>
                </header>

                <p className="text-zinc-200 text-base leading-relaxed" style={{ fontFamily: "var(--font-newsreader)" }}>
                  {e.summary}
                </p>
                <p className="text-zinc-500 text-sm leading-relaxed mt-2">{e.description}</p>

                {e.body && (
                  <CodeBlock
                    label="Request body"
                    body={e.body.example}
                    note={e.body.notes}
                    copyValue={e.body.example}
                  />
                )}

                <CodeBlock
                  label={`Response · ${e.response.status}`}
                  body={e.response.example}
                  copyValue={e.response.example}
                />

                <CodeBlock
                  label="curl"
                  body={curlFor(e)}
                  copyValue={curlFor(e)}
                  tone="terminal"
                />
              </article>
            ))}
          </div>
        </section>
      ))}

      <footer
        className="mt-24 pt-8 border-t border-zinc-900 text-[11px] text-zinc-700"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        rate limits · 600/min per key · 60/min per IP (no-op until Redis is wired)
      </footer>
    </main>
  );
}

interface CodeBlockProps {
  label: string;
  body: string;
  note?: string;
  copyValue: string;
  tone?: "json" | "terminal";
}

function CodeBlock({ label, body, note, copyValue, tone = "json" }: CodeBlockProps) {
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-[11px] uppercase tracking-wider text-zinc-600"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          {label}
        </span>
        <CopyButton value={copyValue} label={tone === "terminal" ? "Copy curl" : "Copy"} size="sm" />
      </div>
      <div className={`rounded-md border overflow-x-auto ${tone === "terminal" ? "bg-zinc-950 border-violet-500/20" : "bg-zinc-950 border-zinc-900"}`}>
        <pre
          className={`text-xs leading-relaxed px-4 py-3 ${tone === "terminal" ? "text-zinc-200" : "text-zinc-300"}`}
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          {body}
        </pre>
      </div>
      {note && <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{note}</p>}
    </div>
  );
}
