import { requireSession } from "@/lib/auth/session";
import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { MintKeyForm } from "@/components/admin/mint-key-form";

interface KeyRow {
  id: string;
  name: string;
  author_tag: "donna" | "zach";
  key_prefix: string;
  created_at: Date;
  last_used_at: Date | null;
  revoked_at: Date | null;
}

async function revokeAction(formData: FormData) {
  "use server";
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await sql`UPDATE api_keys SET revoked_at = now() WHERE id = ${id} AND revoked_at IS NULL`;
  revalidatePath("/admin/keys");
}

export default async function KeysPage() {
  await requireSession();
  const keys = await sql<KeyRow[]>`
    SELECT id, name, author_tag, key_prefix, created_at, last_used_at, revoked_at
    FROM api_keys ORDER BY created_at DESC
  `;

  return (
    <main className="max-w-3xl mx-auto px-6 pt-32 pb-32">
      <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-faint mb-3">
        donna.fyi · admin · keys
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-ink mb-2">
        API keys
      </h1>
      <p className="text-ink-muted mb-10 text-sm">The only &ldquo;admin&rdquo; surface. Mint, list, revoke.</p>

      <MintKeyForm />

      <ul className="space-y-2 mt-10">
        {keys.map((k) => (
          <li key={k.id} className="rounded-sm border border-rule p-4 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className={`mt-1.5 h-2 w-2 shrink-0 ${k.revoked_at ? "bg-gold/70" : "bg-cobalt-bright"}`}
              />
              <div>
                <p className="text-sm text-ink font-medium">{k.name}</p>
                <p className="text-xs text-ink-muted font-mono mt-1">
                  {k.key_prefix}&hellip; &middot; {k.author_tag} &middot; {new Date(k.created_at).toLocaleDateString()}
                  {k.revoked_at && <span className="text-gold ml-2">revoked</span>}
                </p>
              </div>
            </div>
            {!k.revoked_at && (
              <form action={revokeAction}>
                <input type="hidden" name="id" value={k.id} />
                <button type="submit" className="font-mono text-xs uppercase tracking-wider text-ink-muted hover:text-destructive transition-colors cursor-pointer">Revoke</button>
              </form>
            )}
          </li>
        ))}
      </ul>

      <p className="font-mono text-xs text-gold/80 mt-12">
        Plaintext keys are shown exactly once when minted. Copy them immediately, there is no recovery.
      </p>
    </main>
  );
}
