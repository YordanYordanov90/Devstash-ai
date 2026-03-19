import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

config({ path: ".env.local" });

import { normalizeDatabaseUrl } from "@/lib/env/normalize-database-url";
import { itemTypes } from "@/db/schema";

const SYSTEM_ITEM_TYPES = [
  { id: "sys_snippet", name: "snippet", icon: "code", color: "#3b82f6" },
  { id: "sys_prompt", name: "prompt", icon: "sparkles", color: "#8b5cf6" },
  { id: "sys_note", name: "note", icon: "sticky-note", color: "#fde047" },
  { id: "sys_command", name: "command", icon: "terminal", color: "#f97316" },
  { id: "sys_file", name: "file", icon: "file", color: "#6b7280" },
  { id: "sys_image", name: "image", icon: "image", color: "#ec4899" },
  { id: "sys_link", name: "link", icon: "link", color: "#10b981" },
] as const;

async function seedSystemItemTypes() {
  const databaseUrl = process.env.DATABASE_URL
    ? normalizeDatabaseUrl(process.env.DATABASE_URL)
    : "";

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing in .env.local");
  }

  const sql = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle(sql);

  await db
    .insert(itemTypes)
    .values(
      SYSTEM_ITEM_TYPES.map((itemType) => ({
        ...itemType,
        isSystem: true,
        userId: null,
      })),
    )
    .onConflictDoNothing({ target: itemTypes.id });

  await sql.end();
}

seedSystemItemTypes()
  .then(() => {
    console.log("System item types seeded.");
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("Failed to seed system item types.", error);
    process.exit(1);
  });
