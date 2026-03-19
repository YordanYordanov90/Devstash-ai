import { authApiHandler } from "@neondatabase/auth/next/server";

type RouteHandler = (req: Request, ctx: unknown) => Response | Promise<Response>;

const handlers: { GET: RouteHandler; POST: RouteHandler } = (() => {
  if (!process.env.NEON_AUTH_BASE_URL) {
    const missingEnv: RouteHandler = () =>
      new Response("NEON_AUTH_BASE_URL is not set.", { status: 500 });
    return { GET: missingEnv, POST: missingEnv };
  }

  return authApiHandler() as unknown as { GET: RouteHandler; POST: RouteHandler };
})();

export const { GET, POST } = handlers;

