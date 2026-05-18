import { runMigrations } from "@/lib/db/migrate";
import { sql } from "@/lib/db/client";

async function main() {
  try {
    await runMigrations();
    console.log("✓ migrations complete");
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
