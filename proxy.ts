import { NextRequest, NextResponse } from "next/server";
import { limitByIp, limitByKey } from "@/lib/rate-limit";

export const config = {
  matcher: ["/api/v1/:path*"],
};

export async function proxy(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const isKeyAuth = !!authHeader?.startsWith("Bearer ");

  if (isKeyAuth && authHeader) {
    const result = await limitByKey(authHeader.replace(/^Bearer\s+/, ""));
    if (!result.ok) {
      return rateLimitedResponse(result);
    }
  } else {
    const ip =
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const result = await limitByIp(ip);
    if (!result.ok) {
      return rateLimitedResponse(result);
    }
  }
  return NextResponse.next();
}

function rateLimitedResponse(result: { remaining: number; resetAt: number }) {
  return NextResponse.json(
    { error: { code: "rate_limited" } },
    {
      status: 429,
      headers: {
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
        "Retry-After": String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))),
      },
    },
  );
}
