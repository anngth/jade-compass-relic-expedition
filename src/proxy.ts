import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session/constants";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

// NOTE: This is an in-memory store and resets on cold starts.
// On serverless deployments with multiple instances (e.g. Vercel) each
// instance maintains its own counter, so the effective limit is
// MAX_REQUESTS * <instance count>. For hard distributed rate limiting,
// replace this with @upstash/ratelimit + @upstash/redis.
const rateLimitStore = new Map<string, number[]>();
const MAX_STORE_KEYS = 5_000;

const PROTECTED_PATHS = new Set([
  "/api/generate-story",
  "/api/test-connection",
]);

function getRateLimitKey(request: NextRequest): string {
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (session) {
    return `session:${session.slice(0, 32)}`;
  }

  return `ip:${
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  }`;
}

function pruneRateLimitStore(): void {
  if (rateLimitStore.size <= MAX_STORE_KEYS) return;
  const now = Date.now();
  for (const [key, timestamps] of rateLimitStore) {
    const recent = timestamps.filter((t) => now - t < WINDOW_MS);
    if (recent.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, recent);
    }
  }
}

function isRateLimited(key: string): boolean {
  pruneRateLimitStore();
  const now = Date.now();
  const recent = (rateLimitStore.get(key) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS
  );

  if (recent.length >= MAX_REQUESTS) {
    rateLimitStore.set(key, recent);
    return true;
  }

  recent.push(now);
  rateLimitStore.set(key, recent);
  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (isRateLimited(getRateLimitKey(request))) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  if (
    PROTECTED_PATHS.has(pathname) &&
    !request.cookies.get(SESSION_COOKIE)?.value
  ) {
    return NextResponse.json(
      { error: "API session required. Enter your API key to continue." },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
