import Link from "next/link";
import { z } from "zod";

import { authServer } from "@/lib/auth/server";
import {
  getItemDrawerData,
  getItemTagsForItems,
  getSystemItemTypes,
  getUserItemsByType,
  getUserTags,
} from "@/lib/db/queries";
import { ItemGalleryCard } from "@/components/dashboard/ItemGalleryCard";
import { ItemDrawer } from "@/components/dashboard/ItemDrawer";
import { itemTypeToSlug } from "@/lib/utils";
import type { ItemInfo, ItemTagInfo, ItemTypeInfo } from "@/types/dashboard";

const itemSlugParamSchema = z.object({
  slug: z.string().min(1).max(128).regex(/^[a-z0-9-]+$/),
});

export default async function ItemsByTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parsedParams = itemSlugParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Invalid item type slug.</p>
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

  const { slug } = parsedParams.data;
  const itemTypes = await getSystemItemTypes();
  const itemType = itemTypes.find((t) => itemTypeToSlug(t.name) === slug);
  if (!itemType) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Item type not found.</p>
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

  const [items, allTags] = await Promise.all([
    getUserItemsByType(userId, itemType.id, { limit: 200 }),
    getUserTags(userId, { limit: 250 }),
  ]);

  const itemIds = items.map((i) => i.id);
  const itemTags = (await getItemTagsForItems(itemIds)) satisfies ItemTagInfo[];

  const tagNameByTagId = new Map(allTags.map((t) => [t.id, t.name]));
  const tagNamesByItemId = new Map<string, string[]>();
  for (const it of itemTags) {
    const name = tagNameByTagId.get(it.tagId);
    if (!name) continue;
    const existing = tagNamesByItemId.get(it.itemId) ?? [];
    existing.push(name);
    tagNamesByItemId.set(it.itemId, existing);
  }

  const drawerItem = itemId ? await getItemDrawerData(userId, itemId) : null;

  const displayName = itemType.name === "URL" ? "Links" : `${itemType.name}s`;

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {displayName}
          </h1>
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
            No {displayName.toLowerCase()} yet.
          </p>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Create a new item of this type from the dashboard.
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
                tagNames={tagNamesByItemId.get(it.id) ?? []}
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
