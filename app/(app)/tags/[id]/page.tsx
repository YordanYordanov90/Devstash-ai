import Link from "next/link";
import { z } from "zod";

import { authServer } from "@/lib/auth/server";
import {
  getItemDrawerData,
  getItemTagsForItems,
  getSystemItemTypes,
  getUserItemsByTag,
  getUserTagById,
  getUserTags,
} from "@/lib/db/queries";
import { ItemListRow } from "@/components/dashboard/ItemList";
import { ItemDrawer } from "@/components/dashboard/ItemDrawer";
import type { ItemInfo, ItemTagInfo, ItemTypeInfo, TagInfo } from "@/types/dashboard";

const tagIdParamSchema = z.object({
  id: z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
});

export default async function TagDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parsedParams = tagIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Invalid tag id.</p>
        <Link href="/tags" className="text-primary hover:underline">
          Back to tags
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

  const tagId = parsedParams.data.id;
  const tag = await getUserTagById(userId, tagId);
  if (!tag) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Tag not found.</p>
        <Link href="/tags" className="text-primary hover:underline">
          Back to tags
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

  const [itemTypes, items, allTags] = await Promise.all([
    getSystemItemTypes(),
    getUserItemsByTag(userId, tagId, { limit: 200 }),
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

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {tag.name}
          </h1>
          <p className="text-muted-foreground tabular-nums">
            {items.length} item{items.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/tags" className="text-sm text-primary hover:underline">
          Back
        </Link>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items with this tag yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.id}>
              <ItemListRow
                item={it as ItemInfo}
                itemTypes={itemTypes as ItemTypeInfo[]}
                tags={allTags as TagInfo[]}
                itemTags={itemTags}
                tagNamesByItemId={tagNamesByItemId}
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