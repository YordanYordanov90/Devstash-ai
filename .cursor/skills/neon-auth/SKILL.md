---
name: neon-auth
description: Implements authentication using @neondatabase/auth or @neondatabase/neon-js with secure Next.js App Router patterns (route handlers, providers, AuthView). Use when adding Neon Auth, wiring auth routes/UI, using createAuthClient/authApiHandler, or troubleshooting Neon Auth sessions in TypeScript/React/Next.js.
globs:
  - "*.ts"
  - "*.tsx"
alwaysApply: false
---

# Neon Auth (Neon Database)

Use this skill whenever implementing authentication with **`@neondatabase/auth`** or **`@neondatabase/neon-js`** (auth + Data API), especially in **Next.js App Router**.

## Package choice

- **Auth only (preferred default)**: `@neondatabase/auth`
- **Auth + Data API**: `@neondatabase/neon-js` (only if you also need the Data API)

## Next.js App Router baseline (recommended)

1. **Route handler**: expose Neon’s auth handler from `app/api/auth/[...path]/route.ts` via `authApiHandler()` from `@neondatabase/auth/next`.
2. **Auth client**: create a singleton client in `lib/auth/client.ts` using `createAuthClient()` from `@neondatabase/auth/next`.
3. **UI**: prefer prebuilt **`AuthView`** for auth pages and wrap the app with **`NeonAuthUIProvider`** (client component). Import `@neondatabase/auth/ui/css` once.

## Client vs server rules

- **Hooks require client components**: any use of `authClient.useSession()` must be in a `"use client"` component.
- **Prefer server-side reads**: when possible in Server Components / server actions, use async session reads (no hooks).

## Error handling expectations

- Treat all auth responses as **untrusted** until checked.
- Map known error codes to user-safe messages; avoid leaking internals.
- Never log session tokens or secrets.

## Common mistakes to avoid (high-signal)

- Importing `BetterAuthReactAdapter` from the wrong path (must be `@neondatabase/auth/react/adapters`).
- Forgetting to call the adapter factory (`BetterAuthReactAdapter()`).
- Missing the UI CSS import (`@neondatabase/auth/ui/css`).
- Building custom sign-in forms before trying `AuthView`.

## Reference (full guide)

- For complete patterns, paths, env vars, and UI usage, see [`NEON_AUTH_GUIDELINES.md`](NEON_AUTH_GUIDELINES.md).
