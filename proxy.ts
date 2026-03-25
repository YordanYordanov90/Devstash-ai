import { neonAuthMiddleware } from "@neondatabase/auth/next/server";
import { getIpFromHeaders, hasRateLimitEnv, limitProtectedRequest } from "@/lib/security/rate-limit";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Next.js 16 Proxy (formerly middleware): early session check for app shell routes only.
 * `neonAuthMiddleware` redirects when there is no session; its internal skips do not include `/`,
 * so the matcher must stay narrow — otherwise anonymous users would be sent away from the landing page.
 *
 * Authoritative protection remains in `app/(app)/layout.tsx` (getSession + redirect + sync).
 */
function createProxyHandler(): (request: NextRequest) => Promise<NextResponse> {
  if (!process.env.NEON_AUTH_BASE_URL) {
    return async () => NextResponse.next();
  }
  return neonAuthMiddleware({ loginUrl: "/auth/sign-in" });
}

const proxyHandler = createProxyHandler();

export async function proxy(request: NextRequest, _event: NextFetchEvent) {
  if (hasRateLimitEnv()) {
    const limitResult = await limitProtectedRequest(
      {
        pathname: request.nextUrl.pathname,
        method: request.method,
        ip: getIpFromHeaders(request.headers),
      },
      "fail-open"
    );

    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429, headers: limitResult.headers }
      );
    }

    const proxiedResponse = await proxyHandler(request);
    for (const [header, value] of Object.entries(limitResult.headers)) {
      proxiedResponse.headers.set(header, value);
    }
    return proxiedResponse;
  }

  return proxyHandler(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/collections/:path*",
    "/items/:path*",
    "/item/:path*",
  ],
};
