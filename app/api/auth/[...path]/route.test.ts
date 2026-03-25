import { describe, expect, it, vi } from "vitest";

type LimitResult =
  | { allowed: true; headers: Record<string, string> }
  | { allowed: false; headers: Record<string, string> };

describe("app/api/auth/[...path]/route.ts", () => {
  it("returns 500 when NEON_AUTH_BASE_URL is missing", async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv("NEON_AUTH_BASE_URL", "");

    // Avoid loading the real module (which pulls in Next internals).
    vi.doMock("@neondatabase/auth/next/server", () => {
      return {
        authApiHandler: () => ({
          GET: () => new Response("ok"),
          POST: () => new Response("ok"),
        }),
      };
    });

    const route = await import("./route");
    const response = await route.GET(new Request("https://example.test/api/auth/foo"), {
      params: Promise.resolve({ path: ["foo"] }),
    });

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toContain("NEON_AUTH_BASE_URL is not set");
  });

  it("returns 429 and includes rate-limit headers when blocked", async () => {
    vi.resetModules();
    vi.stubEnv("NEON_AUTH_BASE_URL", "https://neon-auth.example.test");

    const limitResult: LimitResult = {
      allowed: false,
      headers: { "Retry-After": "60", "X-RateLimit-Limit": "5" },
    };

    vi.doMock("@/lib/security/rate-limit", async () => {
      return {
        getIpFromHeaders: () => "203.0.113.10",
        limitAuthRequest: async () => limitResult,
      };
    });

    vi.doMock("@neondatabase/auth/next/server", () => {
      return {
        authApiHandler: () => ({
          GET: () => new Response("ok"),
          POST: () => new Response("ok"),
        }),
      };
    });

    const route = await import("./route");
    const response = await route.GET(new Request("https://example.test/api/auth/foo"), {
      params: Promise.resolve({ path: ["foo"] }),
    });

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
  });

  it("forwards to handler and appends rate-limit headers when allowed", async () => {
    vi.resetModules();
    vi.stubEnv("NEON_AUTH_BASE_URL", "https://neon-auth.example.test");

    const limitResult: LimitResult = {
      allowed: true,
      headers: { "X-RateLimit-Limit": "5", "X-RateLimit-Remaining": "4" },
    };

    const handler = vi.fn(async () => new Response("from-handler", { status: 201 }));

    vi.doMock("@/lib/security/rate-limit", async () => {
      return {
        getIpFromHeaders: () => "203.0.113.10",
        limitAuthRequest: async () => limitResult,
      };
    });

    vi.doMock("@neondatabase/auth/next/server", () => {
      return {
        authApiHandler: () => ({
          GET: handler,
          POST: handler,
        }),
      };
    });

    const route = await import("./route");
    const response = await route.GET(new Request("https://example.test/api/auth/foo"), {
      params: Promise.resolve({ path: ["foo"] }),
    });

    expect(handler).toHaveBeenCalledOnce();
    expect(response.status).toBe(201);
    await expect(response.text()).resolves.toBe("from-handler");
    expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("4");
  });
});

