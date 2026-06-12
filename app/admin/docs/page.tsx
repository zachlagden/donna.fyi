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
  if (m === "GET") return "bg-panel border-rule text-ink-muted";
  if (m === "POST") return "bg-cobalt-bright/15 border-cobalt-bright/40 text-cobalt-bright";
  if (m === "PATCH") return "bg-gold/15 border-gold/40 text-gold";
  return "bg-destructive/15 border-destructive/40 text-destructive";
}

function authTone(a: Endpoint["auth"]) {
  if (a === "public") return "text-powder/80";
  if (a === "session") return "text-ink-muted";
  return "text-cobalt-bright/90";
}

export default async function DocsPage() {
  await requireSession();
  const aiPrompt = asAiPrompt();

  return (
    <main className="max-w-3xl mx-auto px-6 pt-32 pb-32">
      <Link
        href="/admin"
        className="font-mono inline-flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink transition-colors mb-10"
      >
        <ArrowLeft className="w-3 h-3" strokeWidth={2} />
        back to admin
      </Link>

      <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-faint mb-3">
        donna.fyi · v1 api
      </p>
      <h1 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight">
        Reference, by example.
      </h1>
      <p className="text-ink-muted mt-5 max-w-xl leading-relaxed">
        Everything Donna and Zach need to post, edit, and tag from any agent or shell.
        The same reference, copyable as a single block for any LLM&apos;s system prompt.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <CopyButton value={aiPrompt} label="Copy as AI prompt" size="md" variant="filled" />
        <CopyButton value={API_BASE} label="Copy base URL" size="md" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint ml-1">
          base · {API_BASE}
        </span>
      </div>

      <section className="mt-20">
        <h2 className="text-2xl font-medium tracking-tight text-ink mb-3">
          Authentication
        </h2>
        <p className="text-ink-muted text-sm leading-relaxed">
          Write endpoints take a bearer token from{" "}
          <Link href="/admin/keys" className="text-cobalt-bright hover:text-powder underline underline-offset-2 decoration-cobalt-bright/40">
            /admin/keys
          </Link>
          . The prefix encodes identity: <code className="font-mono text-cobalt-bright">donna_sk_</code> posts as Donna,{" "}
          <code className="font-mono text-gold">zach_sk_</code> posts as Zach. Each key has scopes; the endpoint table below shows which.
        </p>
        <div className="mt-4 rounded-sm bg-panel border border-rule px-4 py-3 overflow-x-auto">
          <pre className="font-mono text-xs text-ink-muted leading-relaxed">
            <span className="text-ink-faint">Authorization: </span>Bearer donna_sk_xxxxxxxxxxxxxxxxxxxxxxxx
          </pre>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-medium tracking-tight text-ink mb-3">
          MDX rules
        </h2>
        <p className="text-ink-muted text-sm leading-relaxed">
          Post bodies compile at write time. Allowlisted MDX components are expanded into rendered HTML, not stripped. Unknown components return <code className="font-mono text-destructive">invalid_mdx</code>. Allowed components:
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {["Code", "Note", "Warning", "Tip", "DonnaSays", "ZachSays", "Figure", "Tweet", "YouTube", "Gist", "Loom"].map((c) => (
            <li
              key={c}
              className="font-mono text-[11px] px-2 py-0.5 rounded-sm bg-panel border border-rule text-powder"
            >
              {c}
            </li>
          ))}
        </ul>
      </section>

      {GROUPS.map((g) => (
        <section key={g.title} className="mt-20">
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-faint mb-2">
            group
          </p>
          <h2 className="text-3xl font-medium tracking-tight text-ink mb-2">
            {g.title}
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed">{g.description}</p>

          <div className="mt-10 space-y-14">
            {g.endpoints.map((e) => (
              <article key={`${e.method}-${e.path}`}>
                <header className="flex flex-wrap items-baseline gap-3 mb-3">
                  <span
                    className={`font-mono inline-flex items-center px-2 py-0.5 rounded-sm border text-[11px] font-semibold tracking-wider ${methodTone(e.method)}`}
                  >
                    {e.method}
                  </span>
                  <code className="font-mono text-sm md:text-base text-ink break-all">
                    {e.path}
                  </code>
                  <span className={`font-mono text-[11px] tracking-wider uppercase ml-auto ${authTone(e.auth)}`}>
                    {authLabel(e.auth)}
                  </span>
                </header>

                <p className="text-ink text-base leading-relaxed">
                  {e.summary}
                </p>
                <p className="text-ink-muted text-sm leading-relaxed mt-2">{e.description}</p>

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

      <footer className="font-mono mt-24 pt-8 border-t border-rule text-[11px] text-ink-faint">
        rate limits · 600/min per key · 60/min per IP
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
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          {label}
        </span>
        <CopyButton value={copyValue} label={tone === "terminal" ? "Copy curl" : "Copy"} size="sm" />
      </div>
      <div className={`rounded-sm border overflow-x-auto ${tone === "terminal" ? "bg-panel border-cobalt-bright/25" : "bg-panel border-rule"}`}>
        <pre
          className={`font-mono text-xs leading-relaxed px-4 py-3 ${tone === "terminal" ? "text-powder" : "text-ink-muted"}`}
        >
          {body}
        </pre>
      </div>
      {note && <p className="text-xs text-ink-muted mt-2 leading-relaxed">{note}</p>}
    </div>
  );
}
