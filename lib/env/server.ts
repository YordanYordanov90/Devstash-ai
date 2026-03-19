import { z } from "zod";
import { normalizeDatabaseUrl } from "@/lib/env/normalize-database-url";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

const parsed = serverEnvSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL
    ? normalizeDatabaseUrl(process.env.DATABASE_URL)
    : process.env.DATABASE_URL,
});

if (!parsed.success) {
  const formatted = parsed.error.flatten().fieldErrors;
  throw new Error(
    `Invalid server environment variables: ${JSON.stringify(formatted)}`,
  );
}

// Validate after normalization to catch malformed values early.
new URL(parsed.data.DATABASE_URL);

export const serverEnv = parsed.data;
