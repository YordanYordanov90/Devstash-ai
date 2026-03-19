import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { normalizeDatabaseUrl } from "./lib/env/normalize-database-url";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL
  ? normalizeDatabaseUrl(process.env.DATABASE_URL)
  : "";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
