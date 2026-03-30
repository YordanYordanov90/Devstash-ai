"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        We couldn&apos;t load your stash
      </h1>
      <p className="text-sm text-muted-foreground">
        This is usually temporary. Try again, or go back to the dashboard.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
        <Link
          href="/dashboard"
          className="rounded-md border border-white/10 bg-card/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-card/70"
        >
          Dashboard
        </Link>
      </div>
    </main>
  );
}

