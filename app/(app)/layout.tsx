import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { authServer } from "@/lib/auth/server";
import { syncUserFromSession } from "@/lib/auth/sync-user";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { data } = await authServer.getSession();

  if (!data) {
    redirect("/auth/sign-in");
  }

  try {
    await syncUserFromSession(data);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to sync user from session", error);
    }
  }

  return children;
}

