import { promoteScheduled } from "@/lib/blog/promotion";
import { regenerateFeeds } from "@/lib/blog/feeds/regenerate";
import { getDb } from "@/lib/db/client";

async function main() {
  try {
    const n = await promoteScheduled();
    console.log(`promoted ${n} scheduled posts`);
    if (n > 0) await regenerateFeeds();
  } finally {
    await getDb().end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
