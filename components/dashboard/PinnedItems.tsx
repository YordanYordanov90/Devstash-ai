import { Pin } from "lucide-react";
import { ItemGalleryCard } from "./ItemGalleryCard";
import type { ItemInfo, ItemTagInfo, ItemTypeInfo, TagInfo } from "@/types/dashboard";

interface PinnedItemsProps {
  items: ItemInfo[];
  itemTypes: ItemTypeInfo[];
  tags?: TagInfo[];
  itemTags?: ItemTagInfo[];
}

export function PinnedItems({
  items,
  itemTypes,
  tags = [],
  itemTags = [],
}: PinnedItemsProps) {
  const pinnedItems = items.filter((i) => i.isPinned);
  const tagNameByTagId = new Map(tags.map((tag) => [tag.id, tag.name]));
  const tagNamesByItemId = new Map<string, string[]>();
  for (const itemTag of itemTags) {
    const tagName = tagNameByTagId.get(itemTag.tagId);
    if (!tagName) {
      continue;
    }
    const existing = tagNamesByItemId.get(itemTag.itemId) ?? [];
    existing.push(tagName);
    tagNamesByItemId.set(itemTag.itemId, existing);
  }

  if (pinnedItems.length === 0) {
    return (
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Pin className="size-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Pinned</h2>
        </div>
        <p className="text-sm text-muted-foreground">No pinned items.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Pin className="size-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Pinned</h2>
      </div>
      <ul
        role="list"
        className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3"
      >
        {pinnedItems.map((item) => (
          <li key={item.id}>
            <ItemGalleryCard
              item={item}
              itemTypes={itemTypes}
              tagNames={tagNamesByItemId.get(item.id) ?? []}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
