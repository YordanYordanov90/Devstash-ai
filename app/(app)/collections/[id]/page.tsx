import Link from "next/link";
import { Star } from "lucide-react";
import { z } from "zod";

import { authServer } from "@/lib/auth/server";
import {
  getCollectionById,
  getItemDrawerData,
  getSystemItemTypes,
  getUserItemsByCollection,
} from "@/lib/db/queries";
import { ItemGalleryCard } from "@/components/dashboard/ItemGalleryCard";
import { ItemDrawer } from "@/components/dashboard/ItemDrawer";
import type { ItemInfo, ItemTypeInfo } from "@/types/dashboard";

const collectionIdParamSchema = z.object({
  id: z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
});

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parsedParams = collectionIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Invalid collection id.</p>
        <Link href="/dashboard" className="text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const { data: session } = await authServer.getSession();
  const userId = session?.user?.id ?? null;
  if (!userId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Please sign in.</p>
        <Link href="/auth/sign-in" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    );
  }

  const collectionId = parsedParams.data.id;
  const collection = await getCollectionById(userId, collectionId);
  if (!collection) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Collection not found.</p>
        <Link href="/dashboard" className="text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const resolvedSearchParams = await searchParams;
  const itemId =
    typeof resolvedSearchParams?.item === "string" &&
    resolvedSearchParams.item.trim().length > 0
      ? resolvedSearchParams.item
      : null;

  const [itemTypes, items] = await Promise.all([
    getSystemItemTypes(),
    getUserItemsByCollection(userId, collectionId, { limit: 200 }),
  ]);

  const drawerItem = itemId ? await getItemDrawerData(userId, itemId) : null;

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {collection.name}
            </h1>
            {collection.isFavorite && (
              <Star className="size-5 shrink-0 fill-amber-500 text-amber-500" />
            )}
          </div>
          {collection.description && (
            <p className="mt-1 text-muted-foreground">{collection.description}</p>
          )}
          <p className="mt-2 text-sm text-muted-foreground tabular-nums">
            {items.length} item{items.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-primary hover:underline shrink-0">
          Back
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-card/60 p-8">
          <p className="text-center text-sm text-muted-foreground">
            No items in this collection yet.
          </p>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Add items to this collection from the item editor.
          </p>
        </div>
      ) : (
        <ul
          role="list"
          className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((it) => (
            <li key={it.id}>
              <ItemGalleryCard
                item={it as ItemInfo}
                itemTypes={itemTypes as ItemTypeInfo[]}
              />
            </li>
          ))}
        </ul>
      )}

      <ItemDrawer
        key={itemId ?? ""}
        isOpen={Boolean(itemId)}
        itemTypes={itemTypes as ItemTypeInfo[]}
        item={drawerItem}
      />
    </div>
  );
}