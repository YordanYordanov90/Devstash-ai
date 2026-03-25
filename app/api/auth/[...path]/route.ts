import { authApiHandler } from "@neondatabase/auth/next/server";
import { getIpFromHeaders, limitAuthRequest } from "@/lib/security/rate-limit";

type RouteHandler = (req: Request, ctx: unknown) => Response | Promise<Response>;
type RouteContext = { params: Promise<{ path: string[] }> };

function isRouteHandlers(
  value: unknown
): value is { GET: RouteHandler; POST: RouteHandler } {
  if (!value || typeof value !== "object") {
    return false;
  }
  const maybeHandlers = value as Record<string, unknown>;
  return (
    typeof maybeHandlers.GET === "function" &&
    typeof maybeHandlers.POST === "function"
  );
}

const handlers: { GET: RouteHandler; POST: RouteHandler } = (() => {
  if (!process.env.NEON_AUTH_BASE_URL) {
    const missingEnv: RouteHandler = () =>
      new Response("NEON_AUTH_BASE_URL is not set.", { status: 500 });
    return { GET: missingEnv, POST: missingEnv };
  }

  const resolvedHandlers = authApiHandler();
  if (!isRouteHandlers(resolvedHandlers)) {
    const invalidHandler: RouteHandler = () =>
      new Response("Neon auth handlers are misconfigured.", { status: 500 });
    return { GET: invalidHandler, POST: invalidHandler };
  }
  return resolvedHandlers;
})();

async function withAuthRateLimit(
  request: Request,
  method: "GET" | "POST",
  ctx: RouteContext,
  execute: RouteHandler
): Promise<Response> {
  const limitResult = await limitAuthRequest({
    pathname: new URL(request.url).pathname,
    method,
    ip: getIpFromHeaders(request.headers),
  });

  if (!limitResult.allowed) {
    return new Response("Too many requests.", {
      status: 429,
      headers: limitResult.headers,
    });
  }

  const response = await execute(request, ctx);
  for (const [header, value] of Object.entries(limitResult.headers)) {
    response.headers.set(header, value);
  }
  return response;
}

export async function GET(request: Request, ctx: RouteContext) {
  return withAuthRateLimit(request, "GET", ctx, handlers.GET);
}

export async function POST(request: Request, ctx: RouteContext) {
  return withAuthRateLimit(request, "POST", ctx, handlers.POST);
}

