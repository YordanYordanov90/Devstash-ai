import { ItemGalleryCard } from "./ItemGalleryCard";
import type { ItemInfo, ItemTypeInfo } from "@/types/dashboard";

interface RecentItemsProps {
  items: ItemInfo[];
  itemTypes: ItemTypeInfo[];
}

export function RecentItems({ items, itemTypes }: RecentItemsProps) {
  const recentItems = [...items]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-foreground">Recent</h2>
      <ul
        role="list"
        className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3"
      >
        {recentItems.map((item) => (
          <li key={item.id}>
            <ItemGalleryCard item={item} itemTypes={itemTypes} />
          </li>
        ))}
      </ul>
    </section>
  );
}
