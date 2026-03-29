"use server";

import { z } from "zod";

import { authServer } from "@/lib/auth/server";
import { searchUserItems, type ItemSearchResult } from "@/lib/db/queries";

const searchQuerySchema = z
  .string()
  .trim()
  .min(2, "Type at least 2 characters")
  .max(100, "Search query is too long");

export type SearchItemsActionResult =
  | { success: true; data: ItemSearchResult[] }
  | { success: false; error: string };

export async function searchItemsAction(rawQuery: string): Promise<SearchItemsActionResult> {
  const parsed = searchQuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first?.message ?? "Invalid search" };
  }

  const { data: session } = await authServer.getSession();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "Not signed in" };
  }

  try {
    const data = await searchUserItems(userId, parsed.data, { limit: 20 });
    return { success: true, data };
  } catch {
    return { success: false, error: "Search failed. Try again." };
  }
}
