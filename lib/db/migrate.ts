import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { sql } from "./client";

export async function runMigrations(): Promise<void> {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const applied = await sql<{ version: string }[]>`SELECT version FROM schema_migrations`;
  const appliedSet = new Set(applied.map((r) => r.version));

  const dir = join(process.cwd(), "lib/db/migrations");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    const version = file.replace(/\.sql$/, "");
    if (appliedSet.has(version)) {
      console.log(`skip ${version} (already applied)`);
      continue;
    }
    const body = readFileSync(join(dir, file), "utf-8");
    console.log(`applying ${version}…`);
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`INSERT INTO schema_migrations (version) VALUES (${version})`;
    });
    console.log(`✓ ${version}`);
  }
}
