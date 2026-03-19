# Neon DB + Drizzle Documentation

## Overview

This document explains how DevStash uses **Neon Postgres** with **Drizzle ORM**, what schema was created, and how user records are synced from Neon Auth into the app database.

The current implementation includes:
- Drizzle schema + generated SQL migration
- Database client setup for Next.js App Router
- Idempotent seed script for system item types
- App-user sync from Neon Auth session to `users` table

---

## Packages

Installed database packages:

- `drizzle-orm`
- `drizzle-kit`
- `postgres`
- `zod`
- `tsx` (for seed script execution)
- `dotenv` (for `.env.local` loading in scripts/config)

---

## Environment Variables

Use `.env.local` (not committed) with:

- `DATABASE_URL`
- `NEON_AUTH_BASE_URL`
- `NEXT_PUBLIC_NEON_AUTH_URL`

Template file:
- `.env.local.example`

### DATABASE_URL format

Both of these are supported by the current setup:

1. Raw URL:
   - `postgresql://...`
2. Neon CLI-style string:
   - `psql 'postgresql://...'`

The project normalizes `DATABASE_URL` before use.

---

## Core DB Files

```
db/
├── index.ts                        # Drizzle client + shared schema export
├── schema.ts                       # Table definitions, enums, indexes, FKs
└── seeds/
    └── system-item-types.ts        # Idempotent seed for system item types

drizzle/
└── 0000_bitter_blazing_skull.sql   # Generated initial migration

lib/env/
├── server.ts                       # Zod validation for server env
└── normalize-database-url.ts       # Supports raw URL + psql format

drizzle.config.ts                   # Drizzle-kit config
```

---

## Drizzle Config

**File:** `drizzle.config.ts`

Configuration includes:
- `dialect: "postgresql"`
- `schema: "./db/schema.ts"`
- `out: "./drizzle"`
- DB credentials loaded from `.env.local`

Migration workflow uses `drizzle-kit generate` and `drizzle-kit migrate`.

---

## Schema Summary

**File:** `db/schema.ts`

### Enum

- `item_content_type`: `text | file | url`

### Tables

1. `users`
   - App-level profile/billing table keyed by Neon Auth user id
   - Fields: `id`, `email`, `is_pro`, `stripe_customer_id`, `stripe_subscription_id`, timestamps

2. `item_types`
   - Supports system and user-defined types
   - Fields: `id`, `name`, `icon`, `color`, `is_system`, `user_id`, timestamps
   - Unique index: `(user_id, name)`

3. `collections`
   - User-owned collections
   - Fields: `id`, `user_id`, `name`, `description`, `is_favorite`, `default_type_id`, timestamps

4. `items`
   - User-owned items with single-collection relation (v1)
   - Fields: content/file/url fields, flags (`is_favorite`, `is_pinned`), `type_id`, `collection_id`, timestamps

5. `tags`
   - User-owned tags
   - Unique index: `(user_id, name)`

6. `item_tags`
   - Many-to-many join table between items and tags
   - Composite PK: `(item_id, tag_id)`

### Foreign Key behavior

- User-owned rows use `ON DELETE CASCADE`
- `items.collection_id` uses `ON DELETE SET NULL`
- `items.type_id` uses `ON DELETE RESTRICT`

---

## Migration

Generated migration file:

- `drizzle/0000_bitter_blazing_skull.sql`

This migration creates:
- enum `item_content_type`
- all six tables
- foreign keys
- indexes and unique constraints

No `drizzle-kit push` is used in this workflow.

---

## Seed Data

**File:** `db/seeds/system-item-types.ts`

Seeded system item types (idempotent):
- snippet
- prompt
- note
- command
- file
- image
- link

The seed uses `onConflictDoNothing` by `item_types.id`, so reruns are safe.

---

## User Sync (Auth -> App DB)

Neon Auth stores identity users in the auth system.  
Your app `users` table is separate and must be synced explicitly.

### Current implementation

- **Sync function:** `lib/auth/sync-user.ts`
- **Called from:** `app/layout.tsx`
- Session is fetched with `disableCookieCache: true` to reduce stale session reads after OAuth callbacks.
- Sync uses `insert ... onConflictDoUpdate` keyed by `users.id`.

### Why this exists

- Sign-in can work in Neon Auth even when app `users` table is empty.
- App features (`is_pro`, Stripe IDs, user-scoped data) require a local app user row.

---

## NPM Scripts

`package.json` scripts added:

- `npm run db:generate` - generate SQL migration from schema
- `npm run db:migrate` - apply migrations to database
- `npm run db:seed` - seed system item types
- `npm run db:studio` - open Drizzle Studio

---

## Typical Local Workflow

1. Update `db/schema.ts`
2. Run `npm run db:generate`
3. Run `npm run db:migrate`
4. Run `npm run db:seed` (if needed)
5. Run `npm run build`

---

## Verification Queries (Neon SQL Editor)

Check synced users:

```sql
select id, email, is_pro, created_at, updated_at
from public.users
order by created_at desc;
```

Check system item types:

```sql
select id, name, icon, color, is_system, user_id
from public.item_types
order by name asc;
```

---

## Security Notes

⚠️ **SECURITY ALERT**

- Never expose `DATABASE_URL` to client code; server-only usage is required.
- Avoid logging raw session objects, tokens, or cookies in production logs.
- Keep all DB writes user-scoped and validated (Zod for external input).
- Continue migration-only schema changes; do not run destructive schema updates directly.

---

## Related Docs

- `docs/neon-auth.md`
- `docs/next-security-headers.md`
- `docs/project-spec.md`
- `docs/project-overview.md`
