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
      <h1 className="text-3xl font-bold text-zinc-100 mb-2" style={{ fontFamily: "var(--font-newsreader)" }}>
        API keys
      </h1>
      <p className="text-zinc-500 mb-10 text-sm">The only &ldquo;admin&rdquo; surface. Mint, list, revoke.</p>

      <MintKeyForm />

      <ul className="space-y-2 mt-10">
        {keys.map((k) => (
          <li key={k.id} className="rounded-lg border border-zinc-800/60 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-200 font-medium">{k.name}</p>
              <p className="text-xs text-zinc-500 font-mono mt-1">
                {k.key_prefix}&hellip; &middot; {k.author_tag} &middot; {new Date(k.created_at).toLocaleDateString()}
                {k.revoked_at && <span className="text-amber-400 ml-2">revoked</span>}
              </p>
            </div>
            {!k.revoked_at && (
              <form action={revokeAction}>
                <input type="hidden" name="id" value={k.id} />
                <button type="submit" className="text-xs text-zinc-400 hover:text-red-300 transition-colors">Revoke</button>
              </form>
            )}
          </li>
        ))}
      </ul>

      <p className="text-xs text-zinc-600 mt-12 italic">
        Plaintext keys are shown exactly once when minted. Copy them immediately, there is no recovery.
      </p>
    </main>
  );
}
