import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { authServer } from "@/lib/auth/server";
import { syncUserFromSession } from "@/lib/auth/sync-user";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { data } = await authServer.getSession();

  if (!data) {
    redirect("/auth/sign-in");
  }

  await syncUserFromSession(data);

  return children;
}

