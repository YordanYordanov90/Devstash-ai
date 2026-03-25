import { ItemListRow } from "./ItemList";
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
      <h2 className="mb-3 text-lg font-semibold">Recent</h2>
      <ul className="space-y-1">
        {recentItems.map((item) => (
          <li key={item.id}>
            <ItemListRow
              item={item}
              itemTypes={itemTypes}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
