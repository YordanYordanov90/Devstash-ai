import { describe, expect, it, vi } from "vitest";

describe("lib/security/rate-limit.ts", () => {
  it("getIpFromHeaders uses x-forwarded-for first", async () => {
    vi.resetModules();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    const { getIpFromHeaders } = await import("./rate-limit");
    const headers = new Headers({ "x-forwarded-for": "203.0.113.1, 70.41.3.18" });
    expect(getIpFromHeaders(headers)).toBe("203.0.113.1");
  });

  it("getIpFromHeaders falls back to x-real-ip", async () => {
    vi.resetModules();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    const { getIpFromHeaders } = await import("./rate-limit");
    const headers = new Headers({ "x-real-ip": "203.0.113.9" });
    expect(getIpFromHeaders(headers)).toBe("203.0.113.9");
  });

  it("limitAuthRequest allows when Upstash env is missing", async () => {
    vi.resetModules();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    const { limitAuthRequest } = await import("./rate-limit");
    const result = await limitAuthRequest({
      pathname: "/api/auth/foo",
      method: "GET",
      ip: "203.0.113.10",
    });
    expect(result.allowed).toBe(true);
    expect(result.headers).toEqual({});
  });

  it("limitProtectedRequest returns fail-open when limiter throws and mode=fail-open", async () => {
    vi.resetModules();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.test");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");

    vi.doMock("@upstash/redis", () => ({
      Redis: { fromEnv: () => ({}) },
    }));

    vi.doMock("@upstash/ratelimit", () => {
      class Ratelimit {
        static fixedWindow() {
          return {};
        }
        static slidingWindow() {
          return {};
        }
        limit() {
          throw new Error("boom");
        }
        constructor() {}
      }
      return { Ratelimit };
    });

    const { limitProtectedRequest } = await import("./rate-limit");
    const result = await limitProtectedRequest(
      {
        pathname: "/dashboard",
        method: "GET",
        ip: "203.0.113.10",
      },
      "fail-open"
    );

    expect(result.allowed).toBe(true);
    expect(result.headers).toEqual({});
  });

  it("limitProtectedRequest returns fail-closed when limiter throws and mode=fail-closed", async () => {
    vi.resetModules();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.test");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");

    vi.doMock("@upstash/redis", () => ({
      Redis: { fromEnv: () => ({}) },
    }));

    vi.doMock("@upstash/ratelimit", () => {
      class Ratelimit {
        static fixedWindow() {
          return {};
        }
        static slidingWindow() {
          return {};
        }
        limit() {
          throw new Error("boom");
        }
        constructor() {}
      }
      return { Ratelimit };
    });

    const { limitProtectedRequest } = await import("./rate-limit");
    const result = await limitProtectedRequest(
      {
        pathname: "/dashboard",
        method: "GET",
        ip: "203.0.113.10",
      },
      "fail-closed"
    );

    expect(result.allowed).toBe(false);
    expect(result.headers["Retry-After"]).toBe("60");
    expect(result.retryAfterSeconds).toBe(60);
  });
});

