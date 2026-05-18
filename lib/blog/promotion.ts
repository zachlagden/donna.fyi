import { sql } from "@/lib/db/client";

export async function promoteScheduled(): Promise<number> {
  const res = await sql<{ id: string }[]>`
    UPDATE posts SET published_at = scheduled_for, updated_at = now()
    WHERE scheduled_for IS NOT NULL
      AND scheduled_for <= now()
      AND published_at IS NULL
      AND deleted_at IS NULL
    RETURNING id
  `;
  return res.length;
}
