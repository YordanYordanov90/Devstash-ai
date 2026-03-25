import { afterEach, vi } from "vitest";

// Keep tests isolated and deterministic.
afterEach(() => {
  vi.unstubAllEnvs();
});

// Avoid accidental external calls from unit tests. If a test needs fetch,
// it should explicitly stub `globalThis.fetch`.
if (!("fetch" in globalThis)) {
  // Node 20+ provides fetch, but keep this defensive.
  // @ts-expect-error - allow defining fetch in tests when missing
  globalThis.fetch = undefined;
}

