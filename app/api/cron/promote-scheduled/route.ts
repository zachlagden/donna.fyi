import { NextRequest, NextResponse } from "next/server";
import { promoteScheduled } from "@/lib/blog/promotion";
import { regenerateFeeds } from "@/lib/blog/feeds/regenerate";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  }
  const count = await promoteScheduled();
  if (count > 0) regenerateFeeds().catch(() => {});
  return NextResponse.json({ promoted: count });
}
