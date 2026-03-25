import { describe, expect, it } from "vitest";
import { normalizeDatabaseUrl } from "./normalize-database-url";

describe("normalizeDatabaseUrl", () => {
  it("trims whitespace", () => {
    expect(normalizeDatabaseUrl("  postgres://u:p@h:5432/db  ")).toBe(
      "postgres://u:p@h:5432/db"
    );
  });

  it("removes leading `psql` prefix (case-insensitive)", () => {
    expect(normalizeDatabaseUrl("psql postgres://u:p@h:5432/db")).toBe(
      "postgres://u:p@h:5432/db"
    );
    expect(normalizeDatabaseUrl("PSQL   postgres://u:p@h:5432/db")).toBe(
      "postgres://u:p@h:5432/db"
    );
  });

  it("strips matching surrounding quotes", () => {
    expect(normalizeDatabaseUrl("'postgres://u:p@h:5432/db'")).toBe(
      "postgres://u:p@h:5432/db"
    );
    expect(normalizeDatabaseUrl('"postgres://u:p@h:5432/db"')).toBe(
      "postgres://u:p@h:5432/db"
    );
  });

  it("does not strip mismatched quotes", () => {
    expect(normalizeDatabaseUrl("'postgres://u:p@h:5432/db\"")).toBe(
      "'postgres://u:p@h:5432/db\""
    );
  });
});

