import { NextRequest, NextResponse } from "next/server";
import { ipLimiter, keyLimiter } from "@/lib/rate-limit";

export const config = {
  matcher: ["/api/v1/:path*"],
};

export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const isKeyAuth = !!authHeader?.startsWith("Bearer ");

  if (isKeyAuth && keyLimiter && authHeader) {
    const key = authHeader.slice(0, 32);
    const r = await keyLimiter.limit(key);
    if (!r.success) {
      return NextResponse.json({ error: { code: "rate_limited" } }, { status: 429 });
    }
  } else if (ipLimiter) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const r = await ipLimiter.limit(ip);
    if (!r.success) {
      return NextResponse.json({ error: { code: "rate_limited" } }, { status: 429 });
    }
  }
  return NextResponse.next();
}
