import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type LimitMode = "fail-open" | "fail-closed";
type PolicyName = "authStrict" | "authBurst" | "protectedPages";

interface RateLimitContext {
  pathname: string;
  method: string;
  ip: string;
}

interface LimitSuccessResult {
  allowed: true;
  headers: Record<string, string>;
}

interface LimitBlockedResult {
  allowed: false;
  headers: Record<string, string>;
  retryAfterSeconds: number;
}

type LimitResult = LimitSuccessResult | LimitBlockedResult;

const hasUpstashEnv =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = hasUpstashEnv ? Redis.fromEnv() : null;

const RATELIMIT_PREFIX = "devstash:rl";

const ratelimits: Record<PolicyName, Ratelimit | null> = {
  authStrict: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        prefix: `${RATELIMIT_PREFIX}:auth:strict`,
        analytics: true,
      })
    : null,
  authBurst: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "10 m"),
        prefix: `${RATELIMIT_PREFIX}:auth:burst`,
        analytics: true,
      })
    : null,
  protectedPages: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.fixedWindow(120, "1 m"),
        prefix: `${RATELIMIT_PREFIX}:protected`,
        analytics: true,
      })
    : null,
};

function background(pending: Promise<unknown> | undefined): void {
  if (!pending) {
    return;
  }
  void pending.catch((error: unknown) => {
    console.error("[ratelimit] analytics dispatch failed", error);
  });
}

function buildHeaders(limit: number, remaining: number, reset: number): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(reset),
  };
}

function getClientIp(headers: Headers, fallbackIp = "127.0.0.1"): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return fallbackIp;
}

function getRouteGroup(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/collections")) return "collections";
  if (pathname.startsWith("/items")) return "items";
  if (pathname.startsWith("/item")) return "item";
  return "other";
}

function authIdentifier(context: RateLimitContext): string {
  return `${context.ip}:${context.method}:${context.pathname}`;
}

function protectedIdentifier(context: RateLimitContext): string {
  return `${context.ip}:${getRouteGroup(context.pathname)}`;
}

function retryAfterFromReset(reset: number): number {
  const seconds = Math.ceil((reset - Date.now()) / 1000);
  return seconds > 0 ? seconds : 1;
}

export function hasRateLimitEnv(): boolean {
  return hasUpstashEnv;
}

export function getIpFromHeaders(headers: Headers): string {
  return getClientIp(headers);
}

export async function limitAuthRequest(context: RateLimitContext): Promise<LimitResult> {
  if (!hasUpstashEnv || !ratelimits.authStrict || !ratelimits.authBurst) {
    return { allowed: true, headers: {} };
  }

  const identifier = authIdentifier(context);
  const [strictResult, burstResult] = await Promise.all([
    ratelimits.authStrict.limit(identifier),
    ratelimits.authBurst.limit(identifier),
  ]);

  background(strictResult.pending);
  background(burstResult.pending);

  const strictHeaders = buildHeaders(
    strictResult.limit,
    strictResult.remaining,
    strictResult.reset
  );

  if (!strictResult.success) {
    return {
      allowed: false,
      headers: {
        ...strictHeaders,
        "Retry-After": String(retryAfterFromReset(strictResult.reset)),
      },
      retryAfterSeconds: retryAfterFromReset(strictResult.reset),
    };
  }

  if (!burstResult.success) {
    const burstHeaders = buildHeaders(burstResult.limit, burstResult.remaining, burstResult.reset);
    return {
      allowed: false,
      headers: {
        ...strictHeaders,
        ...burstHeaders,
        "Retry-After": String(retryAfterFromReset(burstResult.reset)),
      },
      retryAfterSeconds: retryAfterFromReset(burstResult.reset),
    };
  }

  return { allowed: true, headers: strictHeaders };
}

export async function limitProtectedRequest(
  context: RateLimitContext,
  mode: LimitMode
): Promise<LimitResult> {
  if (!hasUpstashEnv || !ratelimits.protectedPages) {
    return { allowed: true, headers: {} };
  }

  try {
    const result = await ratelimits.protectedPages.limit(protectedIdentifier(context));
    background(result.pending);

    const headers = buildHeaders(result.limit, result.remaining, result.reset);

    if (!result.success) {
      return {
        allowed: false,
        headers: {
          ...headers,
          "Retry-After": String(retryAfterFromReset(result.reset)),
        },
        retryAfterSeconds: retryAfterFromReset(result.reset),
      };
    }

    return { allowed: true, headers };
  } catch (error) {
    console.error("[ratelimit] protected limiter failed", error);
    if (mode === "fail-open") {
      return { allowed: true, headers: {} };
    }
    return {
      allowed: false,
      headers: { "Retry-After": "60" },
      retryAfterSeconds: 60,
    };
  }
}
