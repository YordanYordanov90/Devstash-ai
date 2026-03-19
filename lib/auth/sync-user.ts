import { sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";

const sessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(1),
});

type SyncFailReason =
  | "no_session_object"
  | "no_user_object"
  | "invalid_user_payload";

function extractSessionUser(rawSessionData: unknown) {
  if (!rawSessionData || typeof rawSessionData !== "object") {
    return {
      success: false as const,
      reason: "no_session_object" as SyncFailReason,
    };
  }

  const sessionRecord = rawSessionData as Record<string, unknown>;
  const sourceRecord =
    sessionRecord.data && typeof sessionRecord.data === "object"
      ? (sessionRecord.data as Record<string, unknown>)
      : sessionRecord;
  const rawUser =
    sourceRecord.user && typeof sourceRecord.user === "object"
      ? sourceRecord.user
      : sourceRecord.session && typeof sourceRecord.session === "object"
        ? (sourceRecord.session as Record<string, unknown>).user
        : null;

  if (!rawUser) {
    return {
      success: false as const,
      reason: "no_user_object" as SyncFailReason,
    };
  }

  const userRecord = rawUser as Record<string, unknown>;
  const parsed = sessionUserSchema.safeParse({
    id: userRecord.id,
    email: userRecord.email,
  });

  if (!parsed.success) {
    return {
      success: false as const,
      reason: "invalid_user_payload" as SyncFailReason,
    };
  }

  return { success: true as const, data: parsed.data };
}

export async function syncUserFromSession(rawSessionData: unknown) {
  const parsed = extractSessionUser(rawSessionData);

  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Skipped user sync:", parsed.reason);
    }
    return { success: false as const, reason: parsed.reason };
  }

  await db
    .insert(users)
    .values({
      id: parsed.data.id,
      email: parsed.data.email,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: parsed.data.email,
        updatedAt: sql`now()`,
      },
    });

  return { success: true as const };
}
