# Next.js Security Headers Documentation

## Overview

This document explains the security headers configured in `next.config.ts` and why they are important for DevStash.

The goal of these headers is to add a browser-level protection layer on top of application auth (Neon Auth), route protection, and server-side checks.

---

## Where Headers Are Configured

- **File:** `next.config.ts`
- **Scope:** `source: "/(.*)"` (applies to all routes)

Headers are returned via `async headers()` in Next.js and attached to responses automatically.

---

## Configured Headers

### 1) `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

Forces browsers to use HTTPS for all future requests to the site for 2 years.

**Why it matters:**
- Prevents protocol downgrade attacks and cookie hijacking over HTTP.

**Caveats:**
- `includeSubDomains` applies to all subdomains. `preload` submits the site to browser preload lists.
- The Next.js dev server runs on HTTP. Browsers that cache this header from a production visit may refuse to load `localhost` over HTTP. If deploying to Vercel, the platform adds HSTS automatically, so this header can optionally be removed from `next.config.ts`.

---

### 2) `X-Frame-Options: DENY`

Prevents the site from being embedded in an iframe.

**Why it matters:**
- Mitigates clickjacking attacks where users are tricked into clicking hidden UI.

---

### 3) `X-Content-Type-Options: nosniff`

Tells browsers not to MIME-sniff responses.

**Why it matters:**
- Prevents content-type confusion attacks (e.g., treating data as executable script).

---

### 4) `Referrer-Policy: strict-origin-when-cross-origin`

Controls how much referrer data is sent to other origins.

**Behavior:**
- Same-origin: full referrer
- Cross-origin HTTPS: only origin
- Downgrade to HTTP: no referrer

**Why it matters:**
- Reduces accidental leakage of sensitive URL details.

---

### 5) `Permissions-Policy`

Configured as:
- `camera=()`
- `microphone=()`
- `geolocation=()`
- `interest-cohort=()`

**Why it matters:**
- Explicitly disables browser features the app does not use.
- Reduces attack surface and privacy exposure.

---

### 6) `X-DNS-Prefetch-Control: off`

Disables browser DNS prefetching.

**Why it matters:**
- Reduces background external DNS lookups (privacy hardening).

---

### 7) `Content-Security-Policy` (CSP)

The CSP in `next.config.ts` is the most important and most sensitive security header.

Current directives:

- `default-src 'self'`
- `script-src 'self' 'unsafe-inline' https://accounts.google.com`
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.neon.tech`
- `font-src 'self' data: https://fonts.gstatic.com`
- `connect-src 'self' https://*.neon.tech https://*.neonauth.c-2.eu-central-1.aws.neon.tech https://accounts.google.com`
- `frame-src https://accounts.google.com`
- `frame-ancestors 'none'`
- `base-uri 'self'`
- `form-action 'self' https://accounts.google.com`
- `object-src 'none'`
- `upgrade-insecure-requests`

### Why these values are used

- **Google OAuth support**
  - `script-src`, `frame-src`, `form-action`, and `connect-src` include `accounts.google.com` for sign-in flows.
- **Neon Auth support**
  - `connect-src` includes Neon/Auth domains needed by auth client API requests.
- **Next.js/Tailwind/Neon UI compatibility**
  - `style-src 'unsafe-inline'` is required for current styling pipeline/components.
  - `script-src 'unsafe-inline'` is included to avoid breaking framework/runtime inline scripts.
- **Tightened `img-src`**
  - Only allows images from `lh3.googleusercontent.com` (Google profile avatars) and `*.neon.tech` (Neon-hosted images), plus `data:` URIs and `blob:` URLs used internally. The previous wildcard `https:` was removed to prevent loading images from arbitrary origins.
- **`object-src 'none'`**
  - Blocks Flash, Java applets, and other plugin-based embeds. No modern app needs this; always set to `'none'`.
- **`upgrade-insecure-requests`**
  - Instructs browsers to automatically upgrade any HTTP sub-resource requests to HTTPS. Pairs well with HSTS.

---

## Security Caveats and Tradeoffs

### CSP is a tradeoff

`'unsafe-inline'` in scripts/styles lowers CSP strictness.

**Why still used here:**
- It avoids breaking core app functionality and auth UI in the current setup.

**Hardening path later:**
- Move to nonce/hash-based script policy for stricter CSP once app behavior is fully mapped.

---

### OAuth can break with strict CSP

If CSP is too strict, Google OAuth may fail at popup/callback time.

**Symptoms:**
- Browser console errors: `Refused to ... due to Content Security Policy`

**Fix approach:**
- Add only the minimal blocked origin to the relevant CSP directive.

---

## Headers Intentionally Not Used

### `X-XSS-Protection`

Actively removed. Chrome removed its XSS Auditor in 2019, and no modern browser uses this header. Worse, in older browsers the auditor could be exploited to *introduce* XSS via selective script blocking (XSS Auditor bypass attacks). CSP is the correct replacement.

### `Cross-Origin-Embedder-Policy: require-corp`

Not included because it is strict and can break third-party auth/integrations unless cross-origin isolation is explicitly needed.

---

## Relationship to Authentication

These headers do **not** replace authentication or authorization.

They are defense-in-depth controls that complement:
- Neon Auth session management
- Server-side route protection in `app/(app)/layout.tsx`
- API route auth checks

---

## Testing Checklist

After header changes:

1. Verify public pages load (`/`)
2. Verify auth pages load (`/auth/sign-in`, `/auth/sign-up`)
3. Verify Google OAuth still completes successfully
4. Verify protected routes redirect correctly when signed out
5. Check browser console for CSP violations

---

## File Reference

Primary config:
- `next.config.ts`

Related auth/security docs:
- `docs/neon-auth.md`

