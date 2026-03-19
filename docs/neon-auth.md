# Neon Auth Documentation

## Overview

DevStash uses **Neon Auth** (`@neondatabase/auth`) for authentication in a Next.js App Router setup.

This implementation provides:
- **Google OAuth** sign-in (enabled via `NeonAuthUIProvider` + Neon Console provider config)
- Pre-built auth UI routes under `/auth/*` via `AuthView`
- A server-side protected route group for the main app (`/(app)/*`)

---

## Packages

- **Auth SDK**: `@neondatabase/auth`

> Note: the installed version in this repo is `@neondatabase/auth@0.1.0-beta.21` (at the time of integration).

---

## Environment Variables

Create `.env.local` (do not commit) using the template:

- **File:** `.env.local.example`

Required variables:
- `NEON_AUTH_BASE_URL` (server-side)
- `NEXT_PUBLIC_NEON_AUTH_URL` (client-side)

Both are typically the same Neon Auth URL from the Neon Console → Auth tab.

---

## Routes

### Auth API proxy

Neon Auth UI talks to your app at `/api/auth/*`, and the app proxies requests to Neon’s Auth endpoint.

- **Route handler:** `app/api/auth/[...path]/route.ts`
- **Resulting route:** `/api/auth/*`

**Important implementation detail (version-specific):**
In `@neondatabase/auth@0.1.0-beta.21`, `authApiHandler()` is exported from:
- `@neondatabase/auth/next/server`

not from `@neondatabase/auth/next`.

The route file also contains an **env guard** so `next build` can run even if
`NEON_AUTH_BASE_URL` isn’t set locally (the handler otherwise throws during build-time evaluation).

---

### Auth UI pages

All auth views are served from a single catch-all page using Neon’s `AuthView`.

- **Auth page:** `app/auth/[path]/page.tsx`
- **Routes:** `/auth/sign-in`, `/auth/sign-up`, `/auth/forgot-password`, `/auth/magic-link`, etc.

This page uses `authViewPaths` to `generateStaticParams()` so Next can SSG the known auth paths.

The page wraps `AuthView` in a centered container so forms appear in the middle of the screen.

---

## UI Provider (NeonAuthUIProvider)

Neon’s prebuilt UI components require the provider wrapper.

- **Provider file:** `app/auth-provider.tsx`
- **Wrapped in:** `app/layout.tsx`

Provider responsibilities:
- Supplies `authClient`
- Hooks navigation into Next (`navigate`, `replace`)
- Refreshes RSC when session changes (`onSessionChange={() => router.refresh()}`)
- Declares visible OAuth providers (e.g. `google`)

---

## Styling

Neon Auth UI can be styled via CSS variables and Tailwind.

This project uses Tailwind v4, so Neon UI styling is imported via the Tailwind-layer stylesheet:

- **File:** `app/globals.css`
- **Import:** `@import "@neondatabase/auth/ui/tailwind";`

Do **not** import both:
- `@neondatabase/auth/ui/css`
- `@neondatabase/auth/ui/tailwind`

Importing both duplicates styles and may cause unexpected UI changes.

---

## Route Protection (Authenticated App Area)

The main app routes are protected server-side using a route group:

- **Protected layout:** `app/(app)/layout.tsx`
- **Auth check:** `authServer.getSession()`
- **Redirect:** unauthenticated users → `/auth/sign-in`

This prevents client-side auth bypass, because the redirect happens in a Server Component layout.

---

## File/Route Structure

```
app/
├── api/auth/[...path]/route.ts   # /api/auth/* proxy to Neon Auth
├── auth/[path]/page.tsx          # /auth/* via AuthView
├── auth-provider.tsx             # NeonAuthUIProvider wrapper (client)
├── (app)/layout.tsx              # Protected route group layout (server)
└── (app)/
    ├── dashboard/...
    ├── collections/...
    ├── items/...
    └── item/...

lib/auth/
├── client.ts                     # createAuthClient() singleton (client hooks)
└── server.ts                     # createAuthServer() singleton (server session checks)
```

---

## App UI Integration

### Landing header

- **File:** `components/landing/Navigation.tsx`
- Uses Neon UI:
  - `SignedIn` / `SignedOut` for conditional rendering
  - `UserButton` for the user dropdown
- Signed-out buttons link to:
  - `/auth/sign-in`
  - `/auth/sign-up`

### Dashboard top bar

- **File:** `components/dashboard/TopBar.tsx`
- Renders `UserButton` in the right-side action area.

---

## Common UI Tweaks

### Make `UserButton` avatar-only (recommended for headers)

In this version of the UI, `UserButton` does **not** default to icon-only.
Pass `size="icon"` to render only the avatar trigger.

Example:
```tsx
<UserButton size="icon" />
```

To shrink the avatar in tight headers, use `className` on `UserButton` (applied to the avatar):
```tsx
<UserButton size="icon" className="size-8!" />
```

---

## Neon Console Checklist

To make Google sign-in work:
- Enable **Google** under **OAuth providers**
- Ensure your **allowed domains** / localhost settings allow your dev and prod URLs
- Configure OAuth redirect/callback settings in Neon as required

---

## Security Notes

⚠️ **SECURITY ALERT**

- **Server-side gating is required.** The protected `(app)` layout enforces auth before rendering app routes.
- **Avoid open redirects.** Redirect targets are fixed to `/auth/sign-in` in the protected layout.
- **Do not log session tokens or cookies.** Neon Auth uses cookies for session state; keep them out of logs.

