"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        This page doesn&apos;t exist or may have moved.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go home
        </Link>
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

